// src/index.js

import { analyzeTheme } from './ai/analyzer.js';
import { createPrompts } from './ai/promptGenerator.js';
import { generateImages } from './ai/imageGenerator.js';

/**
 * Função principal que executa o fluxo completo:
 * 1. Lê o prompt do usuário (aqui fixo, mas pode vir de CLI ou interface).
 * 2. Analisa o prompt para extrair tema, personagens, cores, etc.
 * 3. Gera 4 prompts específicos para cada posição.
 * 4. Dispara a geração das 4 imagens.
 */
async function main() {
  // Exemplo de entrada do usuário (futuramente pode vir de argumentos da linha de comando)
  const userPrompt = 'Crie uma arte da série Doutor House';

  console.log('Prompt do usuário:', userPrompt);

  // Etapa 1: Análise do prompt
  const data = await analyzeTheme(userPrompt);
  console.log('Dados analisados:', JSON.stringify(data, null, 2));

  // Etapa 2: Geração dos prompts para cada posição
  const prompts = createPrompts(data);
  console.log('Prompts gerados:', prompts.map(p => p.nome).join(', '));

  // Etapa 3: Geração das imagens
  await generateImages(prompts);

  console.log('Processo concluído.');
}

// Executa a função principal e trata erros
main().catch((error) => {
  console.error('Erro durante a execução:', error);
  process.exit(1);
});
