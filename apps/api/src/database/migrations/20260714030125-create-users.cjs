"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      senha_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email_confirmado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      email_confirmacao_token: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      ultimo_login: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
