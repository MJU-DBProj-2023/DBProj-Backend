const Sequelize = require("sequelize");

class Employee extends Sequelize.Model {
  static init(sequelize) {
    const employeeAttr = {
      employee_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
      },
      employee_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      rrno: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      education: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      start_employment: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(150),
      },
      salary: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      position: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      dept_id: {
        type: Sequelize.STRING(20),
      },
      manager: {
        type: Sequelize.STRING(20),
      },
      auth_code: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      skill_set: {
        type: Sequelize.STRING(255),
      },
      dev_level: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      annual: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
    };

    const employeeTbl = {
      sequelize,
      timestamps: true, // create_at 등 시간 관련 컬럼 자동 생성
      createdAt: true,
      updatedAt: false,
      paranoid: true, // deleted_at 데이터 실제 삭제되진 않지만 삭제된 효과 (find 할 때 검색 제외)
      underscored: true, // column명 camalCase 아닌 underscore 방식
      tableName: "employee",
      modelName: "Employee",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    };

    return super.init(employeeAttr, employeeTbl);
  }
  static associate(db) {
    db.Employee.belongsTo(db.Dept, {
      foreignKey: "dept_id",
      targetKey: "dept_id",
    });
    db.Employee.hasMany(db.Project, {
      foreignKey: "pm",
      sourceKey: "employee_id",
    });
    db.Employee.hasOne(db.SiteData, {
      foreignKey: "employee_id",
      sourceKey: "employee_id",
    });
    db.Employee.hasMany(db.CoEval, {
      foreignKey: "evaluated",
      sourceKey: "employee_id",
    });
    db.Employee.hasMany(db.CusEval, {
      foreignKey: "evaluated",
      sourceKey: "employee_id",
    });
    db.Employee.hasMany(db.PmEval, {
      foreignKey: "evaluated",
      sourceKey: "employee_id",
    });
    db.Employee.hasMany(db.Employee, {
      foreignKey: "manager",
      targetKey: "employee_id",
    });
    db.Employee.belongsTo(db.Employee, {
      foreignKey: "manager",
      sourceKey: "employee_id",
    });

    db.Employee.hasMany(db.WorksFor, {
      foreignKey: "employee_id",
      sourceKey: "employee_id",
    });
  }
  // Dept와 1 대 N (부서 1 : 직원 N)
  // SiteData와 1 대 1
  // Project와 N 대 M
  // Project와 1 대 M (매니저 1 : 프로젝트 M)
  // 평가들과 관계....

  // 자기 자신과 N 대 N (매니저 N : 직원 M) -> 이거 ORM으로 구현하는 문법이 없는 것 같음
}

module.exports = Employee;
