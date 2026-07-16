/**
 * @file database.cjs
 * @description Configuração de conexão com o banco de dados.
 * Define as credenciais e configurações para o Sequelize.
 *
 * @note Este arquivo está em CommonJS (.cjs) por compatibilidade
 * com ferramentas que exigem CommonJS.
 */

require("dotenv/config");

/**
 * Função utilitária para obter variáveis de ambiente obrigatórias.
 * @function required
 * @param {string} name - Nome da variável de ambiente
 * @returns {string} Valor da variável de ambiente
 * @throws {Error} Se a variável de ambiente não estiver definida
 * @description Garante que todas as variáveis de ambiente necessárias
 * para a conexão com o banco de dados estejam definidas.
 *
 * @example
 * const host = required("DB_HOST");
 * // Se DB_HOST não estiver definido, lança um erro
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Configuração do Sequelize para conexão com o banco de dados.
 * @type {Object}
 * @description Define todas as credenciais e configurações do banco de dados.
 * Utiliza as variáveis de ambiente para definir as credenciais.
 *
 * @property {string} dialect - Dialeto do banco de dados (postgres, mysql, etc)
 * @property {string} host - Host do banco de dados
 * @property {number} port - Porta do banco de dados
 * @property {string} username - Usuário do banco de dados
 * @property {string} password - Senha do banco de dados
 * @property {string} database - Nome do banco de dados
 * @property {Object} define - Configurações padrão dos modelos
 * @property {boolean} define.timestamps - Adiciona campos createdAt e updatedAt
 * @property {boolean} define.underscored - Usa snake_case para nomes de colunas
 *
 * @example
 * // Usando a configuração
 * import { Sequelize } from 'sequelize';
 * import dbConfig from './database.cjs';
 * const sequelize = new Sequelize(dbConfig);
 */
module.exports = {
  dialect: required("DB_DIALECT"),
  host: required("DB_HOST"),
  port: Number(required("DB_PORT")),
  username: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  define: {
    timestamps: true,
    underscored: true,
  },
};
