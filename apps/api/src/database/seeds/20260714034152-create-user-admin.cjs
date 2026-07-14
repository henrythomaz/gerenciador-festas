"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    const [usuarios] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email",
      { replacements: { email } }
    );

    if (!usuarios.length) {
      await queryInterface.bulkInsert("users", [
        {
          nome: "Admin",
          email,
          senha_hash: await bcrypt.hash(senha, 8),

          email_confirmado: true,
          email_confirmacao_token: null,
          ultimo_login: null,

          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: process.env.ADMIN_EMAIL,
    });
  },
};
