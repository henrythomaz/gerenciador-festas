/**
 * @file server.ts
 * @description Arquivo principal que inicia o servidor HTTP da aplicação.
 * Configura e inicia o servidor Express na porta definida nas variáveis de ambiente.
 */

import app from "./app.js";
import "dotenv/config";

/**
 * Porta em que o servidor será executado.
 * @type {number}
 * @description Utiliza a variável de ambiente PORT ou padrão 3000.
 */
const PORT = process.env.PORT ?? 3000;

/**
 * Inicia o servidor Express.
 * @description O servidor é iniciado na porta definida e exibe uma mensagem de confirmação.
 */
app.listen(PORT, () => {
  console.log("Rodando na porta: ", PORT);
});
