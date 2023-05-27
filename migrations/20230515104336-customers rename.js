"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "customers",
      "custoemr_phone",
      "customer_phone"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "customers",
      "customer_phone",
      "custoemr_phone"
    );
  },
};
