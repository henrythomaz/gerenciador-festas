/**
 * @file ordenation.ts
 * @description Utilitário para processar parâmetros de ordenação em consultas Sequelize.
 * Converte strings de ordenação em arrays compatíveis com o método order do Sequelize.
 */

import { Order } from "sequelize";

/**
 * Converte uma string de ordenação em um array de order do Sequelize.
 * @function ordenation
 * @param {string} [sort] - String de ordenação no formato "campo:direcao,campo:direcao"
 * @returns {Order} Array de ordenação compatível com o Sequelize
 * @throws {Error} Se o campo de ordenação for inválido ou a direção não for ASC/DESC
 * @description Processa múltiplos campos de ordenação separados por vírgula.
 * Cada campo deve ser seguido por :ASC ou :DESC (case-insensitive).
 *
 * @example
 * // Ordenação simples
 * const order1 = ordenation("nome:ASC");
 * // Resultado: [["nome", "ASC"]]
 *
 * // Ordenação múltipla
 * const order2 = ordenation("nome:ASC,email:DESC");
 * // Resultado: [["nome", "ASC"], ["email", "DESC"]]
 *
 * // Usando em uma consulta
 * const usuarios = await User.findAll({
 *   order: ordenation("nome:ASC,email:DESC")
 * });
 *
 * @example
 * // Sem ordenação
 * const order3 = ordenation("");
 * // Resultado: []
 *
 * @example
 * // Com validação
 * try {
 *   const order = ordenation("nome:ASC,email:INVALIDO");
 * } catch (error) {
 *   // Erro: "Direção inválida para 'email': INVALIDO"
 * }
 */
export default function ordenation(sort?: string): Order {
  if (!sort) return [];

  return sort.split(",").map((item) => {
    const [campo, direcao] = item.split(":");

    if (!campo) {
      throw new Error("Campo de ordenação inválido");
    }

    const dir = direcao?.toUpperCase();

    if (dir !== "ASC" && dir !== "DESC") {
      throw new Error(`Direção inválida para '${campo}': ${direcao}`);
    }

    return [campo, dir];
  });
}
