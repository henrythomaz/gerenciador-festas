export function createPrompts(data){


const positions = [
"frente",
"tras",
"esquerda",
"direita"
];


const personagens =
data.personagens.slice(0,4);



while(personagens.length < 4){

personagens.push(
personagens[0]
||
"personagem principal"
);

}



return positions.map(
(pos,index)=>{


const personagem =
personagens[index];



return {

nome:pos,


prompt:`

Crie uma arte infantil para decoração de caixa milk de festa.

Tema:
${data.tema}


Personagem:
${personagem}


Estilo:
${data.estilo}


Paleta de cores:
${data.cores.join(", ")}


Elementos:
${data.elementos.join(", ")}


A imagem deve ser:

- fundo completo
- formato quadrado
- arte para impressão
- alta resolução
- visual profissional de papelaria personalizada
- composição equilibrada
- personagem centralizado
- espaço para adicionar nome depois


Não criar:
- caixa
- embalagem
- mockup
- linhas de corte
- texto
- letras
- marca d'água

`

};


});

}
