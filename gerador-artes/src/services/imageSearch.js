import axios from 'axios';

// Nova função: retorna um array de URLs
export async function searchImageUrls(termo, maxUrls = 5) {
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
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
      // Retorna até maxUrls URLs
      return resposta.data.results.slice(0, maxUrls).map(r => r.image);
    } catch (err) {
      console.log(`Busca "${termo}" (tentativa ${tentativa}/3) falhou: ${err.message}`);
      if (tentativa < 3) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return [];
}

// Mantém a função antiga para compatibilidade (usa a nova internamente)
export async function searchImageUrl(termo, maxTentativas = 3) {
  const urls = await searchImageUrls(termo, 1);
  return urls.length ? urls[0] : null;
}
