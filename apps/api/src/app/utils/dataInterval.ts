/**
 * @file dataInterval.ts
 * @description Utilitário para construir intervalos de data em consultas Sequelize.
 * Cria condições WHERE para filtrar registros entre duas datas.
 */

import { Op } from "sequelize";

/**
 * Cria um objeto de intervalo de data para consultas Sequelize.
 * @function dataInterval
 * @param {Date} [antes] - Data limite superior (menor ou igual a esta data)
 * @param {Date} [depois] - Data limite inferior (maior ou igual a esta data)
 * @returns {Object|null} Objeto com operadores Sequelize ou null se nenhuma data for fornecida
 * @description Retorna um objeto com os operadores Op.lte (antes) e Op.gte (depois)
 * para usar em consultas WHERE do Sequelize.
 *
 * @example
 * // Consultar usuários criados entre duas datas
 * const filtroData = dataInterval(
 *   new Date("2024-01-31"), // antes de 31/01/2024
 *   new Date("2024-01-01")  // depois de 01/01/2024
 * );
 *
 * // Resultado:
 * // {
 * //   [Op.lte]: "2024-01-31",
 * //   [Op.gte]: "2024-01-01"
 * // }
 *
 * // Usando em uma consulta
 * const usuarios = await User.findAll({
 *   where: {
 *     criado_em: filtroData
 *   }
 * });
 */
export default function dataInterval(antes?: Date, depois?: Date) {
  if (!antes && !depois) return null;

  const intervalo: any = {};

  if (antes instanceof Date && !isNaN(antes.getTime())) {
    intervalo[Op.lte] = antes;
  }

  if (depois instanceof Date && !isNaN(depois.getTime())) {
    intervalo[Op.gte] = depois;
  }

  return Object.keys(intervalo).length ||
    Object.getOwnPropertySymbols(intervalo).length
    ? intervalo
    : null;
}
