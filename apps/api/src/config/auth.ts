/**
 * @file auth.ts (config)
 * @description Configurações de autenticação da aplicação.
 * Define as configurações para geração e validação de tokens JWT.
 */

import "dotenv/config";
import { SignOptions } from "jsonwebtoken";

/**
 * Interface para as configurações de autenticação.
 * @interface AuthConfig
 */
interface AuthConfig {
  /** Chave secreta para assinar os tokens JWT */
  secret: string;
  /** Tempo de expiração do token (7 dias por padrão) */
  expiresIn: SignOptions["expiresIn"];
}

/**
 * Configurações de autenticação.
 * @type {AuthConfig}
 * @description Define a chave secreta e o tempo de expiração dos tokens.
 * A chave secreta é obtida da variável de ambiente APP_SECRET.
 *
 * @example
 * // Usando a configuração
 * import auth from './config/auth.js';
 * const token = jwt.sign({ id: userId }, auth.secret, {
 *   expiresIn: auth.expiresIn
 * });
 */
const auth: AuthConfig = {
  secret: process.env.APP_SECRET as string,
  expiresIn: "7d",
};

/**
 * Exporta as configurações de autenticação.
 * @default
 */
export default auth;
