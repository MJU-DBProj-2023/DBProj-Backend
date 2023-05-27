// 경영진의 개발자 관리 처리
const WorksFor = require("../models/worksFor");
const Employee = require("../models/employee");
const Project = require("../models/project");
const Job = require("../models/job");
const { Op, fn, col, QueryTypes } = require("sequelize");
const { date_format } = require("./middelwares");
const express = require("express");
const { sequelize } = require("../models");
const router = express.Router();

// 검색하면 줘야하는 정보 - Employee(사번, 이름, 스킬셋, 개발레벨) + works_for(직책)
// works_for의 employee_id로 employee와 join 해야
// 검색구분: 프로젝트명, 직원명
// 필터링: 개발레벨, 스킬셋, 직책, 참여유무(Works_for에 존재하냐 안하냐)
// https://study-ihl.tistory.com/103
// 18
router.get("/search", async (req, res, next) => {
  const employee_condition = {};
  const job_condition = {};
  const {
    project_name,
    employee_name,
    dev_level,
    skill_set,
    job_name,
    not_working,
  } = req.query;

  console.log(req.query);

  if (skill_set) {
    employee_condition.skill_set = { [Op.like]: "%" + skill_set + "%" };
  }
  if (dev_level) {
    employee_condition.dev_level = dev_level;
  }
  if (job_name) {
    job_condition.job_name = job_name;
  }

  // project_name으로 검색했을 경우 - 해당 프로젝트에 참여 중인, 참여했던 직원 리스트
  if (project_name) {
    try {
      const employee_list = await Project.findAll({
        // raw: true,
        where: { project_name: { [Op.like]: "%" + project_name + "%" } },
        attributes: ["project_name"],
        include: {
          model: WorksFor,
          required: true,
          attributes: ["job_code"],
          include: [
            {
              model: Job,
              required: true,
              where: { ...job_condition },
              attributes: ["job_name"],
            },
            {
              model: Employee,
              required: true,
              where: { ...employee_condition },
              attributes: [
                "employee_id",
                "employee_name",
                "skill_set",
                "dev_level",
              ],
            },
          ],
        },
      });
      return res.status(200).json(employee_list);
    } catch {
      res.status(500).json("internal server error");
    }
  }
  // employee_name으로 검색했을 경우
  if (employee_name) {
    try {
      const employee_list = await Employee({
        where: { employee_name, ...employee_condition },
        attributes: ["employee_id", "employee_name", "skill_set", "dev_level"],
        include: {
          model: WorksFor,
          required: true,
          attributes: ["job_code"],
          include: {
            model: Job,
            required: true,
            where: { ...job_condition },
            attributes: ["job_name"],
          },
        },
      });
      return res.status(200).json(employee_list);
    } catch {
      return res.status(500).json("internal server error");
    }
  }

  if (not_working) {
    try {
      const query = `select employee_id, employee_name, skill_set, dev_level \
      from DBProject.employees as r1 \
      where not exists ( \
      select distinct employee_id \
      from dbproject.works_fors as r2 \
      where r1.employee_id = r2.employee_id \
      and r2.end_work  > now() \
      ) and auth_code = 0;`;
      const employee_list = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return res.status(200).json(employee_list);
    } catch {
      return res.status(500).json("internal server error");
    }
  }
});

// 투입, 종료, 평균 평점
// 19
router.get("/search/detail", async (req, res, next) => {
  if (req.query.employee_id) {
    let today = new Date();
    let dateString = date_format(today);
    try {
      const employee_id = req.query.employee_id;
      const data_end = await WorksFor.findAll({
        raw: true,
        where: {
          employee_id,
          end_work: { [Op.gt]: dateString },
        },
        attributes: ["end_work", "job_code"],
        include: {
          model: Job,
          required: true,
          attributes: ["job_name"],
        },
        include: {
          model: Project,
          required: true,
          attributes: ["project_name"],
        },
      });
      const data_ing = await WorksFor.findAll({
        where: {
          employee_id,
          end_work: { [Op.lte]: dateString },
        },
        attributes: [
          fn("DATE_FORMAT", col("WorksFor.end_work"), "%YYYY-%mm-%dd"),
          "job_code",
        ],
        include: {
          model: Job,
          required: true,
          attributes: ["job_code", "job_name"],
        },
        include: {
          model: Project,
          required: true,
          attributes: ["project_name"],
        },
      });
      console.log("\n");
      // console.log(data_end[0]["Project.project_name"]);
      return res.json([data_end, data_ing]);
    } catch {
      return res.json({ err_msg: "서버 오류입니다." });
    }
  }
});

module.exports = router;
