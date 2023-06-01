const Sequelize = require("sequelize");

class PmEval extends Sequelize.Model {
  static init(sequelize) {
    const pmEvalAttr = {
      evaluator: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      evaluated: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      eval_num: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      eval_score: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      eval_content: {
        type: Sequelize.STRING(255),
      },
      project_id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
    };

    const pmEvalTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      tableName: "pm_eval",
      modelName: "PmEval",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(pmEvalAttr, pmEvalTbl);
  }
  static associate(db) {
    db.PmEval.belongsTo(db.Project, {
      foreignKey: "project_id",
      targetKey: "project_id",
      onDelete: "NO ACTION",
    });
    db.PmEval.belongsTo(db.Employee, {
      foreignKey: "evaluated",
      targetKey: "employee_id",
      onDelete: "CASCADE",
    });
    db.PmEval.belongsTo(db.Eval, {
      foreignKey: "eval_num",
      targetKey: "eval_num",
      onDelete: "NO ACTION",
    });
  }
}

module.exports = PmEval;
