/**
 * @file Mail.ts
 * @description Serviço de envio de emails da aplicação.
 * Utiliza a biblioteca Resend para enviar emails de forma confiável.
 */

import { Resend } from "resend";
import mailConfig from "../config/mail.js";

/**
 * Classe de serviço de email.
 * @class Mail
 * @description Gerencia o envio de emails utilizando a API do Resend.
 * Fornece uma interface simplificada para enviar emails HTML e texto.
 * 
 * @example
 * // Enviando um email
 * await Mail.send({
 *   to: "usuario@email.com",
 *   subject: "Bem-vindo!",
 *   html: "<h1>Olá</h1>",
 *   text: "Olá"
 * });
 */
class Mail {
  /** Instância do cliente Resend */
  private resend: Resend;

  /**
   * Construtor da classe Mail.
   * @constructor
   * @description Inicializa o cliente Resend com a API token do ambiente.
   * O token deve estar definido na variável MAIL_API_TOKEN no .env.
   * 
   * @example
   * // .env
   * MAIL_API_TOKEN=re_abc123...
   */
  constructor() {
    this.resend = new Resend(process.env.MAIL_API_TOKEN);
  }

  /**
   * Envia um email.
   * @method send
   * @async
   * @param {Object} params - Parâmetros do email
   * @param {string} params.to - Endereço de email do destinatário
   * @param {string} params.subject - Assunto do email
   * @param {string} params.html - Corpo do email em HTML
   * @param {string} params.text - Corpo do email em texto plano (fallback)
   * @returns {Promise<Object>} Resposta da API Resend
   * @description Envia um email utilizando a API do Resend.
   * O remetente é configurado no arquivo mail.config.ts.
   * 
   * @example
   * // Enviar email simples
   * const response = await Mail.send({
   *   to: "cliente@email.com",
   *   subject: "Confirmação de cadastro",
   *   html: "<h1>Bem-vindo ao sistema!</h1>",
   *   text: "Bem-vindo ao sistema!"
   * });
   * console.log("Email enviado:", response);
   * 
   * @example
   * // Enviar com template HTML complexo
   * await Mail.send({
   *   to: "usuario@email.com",
   *   subject: "Redefinição de senha",
   *   html: `
   *     <div style="font-family: sans-serif;">
   *       <h1>Redefinir senha</h1>
   *       <a href="${link}">Clique aqui</a>
   *     </div>
   *   `,
   *   text: `Redefina sua senha: ${link}`
   * });
   */
  async send({ to, subject, html, text }) {
    /**
     * Envia o email via Resend API.
     * @type {Object} response - Resposta da API
     */
    const response = await this.resend.emails.send({
      from: mailConfig.from,
      to,
      subject,
      html,
      text,
    });
    console.log("EMAIL RESPONSE:", response);
    return response;
  }
}

/**
 * Exporta instância única do serviço de email.
 * @default
 * @description Singleton para uso em toda a aplicação.
 */
export default new Mail();
