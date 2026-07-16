/**
 * @file clientes.routes.ts
 * @description Rotas para gerenciamento de clientes.
 * Inclui CRUD completo com autenticação.
 */

import { Router } from "express";
import clientes from "../app/controllers/CustomersController.js";
import authMiddleware from "../app/middlewares/auth.js";

/**
 * Instância do roteador para rotas de clientes.
 * @type {Router}
 */
const routes = Router();

/**
 * @swagger
 * tags:
 *   - name: Clientes
 *     description: Gerenciamento de clientes
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Lista todos os clientes com filtros e paginação
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de clientes
 */

/**
 * Rota para listar todos os clientes.
 * @route GET /clientes
 * @description Retorna uma lista paginada de clientes com filtros.
 * @security bearerAuth
 * @returns {Array<Object>} Lista de clientes
 */
routes.get("/clientes", authMiddleware, clientes.index);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, telefone, cpf, email]
 *             properties:
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               cpf:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED]
 *     responses:
 *       201:
 *         description: Cliente criado
 */

/**
 * Rota para criar um novo cliente.
 * @route POST /clientes
 * @description Cria um novo cliente, verificando unicidade de CPF e email.
 * @security bearerAuth
 * @param {Object} req.body - Dados do cliente
 * @returns {Object} Cliente criado
 */
routes.post("/clientes", authMiddleware, clientes.create);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Busca cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 */

/**
 * Rota para buscar um cliente por ID.
 * @route GET /clientes/:id
 * @description Retorna os dados de um cliente específico.
 * @security bearerAuth
 * @param {Object} req.params - Parâmetros da rota
 * @param {number} req.params.id - ID do cliente
 * @returns {Object} Dados do cliente
 */
routes.get("/clientes/:id", authMiddleware, clientes.show);

/**
 * Rota para atualizar um cliente.
 * @route PUT /clientes/:id
 * @description Atualiza os dados de um cliente, com validação de unicidade.
 * @security bearerAuth
 * @param {Object} req.params - Parâmetros da rota
 * @param {number} req.params.id - ID do cliente
 * @param {Object} req.body - Dados para atualização
 * @returns {Object} Cliente atualizado
 */
routes.put("/clientes/:id", authMiddleware, clientes.update);

/**
 * Rota para deletar um cliente.
 * @route DELETE /clientes/:id
 * @description Remove um cliente do sistema.
 * @security bearerAuth
 * @param {Object} req.params - Parâmetros da rota
 * @param {number} req.params.id - ID do cliente
 * @returns {Object} Confirmação de exclusão
 */
routes.delete("/clientes/:id", authMiddleware, clientes.destroy);

/**
 * Exporta o roteador de clientes.
 * @default
 */
export default routes;
