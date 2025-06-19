import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createClient } from "redis";
import type { ClientState } from "@monorepo/shared/src/types";
import { REDIS_CHANNELS } from "@monorepo/shared/src/constants";
import { stateSlice, clientStateActionKeys } from "@monorepo/shared/src/reducers/clientStateReducer";
import dotenv from "dotenv";
import { configureStore } from "@reduxjs/toolkit";
import { createAdapter } from "@socket.io/redis-adapter";

dotenv.config();

const REDIS_SERVER = process.env.REDIS_SERVER || "redis://localhost:6379";
const activeRedisKeys = new Set<string>();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

const REDIS_KEY_PREFIX = "client:";

function getRedisKey(socketId: string) {
  return `${REDIS_KEY_PREFIX}${socketId}`;
}

function getInitialState(): ClientState {
  return {
    counters:[],
    error: undefined
  };
}

(async () => {
  const redisClient = createClient({ url: REDIS_SERVER });
  await redisClient.connect();

  const socketIOReduisPublisher = redisClient.duplicate();
  await socketIOReduisPublisher.connect();

  const socketIORedisSubscriber = redisClient.duplicate();
  await socketIORedisSubscriber.connect();

  const applicationRedisPublisher = redisClient.duplicate();
  await applicationRedisPublisher.connect();

  const applicationRedisSubscriber = redisClient.duplicate();
  await applicationRedisSubscriber.connect();

  await applicationRedisSubscriber.subscribe(REDIS_CHANNELS.STATE_UPDATES, async (message) => {
    console.log(`Received message on channel state_updates: ${message}`);

    const redisKey = getRedisKey(message);
    const state = await getState(redisKey);
    io.to(message).emit("state_updated", state);
  });

  async function getState(redisKey: string): Promise<ClientState> {
    const val = await redisClient.get(redisKey);
    return val ? JSON.parse(val) : getInitialState();
  }

  async function setState(redisKey: string, state: ClientState) {
    await redisClient.set(redisKey, JSON.stringify(state));
  }

  function publishStateUpdate(socketId: string) {
    applicationRedisPublisher.publish(REDIS_CHANNELS.STATE_UPDATES, socketId);
  }

  async function setStateAndPublish(
    socketId: string,
    state: ClientState
  ): Promise<void> {
    const redisKey = getRedisKey(socketId);
    await setState(redisKey, state);
    publishStateUpdate(socketId);
  }  

  io.adapter(createAdapter(socketIOReduisPublisher, socketIORedisSubscriber));
  
  io.on("connection", (socket) => {
    const redisKey = getRedisKey(socket.id);
    activeRedisKeys.add(redisKey);    

    socket.onAny(async (event, ...args) => {
      console.log(`Socket event: ${event}`, ...args);

      const excludedEvents = ["disconnect", "get_state"];
      if (excludedEvents.includes(event)) {
        return;
      }

      const initialState: ClientState = await getState(redisKey);

      const store = configureStore({
        reducer: stateSlice.reducer,
        preloadedState: initialState,
      });
      

      type AppDispatch = typeof store.dispatch;
      const dispatch: AppDispatch = store.dispatch;

      if (clientStateActionKeys.includes(event)) {
        // @ts-ignore
        const action = stateSlice.actions[event];
        if (typeof action === "function") {
          // Handle thunk actions
          dispatch(action(...args));
        }
      }
      else {
        console.warn(`Unhandled event: ${event}`);
        return;
      }

      const newState = store.getState() as ClientState;
      await setStateAndPublish(socket.id, newState);
    });

    socket.on("get_state", async (cb: (state: ClientState) => void) => {
      const state = await getState(redisKey);
      cb(state);
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      await redisClient.del(redisKey);
      activeRedisKeys.delete(redisKey);
    });
  });

  // Safe shutdown handler
  async function safeShutdown() {
    console.log("Shutting down. Cleaning up Redis keys...");
    for (const redisKey of activeRedisKeys) {
      try {
        await redisClient.del(redisKey);
        console.log(`Deleted redis key: ${redisKey}`);
      } catch (err) {
        console.warn(`Failed to delete redis key: ${redisKey}`, err);
      }
    }
    try {
      await redisClient.quit();
      await applicationRedisPublisher.quit();
      await applicationRedisSubscriber.quit();
    } catch (err) {
      // Ignore errors on quit
    }
    process.exit(0);
  }

  process.on("SIGINT", safeShutdown);
  process.on("SIGTERM", safeShutdown);

  httpServer.listen(3001, () => {
    // eslint-disable-next-line no-console
    console.log("Server listening on http://localhost:3001");
  });
})();

