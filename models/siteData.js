const Sequelize = require("sequelize");

class SiteData extends Sequelize.Model {
  static init(sequelize) {
    const siteDataAttr = {
      id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.STRING(20),
      },
    };

    const siteDataTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      taleName: "site_data",
      modelName: "SiteData",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(siteDataAttr, siteDataTbl);
  }
  static associate(db) {
    db.SiteData.belongsTo(db.Employee, {
      foreignKey: "employee_id",
      targetKey: "employee_id",
      onDelete: "CASCADE",
    });
  }
  // Employee와 1 대 1
}

module.exports = SiteData;
