const Sequelize = require("sequelize");

class Eval extends Sequelize.Model {
  static init(sequelize) {
    const evalAttr = {
      eval_num: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      question: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    };

    const evalTbl = {
      sequelize,
      underscored: true, // column명 camalCase 아닌 underscore 방식
      tableName: "eval",
      modelName: "Eval",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(evalAttr, evalTbl);
  }
  static associate(db) {
    db.Eval.hasMany(db.CoEval, {
      foreignKey: "eval_num",
      sourceKey: "eval_num",
    });
    db.Eval.hasMany(db.PmEval, {
      foreignKey: "eval_num",
      sourceKey: "eval_num",
    });
    db.Eval.hasMany(db.CusEval, {
      foreignKey: "eval_num",
      sourceKey: "eval_num",
    });
  }
  // 평가랑 1 대 M
}

module.exports = Eval;
