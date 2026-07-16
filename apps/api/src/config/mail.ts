/**
 * @file mail.ts
 * @description Configuração do serviço de envio de emails.
 * Define as configurações padrão para envio de emails da aplicação.
 */

import "dotenv/config";

/**
 * Configurações do serviço de email.
 * @type {Object}
 * @description Define o remetente padrão para envio de emails.
 *
 * @property {string} from - Email do remetente (obtido da variável MAIL_FROM)
 *
 * @example
 * // Usando a configuração
 * import mailConfig from './config/mail.js';
 * await sendMail({
 *   from: mailConfig.from,
 *   to: 'usuario@email.com',
 *   subject: 'Bem-vindo',
 *   text: 'Olá...'
 * });
 */
export default {
  from: process.env.MAIL_FROM,
};
