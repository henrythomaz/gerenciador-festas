// src/ai/imageGenerator.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateImage } from '../services/fluxClient.js';
import { searchImageUrl } from '../services/imageSearch.js';
import { saveImage } from '../utils/saveImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../../output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function gerarComIA(prompts) {
  const resultados = [];
  for (const item of prompts) {
    console.log(`\n🎨 Gerando com IA: ${item.nome} (busca: ${item.termoBusca})`);
    let refUrl = null;
    try {
      refUrl = await searchImageUrl(item.termoBusca, 3);
      if (refUrl) console.log(`🖼️ Referência encontrada para "${item.termoBusca}"`);
      else console.log(`⚠️ Sem referência para "${item.termoBusca}", gerando apenas com prompt`);
    } catch (err) {
      console.log(`⚠️ Falha ao buscar referência: ${err.message}`);
    }

    try {
      const imageUrl = await generateImage(item.prompt, refUrl);
      const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
      await saveImage(imageUrl, filePath);
      console.log(`✅ Salvo: ${filePath}`);
      resultados.push({ nome: item.nome, status: 'success', file: filePath });
    } catch (error) {
      if (error.message.includes('402') || error.message.includes('credits')) {
        console.log(`🚫 IA sem créditos (erro 402) – ativando fallback.`);
        throw new Error('CREDIT_ERROR');
      }
      console.log(`❌ Falha ao gerar ${item.nome}: ${error.message}`);
      throw error;
    }
  }
  return resultados;
}

async function gerarFallback(prompts) {
  console.log('\n📥 Modo fallback: baixando imagens diretamente da internet...');
  const resultados = [];
  let ultimaImagemUrl = null;

  for (const item of prompts) {
    console.log(`\n🔍 Baixando para ${item.nome} (busca: ${item.termoBusca})`);
    let imagemUrl = null;

    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      try {
        imagemUrl = await searchImageUrl(item.termoBusca, 1);
        if (imagemUrl) break;
      } catch (err) {
        console.log(`Tentativa ${tentativa}/3 falhou: ${err.message}`);
        if (tentativa < 3) await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!imagemUrl) {
      if (ultimaImagemUrl) {
        console.log(`⚠️ Usando imagem anterior (${ultimaImagemUrl}) para ${item.nome}`);
        imagemUrl = ultimaImagemUrl;
      } else {
        console.log(`❌ Sem imagem para ${item.nome} e sem anterior – pulando.`);
        continue;
      }
    } else {
      ultimaImagemUrl = imagemUrl;
    }

    const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
    await saveImage(imagemUrl, filePath);
    console.log(`✅ Salvo: ${filePath}`);
    resultados.push({ nome: item.nome, status: 'success', file: filePath });
  }

  return resultados;
}

export async function generateImages(prompts) {
  try {
    const resultados = await gerarComIA(prompts);
    console.log('\n🎉 Todas as imagens geradas com sucesso via IA!');
    return resultados;
  } catch (error) {
    if (error.message === 'CREDIT_ERROR') {
      console.log('\n🔄 Iniciando fallback (busca direta)...');
      return await gerarFallback(prompts);
    } else {
      console.log(`\n⚠️ Erro inesperado: ${error.message}. Usando fallback.`);
      return await gerarFallback(prompts);
    }
  }
}
