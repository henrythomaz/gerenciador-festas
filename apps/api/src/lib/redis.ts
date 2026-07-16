/**
 * @file redis.ts
 * @description Configuração e conexão com Redis.
 * Estabelece a conexão com o Redis para cache e filas.
 */

import { createClient } from "redis";
import redisConfig from "../config/redis.js";

/**
 * Cliente Redis configurado.
 * @type {RedisClient}
 * @description Cria uma conexão com Redis usando as configurações
 * do arquivo redis.config.ts.
 *
 * @example
 * // Usando o Redis diretamente
 * import redis from './lib/redis.js';
 *
 * // Armazenar valor
 * await redis.set('chave', 'valor', { EX: 3600 });
 *
 * // Recuperar valor
 * const valor = await redis.get('chave');
 *
 * // Remover chave
 * await redis.del('chave');
 */
const redis = createClient({
  socket: {
    host: redisConfig.host,
    port: Number(redisConfig.port),
  },
});

/**
 * Listener de erro do Redis.
 * @event error
 * @param {Error} err - Erro ocorrido na conexão
 * @description Loga erros de conexão no console para debugging.
 *
 * @example
 * // Exemplo de erro
 * // Redis error: connect ECONNREFUSED 127.0.0.1:6379
 */
redis.on("error", (err) => {
  console.error("Redis error:", err);
});

/**
 * Conecta ao Redis.
 * @description Conecta automaticamente ao inicializar o módulo.
 * A conexão é estabelecida de forma assíncrona.
 *
 * @example
 * // A conexão é estabelecida automaticamente
 * // O código espera a conexão antes de continuar
 * await redis.connect();
 */
await redis.connect();

/**
 * Exporta a conexão Redis configurada.
 * @default
 */
export default redis;
