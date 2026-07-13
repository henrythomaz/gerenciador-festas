import Groq from "groq-sdk";
import fs from "fs";

import {
  GROQ_API_KEY
} from "../config/env.js";


const groq =
new Groq({
  apiKey: GROQ_API_KEY
});



export async function extractTheme(userPrompt){


const completion =
await groq.chat.completions.create({

model:
"llama-3.3-70b-versatile",


temperature:0.2,


messages:[

{
role:"system",

content:`

Você é especialista em criação de artes para festas personalizadas.

Analise o tema informado pelo usuário.

Extraia:

- tema principal
- personagens importantes
- cores predominantes
- estilo visual
- elementos do universo


Responda SOMENTE JSON válido.

Formato obrigatório:

{
"tema":"",
"personagens":[],
"cores":[],
"estilo":"",
"elementos":[]
}


Não coloque markdown.
Não explique nada.
Somente JSON.

`
},


{
role:"user",
content:userPrompt
}

]

});



let text =
completion.choices[0].message.content;



text =
text
.replace("```json","")
.replace("```","")
.trim();



const data =
JSON.parse(text);



fs.writeFileSync(
"tema.json",
JSON.stringify(data,null,2)
);



return data;

}
