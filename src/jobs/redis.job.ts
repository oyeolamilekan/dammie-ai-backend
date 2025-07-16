/**
 * This file sets up and manages connections to a Redis server.
 * Redis is used here to handle job queues, which are essential for background tasks.
 * It ensures that the application can reliably connect to Redis for various operations like adding jobs to queues or subscribing to job updates.
 */
import Redis from "ioredis";
import CONFIG from "../config/config";

const { REDIS_URL } = CONFIG

let client: any; // This variable holds the main Redis client connection.
let subscriber: any; // This variable holds the Redis subscriber connection, used for listening to events.

const contOpts = {
    tls: null, // No TLS (Transport Layer Security) is used for the connection.
    lazyConnect: false, // The client will try to connect to Redis immediately.
    showFriendlyErrorStack: true, // Shows more readable error messages if something goes wrong.
    maxRetriesPerRequest: null, // No limit on how many times a request will be retried.
    enableReadyCheck: false // Disables checking if Redis is ready before sending commands.
}

export const opts = {
    // redisOpts here will contain at least a property of connectionName which will identify the queue based on its name
    /**
     * This function creates and provides different types of Redis client connections.
     * It ensures that only one main client and one subscriber client are created.
     * @param type The type of Redis client to create ('client', 'subscriber', or 'bclient').
     * @returns A Redis client instance.
     */
    createClient: function (type: string) {
        switch (type) {
            case 'client':
                if (!client) {
                    client = new Redis(REDIS_URL as string, contOpts as any);
                }
                return client;
            case 'subscriber':
                if (!subscriber) {
                    subscriber = new Redis(REDIS_URL as string, contOpts as any);
                }
                return subscriber;
            case 'bclient':
                return new Redis(REDIS_URL as string, contOpts as any); // A new Redis client is created each time for this type.
            default:
                throw new Error('Unexpected connection type: '); // Throws an error if an unknown connection type is requested.
        }
    }
}
