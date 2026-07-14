/**
 * @file ResetPasswordJob.ts
 * @description Job para envio de email de redefinição de senha.
 * Envia um link com token para o usuário redefinir sua senha.
 */

import Mail from "../../lib/Mail.js";
import "dotenv/config";

/**
 * Interface para os dados necessários para o job de redefinição de senha.
 * @interface ResetPasswordData
 */
interface ResetPasswordData {
  /** Email do usuário */
  email: string;
  /** Token único para redefinição de senha */
  token: string;
}

/**
 * Classe do job de redefinição de senha.
 * @class ResetPasswordJob
 * @description Responsável por enviar um email com link para redefinição
 * de senha quando o usuário solicita recuperação.
 * 
 * @example
 * // Adicionando o job à fila
 * await Queue.add(ResetPasswordJob.key, {
 *   email: "henry@email.com",
 *   token: "def456..."
 * });
 */
class ResetPasswordJob {
  /**
   * Chave única do job para identificação na fila.
   * @getter key
   * @returns {string} Identificador do job
   * @description Usado para referenciar este job ao adicionar à fila.
   */
  get key(): string {
    return "ResetPasswordJob";
  }

  /**
   * Executa o job de redefinição de senha.
   * @method handle
   * @async
   * @param {Object} params - Parâmetros do job
   * @param {ResetPasswordData} params.data - Dados para envio do email
   * @returns {Promise<void>}
   * @description Envia um email com link para redefinição de senha
   * contendo o token válido por tempo limitado.
   * 
   * @example
   * // Processamento do job
   * await job.handle({ data: { email, token } });
   */
  async handle({ data }: { data: ResetPasswordData }): Promise<void> {
    const { email, token } = data;
    
    /**
     * URL de redefinição de senha com token.
     * @type {string}
     */
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    /**
     * Envia o email de redefinição de senha.
     */
    await Mail.send({
      to: email,
      subject: "Redefinição de senha",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Redefinição de senha</h1>
          <p>Você solicitou a redefinição de senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${url}"
            style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; border-radius: 8px; text-decoration: none;">
            Redefinir senha
          </a>
          <p style="margin-top: 20px;">Ou copie o link:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px;">${url}</p>
        </div>
      `,
    });
  }
}

/**
 * Exporta instância única do job de redefinição de senha.
 * @default
 */
export default new ResetPasswordJob();
