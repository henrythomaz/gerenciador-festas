export function createPrompts(data) {
  const positions = ['frente', 'tras', 'esquerda', 'direita', 'tema'];
  let personagens = data.personagens.slice(0, 4);
  while (personagens.length < 4) {
    personagens.push(personagens[personagens.length - 1] || 'personagem principal');
  }

  // Se não houver nome_obra, usa o tema como fallback
  const obra = data.nome_obra || data.tema;

  return positions.map((pos, index) => {
    const isTema = index === 4;
    const personagem = isTema ? obra : personagens[index];
    const termoBusca = isTema ? obra : `${obra} ${personagens[index]}`;

    const prompt = `
Crie uma arte infantil para decoração de caixa milk de festa.

Tema: ${data.tema}

${isTema ? 'Ilustração representando o tema geral' : `Personagem: ${personagem}`}

Estilo: ${data.estilo}

Paleta de cores: ${data.cores.join(', ')}

Elementos: ${data.elementos.join(', ')}

A imagem deve ser:
- fundo completo
- formato quadrado
- arte para impressão
- alta resolução
- visual profissional de papelaria personalizada
- composição equilibrada
${isTema ? '- elementos do tema em destaque' : '- personagem centralizado'}
- espaço para adicionar nome depois

Não criar:
- caixa
- embalagem
- mockup
- linhas de corte
- texto
- letras
- marca d'água
`;

    return {
      nome: pos,
      personagem: personagem,   // usado apenas para referência
      termoBusca: termoBusca,   // ex: "Stranger Things Eleven"
      prompt,
    };
  });
}
