import { WebSocketServer, WebSocket, CLOSING } from "ws";
import jwt from "jsonwebtoken";
import Message from "../models/Message";

interface WSClient extends WebSocket {
  userId?: string;
}

const clients = new Map<string, WSClient>();

export const startWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WSClient, req) => {
    const token = req.url?.replace("/?token=", "");
    console.log("Token:", token);
    try {
      const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as any;
      ws.userId = decoded.id;

      clients.set(decoded.id, ws);
      console.log("User connected:", decoded.id);
    } catch {
      ws.close();
      return;
    }

    ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      const { receiverId, content } = message;

      const receiver = clients.get(receiverId);

      // Save message in database
      await Message.create({
        senderId: ws.userId,
        receiverId,
        content
      });

      // Send message in real-time
      if (receiver && receiver.readyState === WebSocket.OPEN) {
        receiver.send(
          JSON.stringify({
            senderId: ws.userId,
            content
          })
        );
      }
    });

    ws.on("close", () => {
      clients.delete(ws.userId!);
      console.log("User disconnected:", ws.userId);
    });
  });
};
