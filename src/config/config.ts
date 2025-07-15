import dotenv from 'dotenv';

dotenv.config();

// Configuration interface
interface CONFIG {
  PORT: number;
  NODE_ENV: string;
  BOT_TOKEN: string;
  OPENAI_API_KEY: string;
  REDIS_URL: string;
  RATE_LIMIT: {
    WINDOW: number;
    MAX_REQUESTS: number;
  };
  SUPPORTED_CRYPTOS: string[];
  CURRENT_RATES: {
    BTC: number;
    ETH: number;
    USDT: number;
    QDX: number;
  };
}


const CONFIG = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  QUIDAX_API_URL: process.env.QUIDAX_API_URL,
  QUIDAX_API_KEY: process.env.QUIDAX_API_KEY,
  CRYPTO_WEBHOOK_KEY: process.env.CRYPTO_WEBHOOK_KEY,
  MONGO_DB: process.env.MONGO_DB,
  REDIS_URL: process.env.REDIS_URL,
  RATE_LIMIT: {
    WINDOW: 60000, // 1 minute
    MAX_REQUESTS: 10
  },
  PENDING: 'pending',
  FAILED: 'failed',
  SUCCESS: 'success',
  SUPPORTED_CRYPTOS: ['trx'],
  STATUS: ['pending', 'failed', 'success'],
  MAIN_ACCOUNT_ID: process.env.MAIN_ACCOUNT_ID as string,
  CURRENT_RATES: {
    BTC: 75000000,
    ETH: 5500000,
    USDT: 1650,
    QDX: 250
  },
};

export default CONFIG;