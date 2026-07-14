/**
 * @file ConfirmarEmailJob.ts
 * @description Job para envio de email de confirmação de conta.
 * Envia um link com token para o usuário confirmar seu endereço de email.
 */

import Mail from "../../lib/Mail.js";
import "dotenv/config";

/**
 * Interface para os dados necessários para o job de confirmação de email.
 * @interface ConfirmarEmailData
 */
interface ConfirmarEmailData {
  /** Nome completo do usuário */
  nome: string;
  /** Email do usuário */
  email: string;
  /** Token único para confirmação de email */
  token: string;
}

/**
 * Classe do job de confirmação de email.
 * @class ConfirmarEmailJob
 * @description Responsável por enviar um email com link de confirmação
 * para o usuário recém-cadastrado.
 * 
 * @example
 * // Adicionando o job à fila
 * await Queue.add(ConfirmarEmailJob.key, {
 *   nome: "Henry Campos",
 *   email: "henry@email.com",
 *   token: "abc123..."
 * });
 */
class ConfirmarEmailJob {
  /**
   * Chave única do job para identificação na fila.
   * @getter key
   * @returns {string} Identificador do job
   * @description Usado para referenciar este job ao adicionar à fila.
   */
  get key(): string {
    return "ConfirmarEmailJob";
  }

  /**
   * Executa o job de confirmação de email.
   * @method handle
   * @async
   * @param {Object} params - Parâmetros do job
   * @param {ConfirmarEmailData} params.data - Dados para envio do email
   * @returns {Promise<void>}
   * @description Envia um email com link de confirmação contendo o token
   * para o usuário ativar sua conta.
   * 
   * @example
   * // Processamento do job
   * await job.handle({ data: { nome, email, token } });
   */
  async handle({ data }: { data: ConfirmarEmailData }): Promise<void> {
    const { nome, email, token } = data;
    
    /**
     * URL de confirmação com token.
     * @type {string}
     */
    const link = `${process.env.URL}/confirmar-email?token=${token}`;

    /**
     * Envia o email de confirmação.
     */
    await Mail.send({
      to: email,
      subject: "Confirme seu e-mail",
      headers: {
        "ngrok-skip-browser-warning": "3000",
      },
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Olá ${nome}</h1>
          <p>Clique no botão abaixo para confirmar sua conta:</p>
          <a href="${link}"
             style="display: inline-block; padding: 12px 24px; background: #16a34a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">
             Confirmar e-mail
          </a>
          <p style="margin-top: 20px;">Ou copie o link:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px;">${link}</p>
        </div>
      `,
    });
  }
}

/**
 * Exporta instância única do job de confirmação de email.
 * @default
 */
export default new ConfirmarEmailJob();
