/**
 * @file redis.ts
 * @description Configuração do Redis para cache e filas.
 * Define as configurações de conexão com o Redis.
 */

/**
 * Configurações de conexão com Redis.
 * @type {Object}
 * @description Define host e porta para conexão com o Redis.
 *
 * @property {string|undefined} host - Host do Redis (obtido de REDIS_HOST)
 * @property {string|undefined} port - Porta do Redis (obtido de REDIS_PORT)
 *
 * @example
 * // Usando a configuração
 * import redisConfig from './config/redis.js';
 * import Redis from 'ioredis';
 * const redis = new Redis({
 *   host: redisConfig.host,
 *   port: Number(redisConfig.port)
 * });
 *
 * @example
 * // Com IORedis
 * const redis = new Redis({
 *   host: process.env.REDIS_HOST,
 *   port: Number(process.env.REDIS_PORT)
 * });
 */
export default {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};
