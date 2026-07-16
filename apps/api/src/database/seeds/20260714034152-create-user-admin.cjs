"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email",
      { replacements: { email } }
    );

    if (!users.length) {
      await queryInterface.bulkInsert("users", [
        {
          name: "Admin",
          email,
          password_hash: await bcrypt.hash(password, 8),

          email_confirmed: true,
          email_confirmation_token: null,
          last_login: null,

          created_at: new Date(),
          updated_at: new Date(),
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
