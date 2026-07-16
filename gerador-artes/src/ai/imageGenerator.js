// src/ai/imageGenerator.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { generateImage } from '../services/fluxClient.js';
import { generateImageHuggingFace } from '../services/hfClient.js';
import { searchImageUrl, searchImageUrls } from '../services/imageSearch.js';
import { saveImage } from '../utils/saveImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../../output');
const TARGET_SIZE = 1024; // tamanho final em pixels (quadrado)

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Redimensiona a imagem para um quadrado de TARGET_SIZE x TARGET_SIZE.
 * Se a imagem já tiver esse tamanho, não faz nada (mas sharp aplica sem perda).
 */
async function resizeImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: 'cover', // preenche todo o quadrado, cortando se necessário
      position: 'center',
    })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

/**
 * Salva a imagem a partir de uma URL e depois redimensiona.
 */
async function saveAndResize(imageUrl, outputPath) {
  // Primeiro salva temporariamente em um arquivo .tmp
  const tempPath = outputPath + '.tmp';
  await saveImage(imageUrl, tempPath);
  // Redimensiona e sobrescreve o arquivo final
  await resizeImage(tempPath, outputPath);
  // Remove o temporário
  fs.unlinkSync(tempPath);
}

/**
 * Salva a imagem a partir de um Buffer (ex: retornado pela HF) e redimensiona.
 */
async function saveBufferAndResize(buffer, outputPath) {
  const tempPath = outputPath + '.tmp';
  fs.writeFileSync(tempPath, buffer);
  await resizeImage(tempPath, outputPath);
  fs.unlinkSync(tempPath);
}

// --- Geração com IA (Flux primeiro, depois HF) ---
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

    let imagemGerada = false;
    let erroIA = null;

    // 1) Tenta Flux (paga)
    try {
      const imageUrl = await generateImage(item.prompt, refUrl);
      const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
      await saveAndResize(imageUrl, filePath);
      console.log(`✅ Salvo (Flux): ${filePath}`);
      resultados.push({ nome: item.nome, status: 'success', file: filePath, origem: 'flux' });
      imagemGerada = true;
    } catch (error) {
      if (error.message.includes('402') || error.message.includes('credits')) {
        console.log(`🚫 Flux sem créditos – tentando Hugging Face...`);
        erroIA = error;
      } else {
        console.log(`❌ Erro inesperado no Flux: ${error.message}`);
        erroIA = error;
      }
    }

    // 2) Se Flux falhou por créditos, tenta HF
    if (!imagemGerada && erroIA) {
      try {
        const buffer = await generateImageHuggingFace(item.prompt, refUrl);
        const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
        await saveBufferAndResize(buffer, filePath);
        console.log(`✅ Salvo (Hugging Face): ${filePath}`);
        resultados.push({ nome: item.nome, status: 'success', file: filePath, origem: 'huggingface' });
        imagemGerada = true;
      } catch (hfError) {
        console.log(`🚫 HF também falhou: ${hfError.message}`);
        // Se HF falhar, lançamos erro para ativar o fallback de busca
        throw new Error('CREDIT_ERROR');
      }
    }

    if (!imagemGerada) {
      // Se por algum motivo nenhuma IA funcionou, lança erro para fallback
      throw new Error('CREDIT_ERROR');
    }
  }
  return resultados;
}

// --- Fallback: busca direta na web ---
async function gerarFallback(prompts) {
  console.log('\n📥 Modo fallback: baixando imagens diretamente da internet...');
  const resultados = [];
  let ultimaImagemUrl = null;

  for (const item of prompts) {
    console.log(`\n🔍 Baixando para ${item.nome} (busca: ${item.termoBusca})`);

    const urls = await searchImageUrls(item.termoBusca, 5);
    let imagemSalva = false;

    if (urls.length === 0) {
      if (ultimaImagemUrl) {
        console.log(`⚠️ Nenhuma imagem nova, usando anterior`);
        try {
          const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
          await saveAndResize(ultimaImagemUrl, filePath);
          console.log(`✅ Salvo (anterior): ${filePath}`);
          resultados.push({ nome: item.nome, status: 'success', file: filePath, origem: 'fallback' });
          imagemSalva = true;
        } catch (err) {
          console.log(`❌ Falha ao salvar imagem anterior: ${err.message}`);
        }
      } else {
        console.log(`❌ Sem imagem para ${item.nome} e sem anterior – pulando.`);
        continue;
      }
    } else {
      for (const url of urls) {
        try {
          const filePath = path.join(OUTPUT_DIR, `${item.nome}.jpg`);
          await saveAndResize(url, filePath);
          console.log(`✅ Salvo: ${filePath}`);
          ultimaImagemUrl = url;
          resultados.push({ nome: item.nome, status: 'success', file: filePath, origem: 'fallback' });
          imagemSalva = true;
          break;
        } catch (err) {
          console.log(`❌ Falha ao baixar URL: ${err.message}`);
          continue;
        }
      }
    }

    if (!imagemSalva) {
      console.log(`❌ Não foi possível salvar imagem para ${item.nome}`);
    }
  }

  return resultados;
}

// --- Função principal ---
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
