import express from "express";
import { protectCryptoWebhook } from "../middlewares/webhook.middleware";
import { cryptoWebhookController } from "../controllers/webhook.controller";

const router = express.Router();

router.post("/crypto", protectCryptoWebhook,  cryptoWebhookController)

export default router;
