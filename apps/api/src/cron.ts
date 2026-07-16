import cron from "node-cron";
import contractsController from "./app/controllers/ContractsController.js";
import { Request, Response } from "express";
import { acquireLock } from "./lib/RedisLock.js";

async function checkExpiredContracts() {
  const lockKey = "cron:expire-contracts";
  // Tenta adquirir o lock por 60 segundos (tempo suficiente para processar)
  const locked = await acquireLock(lockKey, 60);
  if (!locked) {
    console.log("[CRON] Outra instância já está processando. Ignorando.");
    return;
  }

  console.log("[CRON] Verificando contratos expirados...");
  const req = {} as Request;
  const res = {
    json: (data: any) => console.log("[CRON] Resultado:", data),
    status: (code: number) => ({
      json: (data: any) => console.log("[CRON] Erro:", data),
    }),
  } as Response;

  try {
    await contractsController.expire(req, res);
  } catch (error) {
    console.error("[CRON] Erro ao processar expiração:", error);
  }
  // O lock expira automaticamente, não precisa liberar
}

// Agendar a cada 1 minuto
cron.schedule("*/1 * * * *", async () => {
  await checkExpiredContracts();
});

console.log(
  "[CRON] Agendador iniciado (executa a cada 1 minuto, com lock distribuído)."
);
