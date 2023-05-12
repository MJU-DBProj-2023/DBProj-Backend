const Sequelize = require("sequelize");

class Customer extends Sequelize.Model {
  static init(sequelize) {
    const customerAttr = {
      customer: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
      customer_address: {
        type: Sequelize.STRING(150),
      },
      custoemr_phone: {
        type: Sequelize.STRING(50),
      },
    };

    const customerTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      taleName: "customer",
      modelName: "Customer",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(customerAttr, customerTbl);
  }
  static associate(db) {
    db.Customer.hasMany(db.Project, {
      foreignKey: "customer",
      sourceKey: "customer",
    });
  }
  // Project와 1 대 N (1 고객 - N 프로젝트)
}

module.exports = Customer;
