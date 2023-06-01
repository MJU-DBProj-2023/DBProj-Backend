"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("pm_eval", "evaluated_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("pm_eval", "evaluated_id");
  },
};
