# Dammie AI Backend System Design Document

## Overview
Dammie AI Backend is a cryptocurrency trading bot system built with Node.js and Express.js. It integrates with Telegram to provide users with AI-powered crypto trading assistance through a chat interface.

## System Architecture

### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Crypto Exchange**: Quidax API
- **AI SDK**: Vercel AI SDK (@ai-sdk/openai)
- **AI Service**: OpenAI GPT-4
- **Messaging Platform**: Telegram Bot API

### Core Components

#### 1. Application Entry Points
- **app.ts**: Main application setup with middleware configuration, set's up listners for bot and jobs.
- **server.ts**: HTTP server initialization and port binding
- **database.ts**: MongoDB connection management

#### 2. API Layer (`routes/`)
- **user.routes.ts**: User management endpoints
- **webhook.route.ts**: Webhook handlers for external services
- **index.ts**: Route aggregation and organization

#### 3. Business Logic (`controllers/` and `services/`)
- Controllers handle HTTP request/response logic
- Services contain business logic and external API integrations
- Separation of concerns between web layer and business logic

#### 4. Telegram Bot Integration (`plugins/telegram.ts`)
- **DammieCryptoBot Class**: Main bot orchestrator
- **Message Processing**: Handles incoming Telegram messages
- **AI Integration**: Processes messages through Vercel AI SDK
- **Tool System**: Provides crypto operations through structured tool calling

#### 5. Vercel AI SDK Integration
The bot uses Vercel AI SDK for streamlined AI operations:
- **generateText**: Main function for AI text generation with tools
- **tool()**: Helper function for defining structured tools
- **Multi-step Processing**: `maxSteps: 5` for complex operations
- **Type Safety**: Zod schema validation for tool parameters

#### 6. AI Tools System
The bot implements structured tools using Vercel AI SDK:
- **addBankAccount**: Bank account management with empty parameters
- **createSwap**: Cryptocurrency swapping with amount and coin validation
- **getWalletBalance**: Balance checking with coin symbol validation
- **getWalletAddress**: Deposit address generation with coin and network validation

#### 6. Background Jobs (`jobs/`)
- **listener.job.ts**: Background processes for monitoring
- **event.job.ts**: Enqueues background task to be executed
- **queueNames.job.ts**: List of available queue names, used by both listeners and event
- **redis.job.ts**: Configuration for redis application
- Handles scheduled tasks and event processing

#### 7. Middleware (`middlewares/`)
- **errorHandler.ts**: Global error handling
- **webhook.middleware.ts**: Webhook security middleware
- Request logging and validation
- CORS and security middleware

#### 8. Utilities (`library/` and `utils/`)
- **logging.utils.ts**: Centralized logging system
- **rateLimiter**: Rate limiting for API calls
- Helper functions and utilities

## Data Flow

### 1. User Interaction Flow
```
User → Telegram Message → Bot Handler → Rate Limiter → Message Router
```

### 2. Command Processing
```
Command → Command Handler → Database Query → Response Generation → Telegram API
```

### 3. AI Message Processing
```
User Message → Vercel AI SDK → generateText() → Tool Selection → Tool Execution → Response → User
```

#### Detailed AI Processing Flow
```
User Message → processUserMessage() → generateText({
  model: openai('gpt-4'),
  prompt: userText,
  system: SYSTEM_PROMPT,
  maxSteps: 5,
  tools: { addBankAccount, createSwap, getWalletBalance, getWalletAddress }
}) → AI Tool Decision → Tool Execution → Formatted Response
```

### 4. Crypto Operations
```
AI Tool Call → Quidax API → Database Update → User Notification
```

## Key Features

### 1. Intelligent Message Processing
- Natural language understanding through Vercel AI SDK and OpenAI GPT-4
- Structured tool calling with type-safe parameter validation
- Multi-step conversation handling with `maxSteps` configuration
- Context-aware responses with system prompts

### 2. Cryptocurrency Operations
- Real-time balance checking
- Crypto-to-fiat swapping
- Wallet address generation
- Multi-currency support (BTC, ETH, USDT, QDX, TRX)

### 3. User Management
- Intent-based user tracking
- Signup flow integration
- Session management

