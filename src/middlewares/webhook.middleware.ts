import { NextFunction, Request, Response } from "express";
import asyncHandler from '../helpers/async-handler.helper';

import Logging from "../library/logging.utils";
import CONFIG from "../config/config";

export const protectCryptoWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookKey = req.headers['quidax-signature'];
        if (webhookKey !== CONFIG.CRYPTO_WEBHOOK_KEY) {
            Logging.warning("Person wan run you street guy.");
            return res.status(500).json({
                message: "Not yet boss, no be me you go send back to my village."
            });
        }
        next();
    } catch (error) {
        Logging.error(`Error show for ${error}`);
        return res.status(401).json({
            message: "Not Unauthorized"
        });
    }
})