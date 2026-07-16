/**
 * @file CustomersController.ts
 * @description Controlador responsável pelo gerenciamento de clientes.
 * Implementa CRUD completo com validações, filtros, paginação e ordenação.
 */

import { Request, Response } from "express";
import { WhereOptions, Op } from "sequelize";
import * as Yup from "yup";

import Customer from "../models/Customer.js";

// Utils
import likeFilter from "../utils/likeFilter.js";
import dataInterval from "../utils/dataInterval.js";
import ordenation from "../utils/ordenation.js";

/**
 * Interface para parâmetros de rota com ID de cliente.
 * @interface ClienteIdParam
 */
interface ClienteIdParam {
  id: string;
}

/**
 * Interface para parâmetros de query da listagem.
 * @interface Query
 */
interface Query {
  nome?: string;
  telefone?: string;
  cpf?: string;
  email?: string;
  status?: string;
  criadoAntes?: string;
  criadoDepois?: string;
  atualizadoAntes?: string;
  atualizadoDepois?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

/**
 * Classe controladora de clientes.
 * @class CustomersController
 * @description Gerencia todas as operações relacionadas a clientes:
 * criação, listagem, visualização, atualização e exclusão.
 */
class CustomersController {
  /**
   * Lista todos os clientes com filtros e paginação.
   * @method index
   * @async
   * @description Retorna uma lista paginada de clientes com suporte a filtros.
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com lista de clientes
   *
   * @example
   * // GET /clientes?nome=Joao&status=ACTIVE&page=1&limit=10
   */
  async index(req: Request, res: Response) {
    try {
      /**
       * Schema de validação para os parâmetros de query.
       * @type {Yup.ObjectSchema}
       */
      const schema = Yup.object({
        nome: Yup.string(),
        telefone: Yup.string(),
        cpf: Yup.string(),
        email: Yup.string(),
        status: Yup.string().oneOf(["ACTIVE", "ARCHIVED"]),
        criadoAntes: Yup.date(),
        criadoDepois: Yup.date(),
        atualizadoAntes: Yup.date(),
        atualizadoDepois: Yup.date(),
        sort: Yup.string(),
        page: Yup.number().min(1),
        limit: Yup.number().min(1).max(100),
      });

      /**
       * Query validada e tipada.
       * @type {Query}
       */
      const query = await schema.validate(req.query, {
        stripUnknown: true,
      });

      /**
       * Configuração de paginação.
       */
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 25;

      /**
       * Construção da cláusula WHERE para filtros.
       * @type {WhereOptions}
       */
      const where: WhereOptions = {};
      const and: any[] = [];

      // Aplica filtros LIKE para nome, telefone, cpf, email
      likeFilter(and, "nome", query.nome);
      likeFilter(and, "telefone", query.telefone);
      likeFilter(and, "cpf", query.cpf);
      likeFilter(and, "email", query.email);

      // Filtro exato para status
      if (query.status) {
        and.push({ status: query.status });
      }

      // Filtros de data para criação e atualização
      const criado = dataInterval(query.criadoAntes, query.criadoDepois);
      if (criado) and.push({ criado_em: criado });

      const atualizado = dataInterval(
        query.atualizadoAntes,
        query.atualizadoDepois
      );
      if (atualizado) and.push({ atualizado_em: atualizado });

      if (and.length) {
        where[Op.and] = and;
      }

      /**
       * Busca os clientes com os filtros aplicados.
       * @type {Customer[]}
       */
      const clientes = await Customer.findAll({
        where,
        order: ordenation(query.sort),
        limit,
        offset: (page - 1) * limit,
      });

      return res.json(clientes);
    } catch (err: any) {
      return res.status(400).json({ erro: err.message });
    }
  }

  /**
   * Busca um cliente por ID.
   * @method show
   * @async
   * @description Retorna os dados completos de um cliente específico.
   * @param {Request<ClienteIdParam>} req - Objeto de requisição Express com parâmetro ID
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com dados do cliente
   *
   * @example
   * // GET /clientes/1
   */
  async show(req: Request<ClienteIdParam>, res: Response) {
    /**
     * Busca o cliente pelo ID.
     * @type {Customer|null}
     */
    const cliente = await Customer.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json();
    }

    return res.json(cliente);
  }

