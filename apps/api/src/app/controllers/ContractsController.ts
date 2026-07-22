/**
 * @file ContractsController.ts
 * @description Controlador responsável pelo gerenciamento de contratos.
 * Implementa CRUD completo, cancelamento, arquivamento e expiração com notificação.
 */

import { Request, Response } from "express";
import { WhereOptions, Op } from "sequelize";
import * as Yup from "yup";
import fs from "fs-extra";

import Contract from "../models/Contract.js";
import ContractProduct from "../models/ContractProduct.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

import Queue from "../../lib/Queue.js";
import ExpirationNotificationJob from "../jobs/ExpirationNotificationJob.js";

import ContractPdfService from "../../services/ContractPdfService.js";

// Utils
import dataInterval from "../utils/dataInterval.js";
import ordenation from "../utils/ordenation.js";

/**
 * Interface para parâmetros de rota com ID de contrato.
 */
interface ContratoIdParam {
  id: string;
}

/**
 * Interface para parâmetros de query da listagem.
 */
interface Query {
  cliente_id?: string;
  usuario_id?: string;
  status?: string;
  dataInicioAntes?: string;
  dataInicioDepois?: string;
  dataFimAntes?: string;
  dataFimDepois?: string;
  criadoAntes?: string;
  criadoDepois?: string;
  atualizadoAntes?: string;
  atualizadoDepois?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

/**
 * Classe controladora de contratos.
 */
class ContractsController {
  // ==================== MÉTODOS PÚBLICOS ====================

  async index(req: Request, res: Response) {
    try {
      const schema = Yup.object({
        cliente_id: Yup.number().integer().positive(),
        usuario_id: Yup.number().integer().positive(),
        status: Yup.string().oneOf(["ACTIVE", "ARCHIVED", "CANCELED", "LATE"]),
        dataInicioAntes: Yup.date(),
        dataInicioDepois: Yup.date(),
        dataFimAntes: Yup.date(),
        dataFimDepois: Yup.date(),
        criadoAntes: Yup.date(),
        criadoDepois: Yup.date(),
        atualizadoAntes: Yup.date(),
        atualizadoDepois: Yup.date(),
        sort: Yup.string(),
        page: Yup.number().min(1),
        limit: Yup.number().min(1).max(100),
      });

      const query = await schema.validate(req.query, { stripUnknown: true });
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 25;

      const where: WhereOptions<any> = {};
      const and: any[] = [];

      and.push({ usuario_id: req.userId });

      if (query.cliente_id) and.push({ cliente_id: Number(query.cliente_id) });
      if (query.usuario_id) and.push({ usuario_id: Number(query.usuario_id) });
      if (query.status) and.push({ status: query.status });

      if (query.dataInicioAntes || query.dataInicioDepois) {
        const dataInicio = dataInterval(
          query.dataInicioAntes,
          query.dataInicioDepois
        );
        if (dataInicio) and.push({ data_inicio: dataInicio });
      }

      if (query.dataFimAntes || query.dataFimDepois) {
        const dataFim = dataInterval(query.dataFimAntes, query.dataFimDepois);
        if (dataFim) and.push({ data_fim: dataFim });
      }

      const criado = dataInterval(query.criadoAntes, query.criadoDepois);
      if (criado) and.push({ criado_em: criado });

      const atualizado = dataInterval(
        query.atualizadoAntes,
        query.atualizadoDepois
      );
      if (atualizado) and.push({ atualizado_em: atualizado });

      if (and.length) {
        (where as any)[Op.and] = and;
      }

      const contratos = await Contract.findAll({
        where,
        order: ordenation(query.sort),
        limit,
        offset: (page - 1) * limit,
      });

      return res.json(contratos);
    } catch (err: any) {
      return res.status(400).json({ erro: err.message });
    }
  }

