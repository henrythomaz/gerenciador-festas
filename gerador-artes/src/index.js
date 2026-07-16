// src/index.js
import { analyzeTheme } from './ai/analyzer.js';
import { createPrompts } from './ai/promptGenerator.js';
import { generateImages } from './ai/imageGenerator.js';

async function main() {
  const userPrompt = 'Crie uma arte da série Cobra Kai';
  console.log('Prompt do usuário:', userPrompt);

  const data = await analyzeTheme(userPrompt);
  console.log('Dados analisados:', JSON.stringify(data, null, 2));

  const prompts = createPrompts(data);
  console.log('Prompts gerados:', prompts.map(p => p.nome).join(', '));

  await generateImages(prompts);

  console.log('✅ Processo concluído.');
}

main().catch((error) => {
  console.error('Erro durante a execução:', error);
  process.exit(1);
});
