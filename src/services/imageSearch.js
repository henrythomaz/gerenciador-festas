// src/services/imageSearch.js
import axios from 'axios';

export async function searchImageUrl(termo, maxTentativas = 3) {
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const pagina = await axios.get(
        `https://duckduckgo.com/?q=${encodeURIComponent(termo)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const match = pagina.data.match(/vqd="([^"]+)"/);
      if (!match) throw new Error('Não foi possível obter o token vqd');
      const vqd = match[1];

      const resposta = await axios.get('https://duckduckgo.com/i.js', {
        params: {
          l: 'us-en',
          o: 'json',
          q: termo,
          vqd,
          f: ',,,',
          p: '1',
        },
        headers: {
          Referer: 'https://duckduckgo.com/',
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!resposta.data.results || !resposta.data.results.length) {
        throw new Error('Nenhuma imagem encontrada');
      }
      return resposta.data.results[0].image;
    } catch (err) {
      console.log(`🔍 Busca "${termo}" (tentativa ${tentativa}/${maxTentativas}) falhou: ${err.message || err}`);
      if (tentativa < maxTentativas) {
        console.log('⏳ Tentando novamente...');
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  return null;
}
