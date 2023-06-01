const Sequelize = require("sequelize");

class Dept extends Sequelize.Model {
  static init(sequelize) {
    const deptAttr = {
      dept_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      dept_name: {
        type: Sequelize.STRING(255),
      },
    };

    const deptTbl = {
      sequelize,
      underscored: true, // column명 camalCase 아닌 underscore 방식
      tableName: "dept",
      modelName: "Dept",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(deptAttr, deptTbl);
  }
  static associate(db) {
    db.Dept.hasMany(db.Project, {
      foreignKey: "dept_id",
      sourceKey: "dept_id",
    });
  }
}

module.exports = Dept;
