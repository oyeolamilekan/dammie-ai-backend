# Project Overview

This project is a Node.js application built with Express.js and TypeScript. It follows a modular structure with dedicated directories for different functionalities.

## Core Components:

- **`app.ts`**: The main application file, responsible for setting up the Express app, including middleware (CORS, JSON body parsing, URL encoding), request logging, and global error handling. It also imports routes and initializes database connection and other plugins/jobs.

- **`server.ts`**: This file starts the Express server and listens on the port defined in the configuration.

- **`database.ts`**: Handles the MongoDB connection using Mongoose. It establishes the connection, logs connection events (connected, error, disconnected), and exports the Mongoose connection object.

- **`config/`**: Contains application-wide configurations, such as port numbers and database URIs.
  - **`config.ts`**: Defines environment variables and configurations for the application.

- **`routes/`**: Defines the API endpoints.
  - **`index.ts`**: Likely consolidates all other route files.
  - **`user.routes.ts`**: Defines routes related to user management.
  - **`webhook.route.ts`**: Defines routes for handling webhooks.

- **`middlewares/`**: Contains Express middleware functions, such as `errorHandler.ts`.

- ****`plugins/`**: Integrates external plugins, like `telegram.ts`.

- **`jobs/`**: Contains background jobs or scheduled tasks, such as `listener.job.ts`.

- **`library/`**: Utility functions, like `logging.utils.ts` for logging.

- **`controllers/`**: (Presumed) Contains the logic for handling requests from routes.

- **`services/`**: (Presumed) Contains business logic and interacts with the database or external APIs.

- **`utils.ts`**: General utility functions.

## Setup and Running

To set up and run this project, you will need to:

### 1. Install Dependencies

First, install the necessary Node.js packages by running:

```bash
npm install
# or yarn install
```

### 2. Environment Variables

Create a `.env` file in the project root based on the `.env.example` (if available, otherwise create one manually) and populate it with the following required environment variables:

```
PORT=3000
NODE_ENV=development
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
QUIDAX_API_URL=YOUR_QUIDAX_API_URL
QUIDAX_API_KEY=YOUR_QUIDAX_API_KEY
CRYPTO_WEBHOOK_KEY=YOUR_CRYPTO_WEBHOOK_KEY
MONGO_DB=YOUR_MONGO_DB_CONNECTION_URI
REDIS_URL=YOUR_REDIS_CONNECTION_URL
MAIN_ACCOUNT_ID=YOUR_MAIN_ACCOUNT_ID
```

### 3. Running the Application

You can run the application in different modes:

*   **Development Mode (with hot-reloading):**
    ```bash
    npm run dev
    ```
*   **Build and Start (Production):**
    ```bash
    npm run build
    npm start
    ```
*   **Linting:**
    ```bash
    npm run lint
    ``` 

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Copyright

© 2025 Oye Olalekan Johnson. All rights reserved.