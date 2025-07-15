import Redis from "ioredis";
import CONFIG from "../config/config";

const { REDIS_URL } = CONFIG

let client: any;
let subscriber: any;

const contOpts = {
    tls: null,
    lazyConnect: false,
    showFriendlyErrorStack: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
}

export const opts = {
    // redisOpts here will contain at least a property of connectionName which will identify the queue based on its name
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
                return new Redis(REDIS_URL as string, contOpts as any);
            default:
                throw new Error('Unexpected connection type: ');
        }
    }
}
