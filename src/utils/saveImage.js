// src/utils/saveImage.js

import fs from 'fs';
import axios from 'axios';

/**
 * Faz o download de uma imagem a partir de uma URL e a salva no disco.
 * @param {string} imageUrl - URL pública da imagem.
 * @param {string} outputPath - Caminho completo onde salvar (ex: './output/frente.jpg').
 * @returns {Promise<void>}
 */
export async function saveImage(imageUrl, outputPath) {
  // Faz a requisição da imagem como stream
  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream',
  });

  // Cria um stream de escrita no caminho especificado
  const writer = fs.createWriteStream(outputPath);

  // Pipe da resposta para o arquivo
  response.data.pipe(writer);

  // Aguarda a conclusão da escrita
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
