/**
 * @file auth.ts
 * @description Middleware de autenticação da aplicação.
 * Verifica a validade do token JWT nas requisições protegidas.
 */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import auth from "../../config/auth.js";

/**
 * Interface para o payload do JWT decodificado.
 * @interface JwtPayload
 * @description Estrutura dos dados contidos no token JWT.
 */
interface JwtPayload {
  id: string;
}

/**
 * Middleware de autenticação.
 * @async
 * @function authMiddleware
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {NextFunction} next - Função next do Express
 * @returns {Promise<Response|void>} Retorna erro 401 ou chama o próximo middleware
 * @description Verifica se o token JWT é válido e está presente no header Authorization.
 *
 * @example
 * // Uso em uma rota
 * routes.get("/usuarios", authMiddleware, usuarios.index);
 *
 * // Header esperado
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * @throws {401} Token não fornecido
 * @throws {401} Token mal formatado
 * @throws {401} Token inválido
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  /**
   * Header de autorização da requisição.
   * @type {string|undefined}
   */
  const authHeader = req.headers.authorization;

  // Verifica se o header de autorização existe
  if (!authHeader) {
    return res.status(401).json({ erro: "Token não foi fornecido." });
  }

  // Verifica se o header está no formato correto
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token mal formatado." });
  }

  /**
   * Extrai o token do header.
   * @type {string}
   */
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ erro: "Token não foi fornecido." });
  }

  try {
    /**
     * Token decodificado após verificação.
     * @type {JwtPayload}
     */
    const decoded = jwt.verify(token, auth.secret) as unknown as JwtPayload;

    /**
     * Adiciona o ID do usuário à requisição.
     * @property {string} userId - ID do usuário autenticado
     */
    req.userId = decoded.id;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ erro: "Token inválido." });
  }
};
