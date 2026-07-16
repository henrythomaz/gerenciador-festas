/**
 * @file WelcomeToBackJob.ts
 * @description Job para envio de email de boas-vindas de volta.
 * Envia um email de "bem-vindo de volta" para usuários que não acessam
 * a plataforma há mais de 7 dias.
 */

import Mail from "../../lib/Mail.js";
import { emailTemplate } from "../../lib/emailTemplate.js";

/**
 * Interface para os dados necessários para o job de boas-vindas de volta.
 * @interface WelcomeToBackData
 */
interface WelcomeToBackData {
  /** Nome completo do usuário */
  nome: string;
  /** Email do usuário */
  email: string;
}

/**
 * Classe do job de boas-vindas de volta.
 * @class WelcomeToBackJob
 * @description Responsável por enviar um email de "bem-vindo de volta"
 * para usuários inativos que retornam à plataforma após 7+ dias.
 *
 * @example
 * // Adicionando o job à fila
 * await Queue.add(WelcomeToBackJob.key, {
 *   nome: "Henry Campos",
 *   email: "henry@email.com"
 * });
 *
 * // Este job é acionado automaticamente no login
 * // quando o usuário não acessa há mais de 7 dias
 */
class WelcomeToBackJob {
  /**
   * Chave única do job para identificação na fila.
   * @getter key
   * @returns {string} Identificador do job
   * @description Usado para referenciar este job ao adicionar à fila.
   */
  get key(): string {
    return "WelcomeToBackJob";
  }

  /**
   * Executa o job de boas-vindas de volta.
   * @method handle
   * @async
   * @param {Object} params - Parâmetros do job
   * @param {WelcomeToBackData} params.data - Dados para envio do email
   * @returns {Promise<void>}
   * @description Envia um email caloroso de boas-vindas para usuários
   * que retornam após um período de inatividade.
   *
   * @example
   * // Processamento do job
   * await job.handle({ data: { nome, email } });
   */
  async handle({ data }: { data: WelcomeToBackData }): Promise<void> {
    const { nome, email } = data;

    /**
     * Envia o email de boas-vindas de volta.
     * Inclui versão HTML e texto para compatibilidade.
     */
    await Mail.send({
      to: email,
      subject: `Bem-vindo(a) de volta! - ${email}`,
      html: emailTemplate({
        title: `Que bom ver você novamente!`,
        subtitle: `Olá ${nome}!`,
        content: `
          Sentimos sua falta.

          Entre na plataforma e continue administrando seus contratos e festas exatamente de onde parou.
        `,
      }),
      text: `Olá ${nome}. Bem-vindo(a) de volta ao sistema de Gerenciamento de Festas!`,
    });
  }
}

/**
 * Exporta instância única do job de boas-vindas de volta.
 * @default
 */
export default new WelcomeToBackJob();
