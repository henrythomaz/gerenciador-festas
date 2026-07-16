/**
 * @file SessionsController.ts
 * @description Controlador responsável pela autenticação de usuários.
 * Gerencia o login, verificação de email e geração de tokens JWT.
 *
 * @note A API utiliza nomes em português (email, senha, nome, etc.)
 * O modelo User faz o mapeamento para os nomes em inglês no banco.
 */

import User from "../models/User.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import auth from "../../config/auth.js";

import Queue from "../../lib/Queue.js";
import WelcomeToBackJob from "../jobs/WelcomeToBackJob.js";

/**
 * Classe controladora de sessões/autenticação.
 * @class SessionsController
 * @description Gerencia o processo de login, verificação de credenciais e geração de tokens.
 */
class SessionsController {
  /**
   * Cria uma nova sessão (login do usuário).
   * @method create
   * @async
   * @description Autentica o usuário, verifica credenciais e email confirmado,
   * e retorna um token JWT para acesso às rotas protegidas.
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com dados do usuário e token JWT
   *
   * @example
   * // Request body (português)
   * {
   *   "email": "usuario@email.com",
   *   "senha": "123456"
   * }
   *
   * // Response (português)
   * {
   *   "user": {
   *     "id": 1,
   *     "nome": "Usuário",
   *     "email": "usuario@email.com"
   *   },
   *   "token": "eyJhbGciOiJIUzI1NiIs..."
   * }
   */
  async create(req: Request, res: Response) {
    const { email, senha } = req.body;

    /**
     * Busca o usuário pelo email.
     * @type {User|null}
     */
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    /**
     * Verifica se a senha está correta.
     */
    if (!(await usuario.checkPassword(senha))) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    /**
     * Verifica se o email foi confirmado.
     * @note O campo 'email_confirmado' está em português na API
     */
    if (!usuario.email_confirmado) {
      return res.status(401).json({
        erro: "Confirme seu email antes de acessar.",
      });
    }

    const { id, nome, email: userEmail } = usuario;

    /**
     * Verifica se já passou 7 dias desde o último login.
     * @type {Date}
     */
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    /**
     * Se não houver registro de ultimo_login ou se for há mais de 7 dias,
     * envia email de boas-vindas de volta.
     * @note O campo 'ultimo_login' está em português na API
     */
    if (
      !usuario.ultimo_login ||
      new Date(usuario.ultimo_login) < seteDiasAtras
    ) {
      await Queue.add(WelcomeToBackJob.key, {
        nome,
        email: userEmail,
      });
    }

    /**
     * Atualiza a data do último login.
     * @note O campo 'ultimo_login' está em português na API
     */
    await usuario.update({ ultimo_login: new Date() });

    /**
     * Gera token JWT para autenticação.
     * @type {string}
     */
    const token = jwt.sign({ id }, auth.secret, {
      expiresIn: auth.expiresIn,
    } as SignOptions);

    return res.json({
      user: { id, nome, email: userEmail },
      token,
    });
  }
}

/**
 * Exporta instância única do controlador.
 * @default
 */
export default new SessionsController();
