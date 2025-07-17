import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import TelegramBot from 'node-telegram-bot-api';
import {
  getWalletBalance,
  getWalletAddress,
  addBankAccount
} from '../tools';
import CONFIG from '../config/config';
import { MESSAGES } from '../helpers/messages';
import { ACTIONS } from '../helpers/actions';
import { SYSTEM_PROMPT } from '../helpers/prompt';
import { RateLimiter } from '../helpers/rateLimiter';
import { findOrCreateIntent } from '../queries/intent.query';
import z from 'zod';
import { telegramBot } from './bot';
import { getUserByIntentId } from '../queries/user.query';
import { initiateSwap } from '../tools/createSwap';
import Logging from '../library/logging.utils';
import { extractValue, removeKeyValuePairs } from '../utils';

// Validate environment variables
if (!CONFIG.BOT_TOKEN || !CONFIG.OPENAI_API_KEY) {
  throw new Error('Missing required environment variables: TELEGRAM_BOT_TOKEN and OPENAI_API_KEY');
}

interface BotMessage {
  from?: { id: number; username?: string; first_name?: string };
  chat: { id: number };
  text?: string;
}

/**
 * @class DammieCryptoBot
 * @description Implements a Telegram bot for cryptocurrency transactions and information,
 * integrating with OpenAI for AI-driven responses and various tools for wallet operations.
 */
class DammieCryptoBot {
  private bot: TelegramBot;
  private rateLimiter: RateLimiter;

  /**
   * @constructor
   * @description Initializes the Telegram bot, rate limiter, and sets up event handlers.
   */
  constructor() {
    this.bot = telegramBot;
    this.rateLimiter = new RateLimiter();
    this.setupEventHandlers();
  }

  /**
   * @private
   * @method setupEventHandlers
   * @description Sets up event listeners for incoming messages, polling errors, and graceful shutdown.
   */
  private setupEventHandlers(): void {
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('polling_error', this.handlePollingError.bind(this));
    this.setupGracefulShutdown();
  }

  /**
   * @private
   * @method handleMessage
   * @description Processes incoming Telegram messages. It handles rate limiting, distinguishes
   * between commands and regular messages, and dispatches them to appropriate handlers.
   * @param {BotMessage} message - The incoming message object from Telegram.
   */
  private async handleMessage(message: BotMessage): Promise<void> {
    try {
      const userId = message.from?.id as number;
      const chatId = message.chat.id;
      const username = this.getUsername(message);

      // Rate limiting check
      if (userId && this.rateLimiter.isLimited(userId)) {
        await this.sendMessage(chatId, MESSAGES.RATE_LIMITED);
        return;
      }

      // Handle commands
      if (message.text?.startsWith('/')) {
        await this.handleCommand(message.text, userId, chatId, username);
        return;
      }

      // Handle regular messages
      if (!message.text) {
        await this.sendMessage(chatId, MESSAGES.INVALID_MESSAGE);
        return;
      }

      await this.processUserMessage(message.text, chatId, userId, username);

    } catch (error) {
      await this.handleError(message.chat.id, error, 'message handler');
    }
  }

  /**
   * @private
   * @method handleCommand
   * @description Handles specific bot commands like /start, /rates, and /help.
   * It provides welcome messages, displays crypto rates, or offers help information.
   * @param {string} command - The command string (e.g., "/start").
   * @param {number} userId - The Telegram user ID.
   * @param {number} chatId - The Telegram chat ID.
   * @param {string} username - The username of the sender.
   */
  private async handleCommand(command: string, userId: number, chatId: number, username: string): Promise<void> {
    switch (command) {
      case '/start':
        const payload = {
          telegramId: userId.toString(),
          chatId: chatId.toString(),
        }

        const intent = await findOrCreateIntent(payload)
        const user = await getUserByIntentId(intent.id);

        Logging.info(`Intent created or found: ${intent.completeSignupId}`);

        await this.sendMessage(chatId, MESSAGES.WELCOME(username), {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: !user ? {
            inline_keyboard: [[{ text: "Complete Signup", web_app: { url: `https://dammie-ai-frontend.vercel.app/auth/${intent.completeSignupId}` } }]]
          } : null
        });
        break;
      case '/rates':
        await this.sendMessage(chatId, "📊 Getting current rates for you...");
        await this.bot.sendChatAction(chatId, 'typing');
        await this.sendMessage(chatId, MESSAGES.RATES(), { parse_mode: 'Markdown' });
        break;
      case '/help':
        await this.sendMessage(chatId, MESSAGES.HELP(), { parse_mode: 'Markdown' });
        break;
      default:
        await this.sendMessage(chatId, MESSAGES.UNKNOWN_REQUEST);
    }
  }

  /**
   * @private
   * @method processUserMessage
   * @description Processes a regular user message by sending it to the OpenAI model
   * and utilizing available tools to generate a relevant AI response.
   * @param {string} text - The text content of the user's message.
   * @param {number} userId - The Telegram user ID.
   * @param {number} chatId - The Telegram chat ID.
   * @param {string} username - The username of the sender.
   */
  private async processUserMessage(text: string, userId: number, chatId: number, username: string): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');