  async show(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });
    if (!contrato) return res.status(404).json();
    return res.json(contrato);
  }

  async create(req: Request, res: Response) {
    try {
      const schema = Yup.object().shape({
        cliente_id: Yup.number().integer().positive().required(),
        usuario_id: Yup.number().integer().positive().required(),
        data_inicio: Yup.date().required(),
        data_fim: Yup.date()
          .required()
          .min(Yup.ref("data_inicio"), "Data fim deve ser após data início"),
        status: Yup.string()
          .oneOf(["ACTIVE", "ARCHIVED", "CANCELED", "LATE"])
          .default("ACTIVE"),
        observacoes: Yup.string().default(""),
      });

      // Valida e converte as datas para objetos Date
      const validatedBody = await schema.validate(req.body, {
        stripUnknown: true,
        abortEarly: false,
      });

      // Apenas os campos permitidos, com datas já convertidas
      const dadosContrato = {
        cliente_id: validatedBody.cliente_id,
        usuario_id: req.userId,
        data_inicio: validatedBody.data_inicio,
        data_fim: validatedBody.data_fim,
        status: validatedBody.status || "ACTIVE",
        observacoes: validatedBody.observacoes || "",
        valor_total: 0,
      };

      const novoContrato = await Contract.create(dadosContrato);

      // Atualiza status do cliente
      const cliente = await Customer.findByPk(novoContrato.cliente_id);
      if (cliente) {
        await cliente.update({ status: "ACTIVE" });
      }

      return res.status(201).json(novoContrato);
    } catch (err: any) {
      // Se for erro de validação do Yup, retorna mensagens detalhadas
      if (err.name === "ValidationError") {
        return res.status(400).json({ erro: err.errors });
      }
      return res.status(400).json({ erro: err.message });
    }
  }

  async update(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });
    if (!contrato) return res.status(404).json();

    // Schema de validação com Yup
    const schema = Yup.object().shape({
      cliente_id: Yup.number().integer().positive(),
      usuario_id: Yup.number().integer().positive(),
      data_inicio: Yup.date()
        .nullable() // permite null/undefined
        .transform((value, originalValue) => {
          // Se for string vazia ou null, retorna undefined para não atualizar
          if (
            originalValue === "" ||
            originalValue === null ||
            originalValue === undefined
          ) {
            return undefined;
          }
          // Tenta converter para Date
          const date = new Date(originalValue);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      data_fim: Yup.date()
        .nullable()
        .transform((value, originalValue) => {
          if (
            originalValue === "" ||
            originalValue === null ||
            originalValue === undefined
          ) {
            return undefined;
          }
          const date = new Date(originalValue);
          return isNaN(date.getTime()) ? undefined : date;
        })
        .when("data_inicio", (dataInicio, schema) => {
          return dataInicio
            ? schema.min(dataInicio, "Data fim deve ser após data início")
            : schema;
        }),
      status: Yup.string().oneOf(["ACTIVE", "ARCHIVED", "CANCELED", "LATE"]),
      valor_total: Yup.number().positive().nullable(),
      observacoes: Yup.string().nullable(),
    });

    try {
      // Valida e converte os dados, removendo campos inválidos
      const validatedBody = await schema.validate(req.body, {
        stripUnknown: true,
        abortEarly: false,
      });

      // Remove campos undefined (não serão atualizados)
      const updateData: any = {};
      for (const key of Object.keys(validatedBody)) {
        const value = validatedBody[key];
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      // Se não há nada para atualizar, retorna o contrato atual
      if (Object.keys(updateData).length === 0) {
        return res.json(contrato);
      }

      const novoStatus = updateData.status;
      const statusAnterior = contrato.status;

      // Se estiver mudando para ARCHIVED ou CANCELED, executa a finalização
      if (
        novoStatus &&
        (novoStatus === "ARCHIVED" || novoStatus === "CANCELED") &&
        statusAnterior !== novoStatus
      ) {
        const transaction = await Contract.sequelize!.transaction();
        try {
          await contrato.update({ status: novoStatus }, { transaction });
          await this.finalizeContract(contrato.id!, transaction);
          await transaction.commit();
          return res.json({
            message: `Contrato ${novoStatus} e finalizado com sucesso.`,
          });
        } catch (err: any) {
          await transaction.rollback();
          return res.status(500).json({ erro: err.message });
        }
      }

      // Atualização normal (sem mudança para ARCHIVED/CANCELED)
      const contratoAtualizado = await contrato.update(updateData);

      // Atualiza status do cliente conforme contratos ativos
      const contratosAtivosOuLate = await Contract.count({
        where: {
          cliente_id: contratoAtualizado.cliente_id,
          status: { [Op.in]: ["ACTIVE", "LATE"] },
        },
      });
      const cliente = await Customer.findByPk(contratoAtualizado.cliente_id);
      if (cliente) {
        await cliente.update({
          status: contratosAtivosOuLate > 0 ? "ACTIVE" : "ARCHIVED",
        });
      }

      // Regenerar PDF APÓS atualização (se houver alterações que afetem o PDF)
      try {
        await ContractPdfService.regenerate(contratoAtualizado.id!);
      } catch (pdfError: any) {
        console.error(
          `[ContractsController] Erro ao gerar PDF após atualização do contrato #${contratoAtualizado.id}:`,
          pdfError.message
        );
        // Não interrompe o fluxo principal
      }

      return res.json(contratoAtualizado);
    } catch (err: any) {
      // Erro de validação do Yup
      if (err.name === "ValidationError") {
        return res.status(400).json({ erro: err.errors });
      }
      // Erro de banco ou outro
      return res.status(400).json({ erro: err.message });
    }
  }

  async destroy(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });

    if (!contrato) return res.status(404).json();

    const transaction = await Contract.sequelize!.transaction();

    try {
      await this.finalizeContract(contrato.id!, transaction);

      await transaction.commit();

      return res.json();
    } catch (err: any) {
      await transaction.rollback();
      return res.status(500).json({ erro: err.message });
    }
  }

  async cancel(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });

    if (!contrato) return res.status(404).json();

    if (contrato.status === "CANCELED") {
      return res.status(400).json({
        erro: "Contrato já cancelado.",
      });
    }

    const transaction = await Contract.sequelize!.transaction();

    try {
      await contrato.update({ status: "CANCELED" }, { transaction });

      await this.finalizeContract(contrato.id!, transaction);

      await transaction.commit();

      return res.json({
        message: "Contrato cancelado e excluído com sucesso.",
      });
    } catch (err: any) {
      await transaction.rollback();
      return res.status(500).json({ erro: err.message });
    }
  }

  async archive(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });

    if (!contrato) return res.status(404).json();

    if (contrato.status === "ARCHIVED" || contrato.status === "CANCELED") {
      return res.status(400).json({ erro: "Contrato já finalizado." });
    }

    const transaction = await Contract.sequelize!.transaction();

    try {
      await contrato.update({ status: "ARCHIVED" }, { transaction });

      await this.finalizeContract(contrato.id!, transaction);

      await transaction.commit();

      return res.json({
        message: "Contrato arquivado e finalizado com sucesso.",
      });
    } catch (err: any) {
      await transaction.rollback();
      return res.status(500).json({ erro: err.message });
    }
  }

  /**
   * Processa contratos expirados: muda status para LATE e envia e-mail para o USUÁRIO responsável.
   */
  async expire(req: Request, res: Response) {
    const now = new Date();

    const contratosExpirados = await Contract.findAll({
      where: {
        status: "ACTIVE",
        data_fim: { [Op.lt]: now },
      },
    });

    if (contratosExpirados.length === 0) {
      return res.json({ message: "Nenhum contrato expirado para processar." });
    }

    const transaction = await Contract.sequelize!.transaction();
    let contratosProcessados = 0;
    let emailsEnviados = 0;
    const erros = [];

    try {
      for (const contrato of contratosExpirados) {
        try {
          // Atualiza status para LATE
          await contrato.update({ status: "LATE" }, { transaction });

          // Busca o usuário responsável (usuario_id do contrato)
          const usuario = await User.findByPk(contrato.usuario_id, {
            transaction,
          });

          if (!usuario || !usuario.email) {
            erros.push(`Contrato #${contrato.id}: usuário sem email.`);
            continue;
          }

          // Envia e-mail via fila
          const baseUrl = process.env.APP_URL || "http://localhost";

          await Queue.add(ExpirationNotificationJob.key, {
            contratoId: contrato.id!,
            usuarioNome: usuario.nome || "Usuário",
            usuarioEmail: usuario.email,
            dataFim: contrato.data_fim,
            cancelLink: `${baseUrl}/contratos/${contrato.id}/cancelar`,
            archiveLink: `${baseUrl}/contratos/${contrato.id}/arquivar`,
            keepLink: `${baseUrl}/contratos/${contrato.id}/manter-late`,
          });

          contratosProcessados++;
          emailsEnviados++;
        } catch (err: any) {
          erros.push(`Contrato #${contrato.id}: ${err.message}`);
        }
      }

      await transaction.commit();
      return res.json({
        processados: contratosProcessados,
        emails_enviados: emailsEnviados,
        erros: erros.length ? erros : undefined,
        message: `${contratosProcessados} contratos expirados marcados como LATE.`,
      });
    } catch (err: any) {
      await transaction.rollback();
      return res.status(500).json({ erro: err.message });
    }
  }

  async keepLate(req: Request, res: Response) {
    const contrato = await Contract.findOne({
      where: { id: req.params.id!, usuario_id: req.userId },
    });
    if (!contrato) return res.status(404).json();

    if (contrato.status !== "LATE") {
      return res
        .status(400)
        .json({ erro: "Contrato não está com status LATE." });
    }

    return res.json({ message: "Contrato mantido como LATE." });
  }

  /**
   * Gera o PDF do contrato.
   * @method generatePdf
   * @route POST /contratos/:id/gerar-pdf
   */
  async generatePdf(req: Request, res: Response) {
    try {
      const contrato = await Contract.findOne({
        where: { id: req.params.id!, usuario_id: req.userId },
      });

      if (!contrato) {
        return res.status(404).json({ erro: "Contrato não encontrado." });
      }

      // Se já existir PDF, remove o arquivo antigo
      if (contrato.pdf_filename) {
        await ContractPdfService.deletePdfFile(contrato);
      }

      const { pdfFilename, pdfHash } = await ContractPdfService.generate(
        contrato.id!
      );

      return res.json({
        message: "PDF gerado com sucesso.",
        pdf_url: `/files/contracts/${pdfFilename}`,
        pdf_hash: pdfHash,
      });
    } catch (err: any) {
      return res.status(500).json({ erro: err.message });
    }
  }

  /**
   * Baixa o PDF do contrato.
   * @method downloadPdf
   * @route GET /contratos/:id/download
   */
  async downloadPdf(req: Request, res: Response) {
    try {
      const contrato = await Contract.findOne({
        where: { id: req.params.id!, usuario_id: req.userId },
      });

      if (!contrato) {
        return res.status(404).json({ erro: "Contrato não encontrado." });
      }

      if (!contrato.pdf_filename) {
        return res
          .status(404)
          .json({ erro: "PDF ainda não gerado para este contrato." });
      }

      const filePath = ContractPdfService.getPdfFilePath(contrato.pdf_filename);

      if (!(await fs.pathExists(filePath))) {
        return res
          .status(404)
          .json({ erro: "Arquivo PDF não encontrado no servidor." });
      }

      return res.download(filePath, `contrato-${contrato.id}.pdf`);
    } catch (err: any) {
      return res.status(500).json({ erro: err.message });
    }
  }

  /**
   * Regenera o PDF do contrato (apaga o antigo e gera novo).
   * @method regeneratePdf
   * @route POST /contratos/:id/regenerar-pdf
   */
  async regeneratePdf(req: Request, res: Response) {
    try {
      const { pdfFilename, pdfHash } = await ContractPdfService.regenerate(
        Number(req.params.id!)
      );

      return res.json({
        message: "PDF regenerado com sucesso.",
        pdf_url: `/files/contracts/${pdfFilename}`,
        pdf_hash: pdfHash,
      });
    } catch (err: any) {
      return res.status(500).json({ erro: err.message });
    }
  }

  // ==================== MÉTODO PRIVADO ====================

  private async finalizeContract(contractId: number, transaction: any) {
    const contrato = await Contract.findByPk(contractId, { transaction });

    if (!contrato) return;

    const clienteId = contrato.cliente_id;

    const itens = await ContractProduct.findAll({
      where: { contrato_id: contractId },
      transaction,
    });

    for (const item of itens) {
      const produto = await Product.findByPk(item.produto_id, {
        transaction,
      });

      if (produto) {
        await produto.update(
          {
            quantidade_disponivel:
              produto.quantidade_disponivel + item.quantidade,
          },
          { transaction }
        );
      }
    }

    await ContractProduct.destroy({
      where: { contrato_id: contractId },
      transaction,
    });

    await contrato.destroy({ transaction });

    await this.updateCustomerStatus(clienteId, transaction);
  }

  private async updateCustomerStatus(clienteId: number, transaction: any) {
    const contratosAtivos = await Contract.count({
      where: {
        cliente_id: clienteId,
        status: {
          [Op.in]: ["ACTIVE", "LATE"],
        },
      },
      transaction,
    });

    const cliente = await Customer.findByPk(clienteId, { transaction });

    if (!cliente) return;

    await cliente.update(
      {
        status: contratosAtivos > 0 ? "ACTIVE" : "ARCHIVED",
      },
      { transaction }
    );
  }
}

export default new ContractsController();
