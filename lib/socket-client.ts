import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:4001", {
      autoConnect: true,
      withCredentials: true,
    });
  }
  return socket;
}
