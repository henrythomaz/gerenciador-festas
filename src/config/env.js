import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});


export const FLUX_API_KEY =
process.env.FLUX_API_KEY;


export const GROQ_API_KEY =
process.env.GROQ_API_KEY;



if (!FLUX_API_KEY) {
  throw new Error(
    "FLUX_API_KEY não encontrada"
  );
}


if (!GROQ_API_KEY) {
  throw new Error(
    "GROQ_API_KEY não encontrada"
  );
}
