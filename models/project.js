const Sequelize = require("sequelize");

class Project extends Sequelize.Model {
  static init(sequelize) {
    const projectAttr = {
      project_id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
      project_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      pm: {
        type: Sequelize.STRING(50),
      },
      budget: {
        type: Sequelize.INTEGER,
      },
      dev_tool: {
        type: Sequelize.STRING(255),
      },
      dev_skill: {
        type: Sequelize.STRING(255),
      },
      dev_language: {
        type: Sequelize.STRING(255),
      },
      start_project: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_project: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      customer: {
        type: Sequelize.STRING(50),
      },
      customer_manager: {
        type: Sequelize.STRING(50),
      },
      customer_phone: {
        type: Sequelize.STRING(50),
      },
      customer_email: {
        type: Sequelize.STRING(100),
        validate: {
          isEmail: true,
        }, // 데이터 유효성 검사
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    };

    const projectTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      taleName: "project",
      modelName: "Project",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(projectAttr, projectTbl);
  }
  static associate(db) {
    db.Project.belongsTo(db.Customer, {
      foreignKey: "customer",
      targetKey: "customer",
    });
    db.Project.belongsTo(db.Employee, {
      foreignKey: "pm",
      targetKey: "employee_id",
    });
    db.Project.hasMany(db.CoEval, {
      foreignKey: "project_id",
      sourceKey: "project_id",
    });
    db.Project.hasMany(db.CusEval, {
      foreignKey: "project_id",
      sourceKey: "project_id",
    });
    db.Project.hasMany(db.PmEval, {
      foreignKey: "project_id",
      sourceKey: "project_id",
    });
  }
  // Customer와 1 대 N (1 고객 - N 프로젝트)
  // Employee(PM)와 1 대 N (1 PM - N 프로젝트)
  // Employee(Assign된 직원)와 N 대 M (N 직원 - M 프로젝트) - works_for
  // cus_eval, ..과 1 대 M (M 평가 - 1 프로젝트)
}

module.exports = Project;