  /**
   * Cria um novo cliente.
   * @method create
   * @async
   * @description Valida os dados, verifica duplicidade de CPF/email e cria o cliente.
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com dados do cliente criado
   *
   * @example
   * // POST /clientes
   * // Request body
   * {
   *   "nome": "João Silva",
   *   "telefone": "(11) 99999-9999",
   *   "cpf": "12345678900",
   *   "email": "joao@email.com",
   *   "status": "ACTIVE"
   * }
   */
  async create(req: Request, res: Response) {
    const { body } = req;

    /**
     * Schema de validação para criação de cliente.
     * @type {Yup.ObjectSchema}
     */
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
      cpf: Yup.string()
        .required()
        .matches(/^\d{11}$/, "CPF deve ter 11 dígitos"),
      email: Yup.string().email().required(),
      status: Yup.string().oneOf(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ erro: "Erro ao validar schema." });
    }

    /**
     * Verifica se CPF já está cadastrado.
     * @type {Customer|null}
     */
    const clienteCpfExiste = await Customer.findOne({
      where: { cpf: body.cpf },
    });

    if (clienteCpfExiste) {
      return res.status(409).json({ erro: "CPF já cadastrado." });
    }

    /**
     * Verifica se email já está cadastrado.
     * @type {Customer|null}
     */
    const clienteEmailExiste = await Customer.findOne({
      where: { email: body.email },
    });

    if (clienteEmailExiste) {
      return res.status(409).json({ erro: "Email já cadastrado." });
    }

    /**
     * Cria o novo cliente no banco de dados.
     * @type {Customer}
     */
    const novoCliente = await Customer.create(body);

    return res.status(201).json(novoCliente);
  }

  /**
   * Atualiza os dados de um cliente.
   * @method update
   * @async
   * @description Atualiza os campos permitidos, com verificações de unicidade.
   * @param {Request<ClienteIdParam>} req - Objeto de requisição Express com parâmetro ID
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta JSON com dados atualizados
   *
   * @example
   * // PUT /clientes/1
   * // Request body
   * {
   *   "nome": "João Silva Santos",
   *   "telefone": "(11) 98888-8888"
   * }
   */
  async update(req: Request<ClienteIdParam>, res: Response) {
    /**
     * Busca o cliente pelo ID.
     * @type {Customer|null}
     */
    const cliente = await Customer.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json();
    }

    /**
     * Schema de validação para atualização de cliente.
     * @type {Yup.ObjectSchema}
     */
    const schema = Yup.object().shape({
      nome: Yup.string(),
      telefone: Yup.string(),
      cpf: Yup.string().matches(/^\d{11}$/, "CPF deve ter 11 dígitos"),
      email: Yup.string().email(),
      status: Yup.string().oneOf(["ACTIVE", "ARCHIVED"]),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: "Erro ao validar schema." });
    }

    /**
     * Verifica se o CPF está sendo alterado e já existe para outro cliente.
     */
    if (req.body.cpf && req.body.cpf !== cliente.cpf) {
      const cpfExiste = await Customer.findOne({
        where: { cpf: req.body.cpf },
      });
      if (cpfExiste) {
        return res
          .status(409)
          .json({ erro: "CPF já cadastrado por outro cliente." });
      }
    }

    /**
     * Verifica se o email está sendo alterado e já existe para outro cliente.
     */
    if (req.body.email && req.body.email !== cliente.email) {
      const emailExiste = await Customer.findOne({
        where: { email: req.body.email },
      });
      if (emailExiste) {
        return res
          .status(409)
          .json({ erro: "Email já cadastrado por outro cliente." });
      }
    }

    /**
     * Atualiza o cliente no banco de dados.
     * @type {Customer}
     */
    const clienteAtualizado = await cliente.update(req.body);

    return res.json(clienteAtualizado);
  }

  /**
   * Remove um cliente.
   * @method destroy
   * @async
   * @description Exclui permanentemente um cliente do sistema.
   * @param {Request<ClienteIdParam>} req - Objeto de requisição Express com parâmetro ID
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>} Resposta vazia com status 200
   *
   * @example
   * // DELETE /clientes/1
   */
  async destroy(req: Request<ClienteIdParam>, res: Response) {
    /**
     * Busca o cliente pelo ID.
     * @type {Customer|null}
     */
    const cliente = await Customer.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json();
    }

    /**
     * Remove o cliente do banco de dados.
     */
    await cliente.destroy();

    return res.json();
  }
}

/**
 * Exporta instância única do controlador.
 * @default
 */
export default new CustomersController();
