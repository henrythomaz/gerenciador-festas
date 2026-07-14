/**
 * @file queue.ts
 * @description Configuração e inicialização do worker de filas.
 * Processa tarefas em background usando a biblioteca de filas configurada.
 */

import "dotenv/config";

import Queue from "./lib/Queue.js";
import "./database/index.js";

/**
 * Inicializa o processamento da fila.
 * @description O worker é iniciado para processar os jobs em background.
 */
Queue.processQueue();

/**
 * Mensagem de confirmação de inicialização do worker.
 * @description Exibe no console que o worker foi iniciado com sucesso.
 */
console.log("Worker iniciado");
