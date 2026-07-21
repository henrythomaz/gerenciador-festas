import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gerenciamento de Festas",
      version: "1.0.0",
      description: "API do sistema de Gerenciamento de Festas",
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/app/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
