import axios from "axios";
import { FLUX_API_KEY } from "../config/env.js";

const api = axios.create({
  baseURL: "https://api.fluxapi.ai/api/v1/flux/kontext",
  headers: {
    Authorization: `Bearer ${FLUX_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


async function createTask(prompt) {
  const { data } = await api.post("/generate", {
    prompt,

    aspectRatio: "1:1",

    model: "flux-kontext-pro",

    outputFormat: "jpeg",

    promptUpsampling: true,
  });


  if (data.code !== 200) {
    throw new Error(JSON.stringify(data));
  }


  return data.data.taskId;
}



async function waitTask(taskId) {

  while (true) {

    await sleep(4000);


    const { data } = await api.get("/record-info", {
      params:{
        taskId
      }
    });


    const info = data.data;


    if(info.successFlag === 1){

      return info.response.resultImageUrl;

    }


    if(
      info.successFlag === 2 ||
      info.successFlag === 3
    ){

      throw new Error(
        info.errorMessage ||
        "Falha desconhecida"
      );

    }


    console.log("⏳ Gerando...");

  }

}



export async function generateImage(prompt){


  const maxAttempts = 3;


  for(
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ){

    try{

      console.log(
        `Tentativa Flux ${attempt}/${maxAttempts}`
      );


      const taskId =
        await createTask(prompt);


      console.log(
        "Task:",
        taskId
      );


      const url =
        await waitTask(taskId);


      return url;


    }catch(error){


      console.log(
        "Erro Flux:",
        error.message
      );


      if(attempt === maxAttempts){
        throw error;
      }


      await sleep(5000);

    }

  }

}
