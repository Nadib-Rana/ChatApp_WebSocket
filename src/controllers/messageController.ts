import { Response } from "express";
import Message from "../models/Message";
import { AuthRequest } from "../middleware/authMiddleware";

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const otherId = req.params.userId;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
