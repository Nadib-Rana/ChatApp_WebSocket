import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { startWebSocketServer } from "./websocket/wsServer";

dotenv.config();
connectDB();

const server = http.createServer(app);
startWebSocketServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
