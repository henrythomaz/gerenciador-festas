/**
 * @file routes.ts
 * @description Arquivo central de rotas da aplicação.
 * Agrupa e exporta todas as rotas dos módulos da aplicação.
 */

import { Router } from "express";

import usuariosRoutes from "./usuarios.routes.js";
import passwordsRoutes from "./passwords.routes.js";
import authRoutes from "./auth.routes.js";

/**
 * Instância principal do roteador Express.
 * @type {Router}
 * @description Router que agrupa todas as rotas da aplicação.
 */
const routes = Router();

/**
 * Registra todas as rotas da aplicação.
 * @description Agrupa rotas de autenticação, usuários e recuperação de senha.
 */
routes.use(authRoutes);
routes.use(usuariosRoutes);
routes.use(passwordsRoutes);

/**
 * Exporta o roteador configurado.
 * @default
 * @description Router contendo todas as rotas da aplicação.
 */
export default routes;
