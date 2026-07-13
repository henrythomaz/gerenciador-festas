import { extractTheme } from "./themeExtractor.js";


export async function analyzeTheme(prompt){

    const data =
    await extractTheme(prompt);


    return data;

}
