import { io } from "socket.io-client";
import type { ClientState } from "@monorepo/shared/src/types";

export const socket = io("http://localhost:3001");

export function getState(): Promise<ClientState> {
  return new Promise((resolve) => {
    socket.emit("get_state", (state: ClientState) => {
      resolve(state);
    });
  });
}