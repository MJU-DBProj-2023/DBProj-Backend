"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "employees",
      "start_employeement",
      "start_employment"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "employees",
      "start_employment",
      "start_employeement"
    );
  },
};
