import express from "express"
import { recommendGift } from "../controllers/giftControllers.js"

const router = express.Router();

router.post("/recommend-gift", recommendGift);

export default router;
