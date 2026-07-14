/**
 * @file filtroLike.ts
 * @description Utilitário para construir filtros LIKE em consultas Sequelize.
 * Adiciona condições de busca parcial (case-insensitive) aos parâmetros WHERE.
 */

import { Op } from "sequelize";

/**
 * Adiciona um filtro LIKE (case-insensitive) ao array de condições AND.
 * @function filtroLike
 * @param {any[]} and - Array de condições WHERE do Sequelize (operador Op.and)
 * @param {string} campo - Nome do campo a ser filtrado
 * @param {string} [valor] - Valor a ser buscado (opcional)
 * @returns {void} Modifica o array 'and' adicionando a condição de filtro
 * @description Se o valor for fornecido, adiciona uma condição de busca parcial
 * com o operador iLike (case-insensitive) ao array de condições.
 * 
 * @example
 * // Uso em uma consulta
 * const and = [];
 * filtroLike(and, "nome", "João");
 * filtroLike(and, "email", "email@");
 * 
 * // and será:
 * // [
 * //   { nome: { [Op.iLike]: "%João%" } },
 * //   { email: { [Op.iLike]: "%email@%" } }
 * // ]
 */
export default function filtroLike(
  and: any[],
  campo: string,
  valor?: string
) {
  if (!valor) return;

  and.push({
    [campo]: {
      [Op.iLike]: `%${valor}%`,
    },
  });
}
