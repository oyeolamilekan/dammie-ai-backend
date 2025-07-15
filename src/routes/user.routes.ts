import express from "express";
import { addBankAccountController, approveTransactionController, createUserController } from "../controllers/user.controller";

const router = express.Router();

router.post("/create_user/:id", createUserController)
router.post("/add_bank_account/:userId", addBankAccountController)
router.post("/approve_transaction/:swapId", approveTransactionController)

export default router;
