const express = require("express");
const { Op, fn } = require("sequelize");
const { sequelize } = require("../models");
const WorksFor = require("../models/worksFor");
const Employee = require("../models/employee");
const Job = require("../models/job");
const router = express.Router();

//투입 삭제는 프로젝트 조회 페이지로부터
router.delete("/delete", async (req, res) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 1) {
    return res.status(401).json("Unauthenticated");
  }
  const { employee_id, project_id } = req.query;
  if (!employee_id || !project_id) {
    return res.status(400).json("직원 및 프로젝트 정보를 가져올 수 없습니다.");
  }
  try {
    query = `delete from dbproject.works_for where employee_id = "${employee_id}" and project_id = "${project_id}";`;
    const response = await sequelize.query(query);
    return res.status(200).json("Delete success");
  } catch {
    return res.status(500).json("internal server error");
  }
});

// 투입버튼 누르면 경영진의 직원 -> 프로젝트 투입 폼 나옴
// 이때 현재 진행 중인 프로젝트 중, 직원이 참여하지 않는 프로젝트 추출
router.get("/assign/:employee_id", async (req, res) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 1) {
    return res.status(401).json("Unauthenticated");
  }
  const employee_id = req.params.employee_id;
  if (!employee_id) {
    return res.status(400).json("직원 정보를 가져올 수 없습니다.");
  }
  try {
    query1 = `
        select project_id, project_name, budget, date_format(start_project, '%Y-%m-%d') as "start_project", date_format(end_project, '%Y-%m-%d') as "end_project", customer
        from dbproject.project as t1
                where not exists (select * 
                                from dbproject.works_for t2 
                                where t1.project_id = t2.project_id and t2.employee_id='${employee_id}')
        and end_project > now();`;
    const canAssignProjects = await sequelize.query(query1, {
      type: sequelize.QueryTypes.SELECT,
    });

    const employee = await Employee.findAll({
      where: { employee_id },
      attributes: [
        "employee_id",
        "employee_name",
        "position",
        "dept_id",
        "dev_level",
        "skill_set",
      ],
    });
    return res.status(200).json({ canAssignProjects, employee });
  } catch {
    return res.status(500).json("insternal server error");
  }
});

router.post("/assign", async (req, res) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 1) {
    return res.status(401).json("Unauthenticated");
  }
  if (
    req.body.project_id == "" ||
    req.body.employee_id == "" ||
    req.body.start_work == "" ||
    req.body.end_work == ""
  ) {
    return res.status(400).json("필수 항목을 모두 입력해주세요.");
  }
  try {
    const worksFor = await WorksFor.create(req.body);
    return res.status(200).json({ success: worksFor });
  } catch (error) {
    if (error.name == "SequelizeUniqueConstraintError") {
      return res.status(400).json("중복항목이 존재합니다.");
    }
    if (error.name == "SequelizeForeignKeyConstraintError") {
      return res
        .status(400)
        .json("존재하는 프로젝트 ID와 직무코드를 입력해주세요.");
    }
    return res.status(500).json("internal server error");
  }
});

router.patch("/update", async (req, res) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 1) {
    return res.status(401).json("Unauthenticated");
  }
  try {
    const { employee_id, project_id } = req.query;
    const { job_name, start_work, end_work } = req.body.editedItem;
    console.log(req.body);
    if (!employee_id || !project_id) {
      return res
        .status(400)
        .json("작원 및 프로젝트 정보를 가져올 수 없습니다.");
    }
    if (!job_name || !start_work || !end_work) {
      return res.status(400).json("항목을 모두 입력해주세요");
    }
    const job = await Job.findOne({
      where: { job_name },
      attributes: ["job_code"],
    });
    if (!job) {
      return res.status(400).json("존재하지 않는 직책입니다.");
    }
    const job_code = job.job_code;

    const query = `update dbproject.works_for set job_code='${job_code}'
  , start_work='${start_work}', end_work='${end_work}' 
  where employee_id='${employee_id}' and project_id='${project_id}';`;
    await sequelize.query(query);

    return res.status(200).json("성공적으로 수정하였습니다.");
  } catch {
    return res.status(500).json("internal server error");
  }
});

module.exports = router;
