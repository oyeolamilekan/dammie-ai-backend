import TelegramBot from "node-telegram-bot-api";
import CONFIG from "../config/config";

export const telegramBot = new TelegramBot(CONFIG.BOT_TOKEN, { polling: true });