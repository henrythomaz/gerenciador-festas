// src/services/hfClient.js
import axios from 'axios';
import dns from 'dns';
import { HUGGINGFACE_API_KEY } from '../config/env.js';

// Cria um cliente axios com lookup forçando IPv6
const client = axios.create({
  baseURL: 'https://api-inference.huggingface.co',
  headers: {
    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  lookup: (hostname, options, callback) => {
    // Tenta resolver com IPv6 primeiro
    dns.lookup(hostname, { family: 6 }, (err, address, family) => {
      if (err) {
        // Se falhar (ex: sistema sem IPv6), tenta IPv4 (fallback)
        dns.lookup(hostname, { family: 4 }, callback);
      } else {
        callback(null, address, family);
      }
    });
  }
});

/**
 * Gera uma imagem usando Stable Diffusion via Hugging Face.
 * @param {string} prompt - Prompt textual.
 * @param {string|null} imageUrl - (ignorado, HF não aceita referência)
 * @returns {Promise<Buffer>} - Buffer da imagem gerada.
 */
export async function generateImageHuggingFace(prompt, imageUrl = null) {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY não configurada');
  }

  const response = await client.post(
    '/models/runwayml/stable-diffusion-v1-5',
    {
      inputs: prompt,
      parameters: {
        negative_prompt: 'texto, letras, marca d\'água, assinatura, baixa qualidade, distorcido',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    },
    { responseType: 'arraybuffer' }
  );

  // Se a resposta for um JSON de erro (ex: 503 ou 429), lança exceção
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    const errorText = Buffer.from(response.data).toString('utf-8');
    const errorJson = JSON.parse(errorText);
    throw new Error(errorJson.error || 'Erro na HF API');
  }

  // Retorna o buffer da imagem
  return Buffer.from(response.data);
}
