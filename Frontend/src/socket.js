// socket client - connects to the backend websocket server for real-time features
import { io } from "socket.io-client";

// using websocket transport only to avoid polling fallback issues
const socket = io("http://localhost:5001", {
  transports: ["websocket"],
});

export default socket;
