import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import routes from "./routes";
import './database';
import './plugins/telegram';
import './jobs/listener.job';
import Logging from './library/logging.utils';
import cors from 'cors';

const app = express();

const options: cors.CorsOptions = {
    origin: "*",
    optionsSuccessStatus: 200
};

app.use(cors(options));

app.use(express.json({ limit: '10mb' }));

app.use(
    express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }),
);

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */
    Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        Logging.info(`Result - METHOD: [${req.protocol}://${req.get('host')}${req.originalUrl}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
    });

    next();
});

app.use(express.urlencoded({ extended: true }));

process.setMaxListeners(0);

app.use(express.json());

// Global error handler (should be after routes)
app.use(errorHandler);

app.use('/api/v1/', routes);

export default app;