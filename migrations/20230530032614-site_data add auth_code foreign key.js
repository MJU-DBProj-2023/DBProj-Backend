"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("site_data", {
      fields: ["employee_id"],
      type: "foreign key",
      name: "site_data_fk_employee_id",
      references: {
        table: "employee",
        field: "employee_id",
      },
      onDelete: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "site_data",
      "site_data_fk_employee_id"
    );
  },
};
