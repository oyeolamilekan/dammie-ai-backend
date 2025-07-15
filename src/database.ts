import mongoose from "mongoose";
import Logging from "./library/logging.utils";
import CONFIG from "./config/config";

mongoose
    .connect(CONFIG.MONGO_DB!, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
    })
    .catch((error) => Logging.error(error));

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
    Logging.debug('Mongoose default connection open to ' + CONFIG.MONGO_DB);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    Logging.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    Logging.info('Mongoose default connection disconnected');
});

export const connection = mongoose.connection;