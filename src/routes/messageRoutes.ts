import { Router } from "express";
import { getConversation } from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/:userId", protect, getConversation);

export default router;
