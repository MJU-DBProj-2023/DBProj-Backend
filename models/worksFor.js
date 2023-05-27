const Sequelize = require("sequelize");
const { Project, Employee } = require("./index");

class WorksFor extends Sequelize.Model {
  static init(sequelize) {
    const worksForAttr = {
      employee_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      project_id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
      job_code: {
        type: Sequelize.STRING(20),
      },
      start_work: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_work: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    };

    const worksForTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      taleName: "works_for",
      modelName: "WorksFor",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(worksForAttr, worksForTbl);
  }
  static associate(db) {
    db.WorksFor.belongsTo(db.Job, {
      foreignKey: "job_code",
      targetKey: "job_code",
    });
    // db.Employee.belongsToMany(db.Project, {
    //   through: WorksFor,
    //   as: "Workers",
    //   onDelete: "CASCADE",
    // });
    // db.Project.belongsToMany(db.Employee, {
    //   through: WorksFor,
    //   as: "Projects",
    //   onDelete: "CASCADE",
    // });
    db.WorksFor.belongsTo(db.Employee, {
      foreignKey: "employee_id",
      targetKey: "employee_id",
    });
    db.WorksFor.belongsTo(db.Project, {
      foreignKey: "project_id",
      targetKey: "project_id",
    });
  }
  // Employee(Assign된 직원)와 N 대 M (N 직원 - M 프로젝트) - works_for
  // job과 1 대 M (1 job - M works_for)
}

module.exports = WorksFor;