### 4. Security Features
- Rate limiting per user
- Environment variable configuration
- Error handling and logging
- Input validation

## Database Schema

### Collections
- **Users**: User profiles and authentication data
- **Intents**: User interaction tracking
- **Transactions**: Crypto transaction history
- **Bank Accounts**: User banking information

## External Integrations

### 1. Telegram Bot API
- Message receiving and sending
- Inline keyboards and web apps
- Chat action indicators

### 2. Vercel AI SDK
- `generateText` function for AI text generation
- Structured tool calling with Zod validation
- Multi-step processing capabilities
- Type-safe AI integrations

### 3. OpenAI API (via Vercel AI SDK)
- GPT-4 model for natural language processing
- Structured function calling through AI SDK
- Context management and conversation flow

### 4. Quidax API
- Cryptocurrency trading operations
- Wallet management
- Real-time price data

### 5. MongoDB Database
- User data persistence
- Transaction history
- Configuration storage

### 6. Redis Cache
- Session management
- Rate limiting data
- Temporary data storage

## Configuration Management

### Environment Variables
- `PORT`: Application port
- `NODE_ENV`: Environment mode
- `TELEGRAM_BOT_TOKEN`: Telegram bot authentication
- `OPENAI_API_KEY`: OpenAI API access
- `QUIDAX_API_URL` & `QUIDAX_API_KEY`: Crypto exchange integration
- `MONGO_DB`: Database connection string
- `REDIS_URL`: Cache connection
- `CRYPTO_WEBHOOK_KEY`: Webhook security

## Deployment Architecture

### Development Environment
- Hot-reloading with `npm run dev`
- TypeScript compilation
- Environment variable loading

### Production Environment
- Built TypeScript to JavaScript
- Process management
- Error logging and monitoring

## Security Considerations

### 1. API Security
- Environment variable protection
- Rate limiting implementation
- Input sanitization

### 2. User Data Protection
- Secure database connections
- Encrypted sensitive data
- Access control mechanisms

### 3. Integration Security
- API key management
- Webhook signature verification
- Secure external communications

## Scalability Features

### 1. Modular Architecture
- Separated concerns
- Plugin-based extensions
- Service-oriented design

### 2. Caching Strategy
- Redis for frequently accessed data
- Database query optimization
- Response caching

### 3. Background Processing
- Job queue system
- Asynchronous operations
- Event-driven architecture

## Monitoring and Logging

### 1. Application Logging
- Structured logging with logging.utils
- Error tracking and reporting
- Performance monitoring

### 2. Database Monitoring
- Connection health checks
- Query performance tracking
- Data integrity monitoring

## Future Enhancements

### 1. Additional Features
- More cryptocurrency exchanges
- Advanced trading strategies
- Portfolio management
- Price alerts and notifications

### 2. Technical Improvements
- Microservices architecture
- Container deployment
- Load balancing
- Health check endpoints

## Vercel AI SDK Implementation Details

### Tool Definition Structure
Each tool follows this pattern using Vercel AI SDK:

```typescript
toolName: tool({
  description: 'Clear description of what the tool does',
  parameters: z.object({
    paramName: z.string().describe("Parameter description")
  }),
  execute: async (params) => {
    // Tool implementation logic
    return result;
  }
})
```

### AI Processing Configuration
- **Model**: `openai('gpt-4')` through Vercel AI SDK
- **Max Steps**: 5 steps for complex multi-tool operations
- **System Prompts**: Structured prompts for consistent AI behavior
- **Parameter Validation**: Zod schemas ensure type safety

### Tool Parameter Validation
- **String Validation**: `.string()` for text inputs
- **Case Transformation**: `.toUpperCase()`, `.toLowerCase()` for consistency
- **Descriptive Schema**: Clear parameter descriptions for AI understanding

## Development Workflow

### 1. Code Organization
- TypeScript for type safety
- Modular file structure
- Clear separation of concerns

### 2. Testing Strategy
- Unit tests for business logic
- Integration tests for APIs
- End-to-end testing for user flows

### 3. Build Process
- TypeScript compilation
- Dependency management
- Environment configuration