    try {
      const { text: aiResponse } = await generateText({
        model: openai('gpt-4'),
        prompt: text,
        system: SYSTEM_PROMPT,
        maxSteps: 5,
        tools: {
          addBankAccount: tool({
            description: 'Add Bank account - Use when the user wants to add a bank account',
            parameters: z.object({}),
            execute: async () => {
              return addBankAccount({ username, userId });
            }
          }),
          createSwap: tool({
            description: `Swap/Convert crypto to Naira - Use when the user wants to sell, convert, or swap crypto.`,
            parameters: z.object({
              amount: z.string().describe("The amount user wants to swap (as string to handle decimals)"),
              coin: z.string().toLowerCase().describe("The cryptocurrency symbol (BTC, ETH, USDT, QDX, TRX)"),
            }),
            execute: async ({ amount, coin }) => {
              return initiateSwap(amount, coin, { username, userId });
            }
          }),
          getWalletBalance: tool({
            description: 'Check Wallet Balance - Use when the user wants to know how much of a crypto they have',
            parameters: z.object({
              coin: z.string().toUpperCase().describe("The cryptocurrency symbol (BTC, ETH, USDT, QDX)"),
            }),
            execute: async ({ coin }) => {
              return getWalletBalance(coin, { username, userId });
            }
          }),
          getWalletAddress: tool({
            description: 'Get Wallet Address - Use when the user wants to receive crypto, or when user asks for there address and needs their deposit address',
            parameters: z.object({
              coin: z.string().toUpperCase().describe("The cryptocurrency symbol (BTC, ETH, USDT, QDX)"),
              network: z.string().describe("The blockchain network (BTC, BEP20, ERC20, TRC20, Solana)"),
            }),
            execute: async ({ coin, network }) => {
              return getWalletAddress(coin, network, { username, userId })
            }
          }),
        },
      });

      await this.sendAIResponse(chatId, aiResponse);

    } catch (error) {
      Logging.error('Error processing AI response:', error);
      await this.sendMessage(chatId, MESSAGES.ERROR);
    }
  }

  /**
   * @private
   * @method sendAIResponse
   * @description Sends the AI-generated response back to the user. It checks for
   * specific actions within the response to include interactive buttons.
   * @param {number} chatId - The Telegram chat ID to send the response to.
   * @param {string} response - The AI-generated response text.
   */
  private async sendAIResponse(chatId: number, response: string): Promise<void> {
    const responseText = response?.trim();

    if (!responseText) {
      await this.sendMessage(chatId, MESSAGES.UNKNOWN_REQUEST);
      return;
    }

    Logging.info(`AI Response: ${responseText}`);

    const action = Object.keys(ACTIONS).find(key => responseText.includes(key));

    if (action) {
      const param = extractValue(responseText, "PARAM")
      const messageText = removeKeyValuePairs(responseText, ["PARAM", "ACTION"]);
      const { buttonText, url } = ACTIONS[action as keyof typeof ACTIONS];
      const fullUrl = `${url}${param}`
      Logging.debug("full url", fullUrl)

      return this.sendMessage(chatId, messageText, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: buttonText, web_app: { url: fullUrl } }]]
        }
      });
    }

    // Regular response
    return this.sendMessage(chatId, responseText, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  /**
   * @private
   * @method sendMessage
   * @description A utility method to send a message to a specific chat ID, with optional Telegram API options.
   * @param {number} chatId - The Telegram chat ID.
   * @param {string} text - The text message to send.
   * @param {any} [options] - Optional settings for the message (e.g., parse_mode, reply_markup).
   */
  private async sendMessage(chatId: number, text: string, options?: any): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      Logging.error('Error sending message:', error);
    }
  }

  /**
   * @private
   * @method handleError
   * @description Centralized error handling method for sending error messages to the user and logging errors.
   * @param {number} chatId - The Telegram chat ID where the error occurred.
   * @param {any} error - The error object.
   * @param {string} context - A string describing the context where the error occurred (e.g., "message handler").
   */
  private async handleError(chatId: number, error: any, context: string): Promise<void> {
    Logging.error(`Error in ${context}:`, error);

    const errorMessage = error.message?.includes('rate limit')
      ? MESSAGES.RATE_LIMIT_ERROR
      : MESSAGES.ERROR;

    await this.sendMessage(chatId, errorMessage);
  }

  /**
   * @private
   * @method handlePollingError
   * @description Handles errors that occur during the Telegram bot's polling process.
   * @param {any} error - The polling error object.
   */
  private handlePollingError(error: any): void {
    console.error('Polling error:', error);
  }

  /**
   * @private
   * @method getUsername
   * @description Extracts the username or first name from a Telegram message object for personalized greetings.
   * Defaults to 'there' if no name is available.
   * @param {BotMessage} message - The incoming message object.
   * @returns {string} The username or 'there'.
   */
  private getUsername(message: BotMessage): string {
    return message.from?.username || message.from?.first_name || 'there';
  }

  /**
   * @private
   * @method setupGracefulShutdown
   * @description Sets up listeners for process signals (SIGINT, SIGTERM) to gracefully
   * stop the bot's polling and exit the application.
   */
  private setupGracefulShutdown(): void {
    const shutdown = () => {
      Logging.info('Shutting down bot...');
      this.bot.stopPolling();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * @public
   * @method start
   * @description Initiates the Telegram bot, starts polling for messages, and logs startup information.
   */
  public start(): void {
    Logging.info('🚀 Dammie Crypto Bot is running...');
    Logging.info('✅ Polling started successfully');
    Logging.info('📱 Ready to help users with crypto transactions!');
  }
}

// Initialize and start the bot
const bot = new DammieCryptoBot();
bot.start();