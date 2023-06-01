const Sequelize = require("sequelize");

class Job extends Sequelize.Model {
  static init(sequelize) {
    const jobAttr = {
      job_code: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      job_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    };

    const jobTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      tableName: "job",
      modelName: "Job",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(jobAttr, jobTbl);
  }
  static associate(db) {
    db.Job.hasMany(db.WorksFor, {
      foreignKey: "job_code",
      sourceKey: "job_code",
    });
  }
  // works_for와 1 대 M (1 job - M works_for)
}

module.exports = Job;
