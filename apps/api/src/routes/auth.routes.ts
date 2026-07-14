/**
 * @file auth.routes.ts
 * @description Rotas de autenticação da aplicação.
 * Gerencia login e confirmação de email.
 */

import { Router } from "express";
import sessions from "../app/controllers/SessionsController.js";
import usuarios from "../app/controllers/UsersController.js";

/**
 * Instância do roteador para rotas de autenticação.
 * @type {Router}
 */
const routes = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação e confirmação de conta
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login do usuário
 *     description: Retorna um token JWT para autenticação nas rotas protegidas
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * Rota de login.
 * @route POST /login
 * @description Autentica o usuário e retorna um token JWT.
 * @param {Object} req.body - Dados de login
 * @param {string} req.body.email - Email do usuário
 * @param {string} req.body.password - Senha do usuário
 * @returns {Object} Token JWT e dados do usuário
 */
routes.post("/login", sessions.create);

/**
 * Rota de confirmação de email.
 * @route GET /confirmar-email
 * @description Confirma o email do usuário através de token enviado por email.
 * @param {Object} req.query - Parâmetros da query
 * @param {string} req.query.token - Token de confirmação
 * @returns {Object} Mensagem de confirmação
 */
routes.get("/confirmar-email", usuarios.confirmarEmail);

/**
 * Exporta o roteador de autenticação.
 * @default
 */
export default routes;
