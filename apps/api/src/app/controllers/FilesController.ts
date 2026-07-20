/**
 * @file FilesController.ts
 * @description Controlador responsável pelo upload de arquivos.
 */

import { Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import File from "../models/File.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ContractProduct from "../models/ContractProduct.js";
import Contract from "../models/Contract.js";
import ContractPdfService from "../../services/ContractPdfService.js";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Obter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FilesController {
  // Método existente (create)...
  async create(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }

    const { originalname: nome, filename: caminho } = file;

    const novoArquivo = await File.create({ nome, caminho });

    return res.status(201).json(novoArquivo);
  }

  // update
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ erro: "Nenhum arquivo enviado para atualização." });
    }

    // Busca o arquivo no banco
    const arquivoExistente = await File.findByPk(id);
    if (!arquivoExistente) {
      return res.status(404).json({ erro: "Arquivo não encontrado." });
    }

    // Caminho completo do arquivo antigo
    const uploadDir = resolve(__dirname, '..', '..', 'storage', 'uploads');
    const caminhoAntigo = resolve(uploadDir, arquivoExistente.caminho);

    try {
      await unlink(caminhoAntigo);
    } catch (err) {
      console.warn(`Arquivo antigo não encontrado: ${caminhoAntigo}`);
    }

    // Atualiza os dados no banco
    const { originalname: nome, filename: caminho } = file;
    arquivoExistente.nome = nome;
    arquivoExistente.caminho = caminho;
    await arquivoExistente.save();

    // ===== NOVA LÓGICA: REGENERAR PDFs DOS CONTRATOS RELACIONADOS =====
    try {
      // 1. Busca produtos que usam este arquivo como imagem
      const produtos = await Product.findAll({
        where: { file_id: id },
        attributes: ['id']
      });

      if (produtos.length > 0) {
        const produtoIds = produtos.map(p => p.id);

        // 2. Busca todos os itens de contrato que referenciam esses produtos
        const itens = await ContractProduct.findAll({
          where: { produto_id: produtoIds },
          attributes: ['contrato_id'],
          group: ['contrato_id']
        });

        // 3. Para cada contrato, verifica se possui PDF gerado e regenera
        for (const item of itens) {
          const contratoId = item.contrato_id;
          const contrato = await Contract.findByPk(contratoId, {
            attributes: ['id', 'pdf_filename']
          });

          // Só regenera se o contrato já tiver um PDF gerado (pdf_filename não nulo)
          if (contrato && contrato.pdf_filename) {
            try {
              await ContractPdfService.regenerate(contratoId);
              console.log(`[FilesController] PDF do contrato #${contratoId} regenerado após atualização da imagem.`);
            } catch (pdfError: any) {
              console.error(
                `[FilesController] Erro ao regenerar PDF do contrato #${contratoId}:`,
                pdfError.message
              );
              // Não interrompe o fluxo principal
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[FilesController] Erro ao processar regeneração de PDFs:', error.message);
      // Não interrompe a resposta, apenas loga o erro
    }

    return res.status(200).json(arquivoExistente);
  }

  /**
   * Remove um arquivo do sistema e do banco de dados.
   * @method destroy
   * @async
   * @param {Request} req - Objeto de requisição Express (contém id do arquivo)
   * @param {Response} res - Objeto de resposta Express
   * @returns {Promise<Response>}
   */
  async destroy(req: Request, res: Response) {
    const { id } = req.params;

    // Busca o arquivo no banco
    const arquivo = await File.findByPk(id);
    if (!arquivo) {
      return res.status(404).json({ erro: "Arquivo não encontrado." });
    }

    // 1. Remove a referência em usuários que usam este arquivo como avatar
    await User.update({ file_id: null }, { where: { file_id: id } });

    // 2. Remove a referência em produtos que usam este arquivo como imagem
    await Product.update({ file_id: null }, { where: { file_id: id } });

    // Caminho para a pasta uploads (sobe 2 níveis: controllers -> app -> src)
    const uploadDir = resolve(__dirname, "..", "..", "storage", "uploads");

    // 3. Remove o arquivo físico do disco
    const caminhoCompleto = resolve(uploadDir, arquivo.caminho);

    try {
      await unlink(caminhoCompleto);
    } catch (err) {
      // Se o arquivo não existir, apenas logamos e seguimos (não bloqueia a deleção do registro)
      console.warn(`Arquivo físico não encontrado: ${caminhoCompleto}`);
    }

    // 4. Remove o registro do banco de dados
    await arquivo.destroy();

    return res.status(200).json({ message: "Arquivo deletado com sucesso." });
  }
}

export default new FilesController();
