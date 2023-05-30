const express = require("express");
const { Op, fn, col } = require("sequelize");
const Project = require("../models/project");
const Employee = require("../models/employee");
const { WorksFor, sequelize } = require("../models");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const employee_id = user.employee_id;

    const employee = await Employee.findOne({
      where: { employee_id: employee_id },
      attributes: [
        "employee_id",
        "employee_name",
        "rrno",
        "email",
        "education",
        [
          fn("date_format", col("start_employment"), "%Y-%m-%d"),
          "start_employment",
        ],
        "address",
        "salary",
        "position",
        "dept_id",
        "manager",
        "auth_code",
        "skill_set",
        "dev_level",
        "annual",
      ],
    });

    const user_projects = await WorksFor.findAll({
      where: { employee_id: employee_id },
      attributes: ["employee_id", "project_id"],
    });

    // 참여했던, 참여 중인 프로젝트 모두 없을 경우 직원 정보만 넘기기
    if (user_projects.length == 0) {
      return res.status(200).json({
        employee,
        ongoingProjects: [],
        completedProjects: [],
        all_avg: [],
      });
    }

    const project_ids = user_projects.map((project) => project.project_id);

    const today = new Date();
    // 진행 중인 프로젝트 조회
    const raw_ongoingProjects = await WorksFor.findAll({
      where: {
        start_work: {
          [Op.lte]: today,
        },
        end_work: {
          [Op.gte]: today,
        },
        project_id: project_ids,
        employee_id: employee_id,
      },
      attributes: ["project_id"],
      include: { model: Project, required: true, attributes: ["project_name"] },
    });

    const ongoingProjects = [];
    raw_ongoingProjects.forEach((value) => {
      data = {
        project_id: value.project_id,
        project_name: value.Project.project_name,
      };
      ongoingProjects.push(data);
    });

    const all_avg_query = `select avg(eval_score) as all_avg \
    from ((select * from dbproject.pm_eval where evaluated = "${employee_id}") \
    union (select * from dbproject.co_eval where evaluated = "${employee_id}") \
    union (select * from dbproject.cus_eval where evaluated = "${employee_id}")) as t\
    group by evaluated;`;
    const all_avg = await sequelize.query(all_avg_query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const project_avg_query = `select t4.project_id, t4.project_name, avg
    from (select t2.project_id, ifnull(avg(eval_score), "미평가") as avg 
        from ((select *
        from dbproject.pm_eval
        where evaluated = '${employee_id}')
        union 
        (select * 
        from dbproject.co_eval
        where evaluated = '${employee_id}') 
        union 
        (select * 
        from dbproject.cus_eval
        where evaluated = '${employee_id}')) as t1 
        right join (select *
        from dbproject.works_for
        where employee_id='${employee_id}') t2 on t1.project_id = t2.project_id
        group by t2.project_id) as t3 join dbproject.project as t4 on t3.project_id=t4.project_id
        where end_project < now();`;
    const completedProjects = await sequelize.query(project_avg_query, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      employee,
      ongoingProjects,
      completedProjects,
      all_avg,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
