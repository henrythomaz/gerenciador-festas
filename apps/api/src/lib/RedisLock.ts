import redis from "./redis.js";

/**
 * Adquire um lock distribuído com expiração automática.
 * @param key - Chave única para o lock (ex: 'cron:expire-contracts')
 * @param ttl - Tempo de vida em segundos (padrão 60)
 * @returns true se conseguiu adquirir, false caso contrário
 */
export async function acquireLock(
  key: string,
  ttl: number = 60
): Promise<boolean> {
  // SET NX EX -> só define se não existir, com expiração
  const result = await redis.set(key, "locked", {
    NX: true,
    EX: ttl,
  });
  return result === "OK";
}

/**
 * Libera o lock manualmente (opcional, pois expira automaticamente).
 */
export async function releaseLock(key: string): Promise<void> {
  await redis.del(key);
}
