/**
 * @file PasswordsController.ts
 * @description Controlador responsável por gerenciar a recuperação e redefinição de senhas.
 * Implementa o fluxo de "esqueci minha senha" com envio de token via email.
 */

import { Request, Response } from "express";
import crypto from "crypto";
import * as Yup from "yup";

import User from "../models/User.js";

import redis from "../../lib/redis.js";
import Queue from "../../lib/Queue.js";
import ResetPasswordJob from "../jobs/ResetPasswordJob.js";

/**
 * Classe controladora de recuperação de senha.
 * @class PasswordsController
 * @description Gerencia as operações de forgot (solicitação) e reset (redefinição) de senha.
 */
class PasswordsController {
  /**
   * Solicita redefinição de senha.
   * @method forgot
   * @async
   * @description Gera um token de recuperação, armazena no Redis e envia email com o link.
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com mensagem de confirmação
   *
   * @example
   * // Request body
   * {
   *   "email": "usuario@email.com"
   * }
   */
  async forgot(req: Request, res: Response) {
    /**
     * Schema de validação para a requisição de forgot.
     * @type {Yup.ObjectSchema}
     */
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: "Erro ao validar schema." });
    }

    const { email } = req.body;

    /**
     * Busca o usuário pelo email.
     * @type {User|null}
     */
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    /**
     * Gera token criptográfico para redefinição de senha.
     * @type {string}
     */
    const token = crypto.randomBytes(20).toString("hex");

    /**
     * Armazena o token no Redis com expiração de 1 hora.
     */
    await redis.set(`reset:${token}`, String(usuario.id), { EX: 60 * 60 });

    /**
     * Adiciona job à fila para enviar email de redefinição.
     */
    await Queue.add(ResetPasswordJob.key, {
      email: usuario.email,
      token,
    });

    return res.json({ message: "Email enviado" });
  }

  /**
   * Redefine a senha do usuário.
   * @method reset
   * @async
   * @description Valida o token, busca o usuário e atualiza a senha.
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com mensagem de confirmação
   *
   * @example
   * // Query params: ?token=abc123...
   * // Request body
   * {
   *   "senha": "novaSenha123"
   * }
   */
  async reset(req: Request, res: Response) {
    const { token } = req.query;
    const { senha } = req.body;

    /**
     * Busca o ID do usuário pelo token no Redis.
     * @type {string|null}
     */
    const userId = await redis.get(`reset:${token}`);

    if (!userId) {
      return res.status(400).json({ erro: "Token inválido ou expirado" });
    }

    /**
     * Busca o usuário pelo ID.
     * @type {User|null}
     */
    const usuario = await User.findByPk(userId);

    if (!usuario) {
      return res.status(404).json();
    }

    /**
     * Atualiza a senha do usuário.
     */
    await usuario.update({ senha });

    /**
     * Remove o token do Redis após uso.
     */
    await redis.del(`reset:${token}`);

    return res.json({ message: "Senha atualizada" });
  }
}

/**
 * Exporta instância única do controlador.
 * @default
 */
export default new PasswordsController();
