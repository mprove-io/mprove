let redis = require('async-redis');

export const redisClient = redis.createClient({ host: 'redis', port: 6379 });
