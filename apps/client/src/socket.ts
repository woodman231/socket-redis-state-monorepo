import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { ClientState } from "@monorepo/shared/src/types";
import type {  
  ClientStateSocketEvents,
} from "@monorepo/shared/src/reducers/clientStateReducer";

// ListenEvents: events the client listens for (from server)
type ListenEvents = {
  state_updated: (state: ClientState) => void;
};

// EmitEvents: events the client emits (to server)
type EmitEvents = ClientStateSocketEvents & {
  get_state: (cb: (state: ClientState) => void) => void;
};

export const socket: Socket<ListenEvents, EmitEvents> = io("http://localhost:3001");

export function getState(): Promise<ClientState> {
  return new Promise((resolve) => {
    socket.emit("get_state", (state: ClientState) => {
      resolve(state);
    });
  });
}