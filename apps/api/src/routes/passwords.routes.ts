/**
 * @file passwords.routes.ts
 * @description Rotas para recuperação e redefinição de senha.
 * Gerencia o fluxo de "esqueci minha senha".
 */

import { Router } from "express";
import passwords from "../app/controllers/PasswordsController.js";

/**
 * Instância do roteador para rotas de senha.
 * @type {Router}
 */
const routes = Router();

/**
 * @swagger
 * tags:
 *   - name: Senha
 *     description: Recuperação e redefinição de senha
 */

/**
 * @swagger
 * /password/forgot:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Senha]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *     responses:
 *       200:
 *         description: E-mail enviado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * Rota para solicitar redefinição de senha.
 * @route POST /password/forgot
 * @description Envia um email com token para redefinição de senha.
 * @param {Object} req.body - Dados da solicitação
 * @param {string} req.body.email - Email do usuário
 * @returns {Object} Mensagem de confirmação de envio
 */
routes.post("/password/forgot", passwords.forgot);

/**
 * @swagger
 * /password/reset:
 *   post:
 *     summary: Redefine a senha com token
 *     tags: [Senha]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Senha atualizada
 *       400:
 *         description: Token inválido ou expirado
 */

/**
 * Rota para redefinir a senha.
 * @route POST /password/reset
 * @description Redefine a senha do usuário usando o token enviado por email.
 * @param {Object} req.query - Parâmetros da query
 * @param {string} req.query.token - Token de redefinição
 * @param {Object} req.body - Dados da nova senha
 * @param {string} req.body.password - Nova senha
 * @returns {Object} Mensagem de sucesso
 */
routes.post("/password/reset", passwords.reset);

/**
 * Exporta o roteador de senhas.
 * @default
 */
export default routes;
