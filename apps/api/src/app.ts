/**
 * @file app.ts
 * @description Configuração principal da aplicação Express.
 * Define middlewares, rotas, documentação Swagger e tratamento de exceções.
 */

import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import routes from "./routes/routes";
import "./database/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import cors from "cors";

/**
 * Classe principal da aplicação.
 * @class App
 * @description Centraliza a configuração do servidor Express, incluindo middlewares, 
 * rotas e tratamento de erros.
 */
class App {
  /**
   * Instância do servidor Express.
   * @public
   * @type {Express}
   */
  public server: Express;

  /**
   * Construtor da classe App.
   * @constructor
   * @description Inicializa o servidor e aplica middlewares, rotas e exception handlers.
   */
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  /**
   * Configura os middlewares da aplicação.
   * @method middlewares
   * @description Adiciona CORS, parsing de JSON e URL-encoded.
   */
  middlewares() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: false }));
  }

  /**
   * Configura as rotas da aplicação.
   * @method routes
   * @description Define a rota de documentação Swagger, o endpoint para o JSON do Swagger
   * e todas as rotas principais da aplicação.
   */
  routes() {
    this.server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.server.get("/docs.json", (req, res) => {
      res.json(swaggerSpec);
    });
    this.server.use(routes);
  }

  /**
   * Configura o handler de exceções globais.
   * @method exceptionHandler
   * @description Captura erros não tratados e retorna uma resposta padronizada.
   * Em ambiente de desenvolvimento, exibe o erro no console.
   */
  exceptionHandler() {
    this.server.use(
      /**
       * Middleware de tratamento de erros.
       * @param {Error} err - Objeto de erro capturado.
       * @param {Request} req - Objeto de requisição.
       * @param {Response} res - Objeto de resposta.
       * @param {NextFunction} _next - Próxima função middleware (não utilizada).
       * @returns {Response} Resposta JSON com mensagem de erro.
       */
      (err: Error, req: Request, res: Response, _next: NextFunction) => {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }

        return res.status(500).json({
          erro: "Erro interno do servidor.",
        });
      }
    );
  }
}

/**
 * Exporta a instância do servidor configurado.
 * @default
 * @description Instância singleton da aplicação pronta para ser usada.
 */
export default new App().server;
