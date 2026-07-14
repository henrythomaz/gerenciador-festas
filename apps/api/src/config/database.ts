/**
 * @file config/database.ts
 * @description Configuração do banco de dados para o Sequelize (ESM).
 * Define as credenciais e configurações usando módulos ES.
 */

import "dotenv/config";

/**
 * Interface para a configuração do banco de dados.
 * @interface DatabaseConfig
 */
interface DatabaseConfig {
  /** Dialeto do banco de dados (postgres, mysql, etc) */
  dialect: string;
  /** Host do banco de dados */
  host: string;
  /** Porta do banco de dados */
  port: number;
  /** Usuário do banco de dados */
  username: string;
  /** Senha do banco de dados */
  password: string;
  /** Nome do banco de dados */
  database: string;
  /** Configurações padrão dos modelos */
  define: {
    /** Adiciona campos createdAt e updatedAt */
    timestamps: boolean;
    /** Usa snake_case para nomes de colunas */
    underscored: boolean;
  };
}

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
 * // Uso típico
 * const host = required("DB_HOST");
 * console.log(host); // "localhost"
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Configuração completa do banco de dados.
 * @type {DatabaseConfig}
 * @description Define todas as credenciais e configurações do Sequelize.
 * Utiliza variáveis de ambiente para dados sensíveis.
 * 
 * @example
 * // Usando a configuração
 * import config from './config/database.js';
 * import { Sequelize } from 'sequelize';
 * const sequelize = new Sequelize(config);
 * 
 * @example
 * // Exemplo de .env
 * DB_DIALECT=postgres
 * DB_HOST=localhost
 * DB_PORT=5432
 * DB_USER=admin
 * DB_PASSWORD=secret
 * DB_NAME=myapp_db
 */
const config: DatabaseConfig = {
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

/**
 * Exporta a configuração do banco de dados.
 * @default
 */
export default config;
