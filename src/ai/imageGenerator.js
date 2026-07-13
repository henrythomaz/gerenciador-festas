import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { generateImage } from "../services/fluxClient.js";
import { saveImage } from "../utils/saveImage.js";


const __filename =
fileURLToPath(import.meta.url);


const __dirname =
path.dirname(__filename);



const OUTPUT_DIR =
path.resolve(
  __dirname,
  "../../output"
);



if(!fs.existsSync(OUTPUT_DIR)){
  fs.mkdirSync(
    OUTPUT_DIR,
    {
      recursive:true
    }
  );
}



export async function generateImages(prompts){


const results = [];



for(const item of prompts){


try{


console.log(
`\nGerando: ${item.nome}`
);



const imageUrl =
await generateImage(
item.prompt
);



const file =
path.join(
OUTPUT_DIR,
`${item.nome}.jpg`
);



await saveImage(
imageUrl,
file
);



console.log(
`✅ Salvo: ${file}`
);



results.push({
nome:item.nome,
status:"success",
file
});



}catch(error){


console.log(
`❌ Falhou ${item.nome}:`,
error.message
);



results.push({

nome:item.nome,

status:"failed",

error:error.message

});


}



}



console.log("\nResumo:");

console.table(results);


return results;


}
