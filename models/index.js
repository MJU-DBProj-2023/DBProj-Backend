const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.json")[env];
const db = {};

const Dept = require("./dept");
const Employee = require("./employee");
const SiteData = require("./siteData");
const Customer = require("./customer");
const Job = require("./job");
const Project = require("./project");
const WorksFor = require("./worksFor");
const Eval = require("./eval");
const CusEval = require("./cusEval");
const CoEval = require("./coEval");
const PmEval = require("./pmEval");

const sequelize = new Sequelize(
  config.databse,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

db.Dept = Dept;
db.Employee = Employee;
db.SiteData = SiteData;
db.Customer = Customer;
db.Job = Job;
db.Project = Project;
db.WorksFor = WorksFor;
db.Eval = Eval;
db.CoEval = CoEval;
db.CusEval = CusEval;
db.PmEval = PmEval;

Dept.init(sequelize);
Employee.init(sequelize);
SiteData.init(sequelize);
Customer.init(sequelize);
Job.init(sequelize);
Project.init(sequelize);
WorksFor.init(sequelize);
Eval.init(sequelize);
CoEval.init(sequelize);
CusEval.init(sequelize);
PmEval.init(sequelize);

WorksFor.associate(db);
Dept.associate(db);
Employee.associate(db);
SiteData.associate(db);
Customer.associate(db);
Job.associate(db);
Project.associate(db);
Eval.associate(db);
CoEval.associate(db);
CusEval.associate(db);
PmEval.associate(db);

module.exports = db;
