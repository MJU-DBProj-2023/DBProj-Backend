// 관리자의 프로젝트 관리 요청 처리 (프로젝트 등록 등)
const express = require("express");
const bcrypt = require("bcrypt");
const { parse_rrno_get_birth } = require("./middelwares");
const Employee = require("../models/employee");
const SiteData = require("../models/siteData");
const { Project } = require("../models");

const router = express.Router();

router.post("/createUser", async (req, res, next) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 2) {
    return res.status(401).json("등록 권한이 없습니다.");
  }
  if (
    req.body.employee_id == "" ||
    req.body.employee_name == "" ||
    req.body.rrno == "" ||
    req.body.email == "" ||
    req.body.education == "" ||
    req.body.start_employment == "" ||
    req.body.position == "" ||
    req.body.auth_code === "" ||
    req.body.dev_level === "" ||
    req.body.annual == ""
  ) {
    return res.status(400).json("필수 항목을 모두 입력해주세요.");
  }
  try {
    const employee = await Employee.create(req.body);

    // Create the corresponding site_data entry for the employee
    const pwd = parse_rrno_get_birth(employee.rrno);
    console.log(pwd);
    const hash = await bcrypt.hash(pwd, 12);
    const siteData = await SiteData.create({
      id: employee.employee_id, // Assuming employee_id is the same as the site_data id
      password: hash,
      employee_id: employee.employee_id,
      auth_code: employee.auth_code,
    });

    return res.status(200).json({ employee, siteData });
  } catch (error) {
    if (error.name == "SequelizeUniqueConstraintError") {
      return res.status(400).json("중복항목이 존재합니다.");
    }
    if (error.name == "SequelizeForeignKeyConstraintError") {
      return res.status(400).json("존재하는 부서와 매니저를 입력해주세요.");
    }
    return res.status(500).json("internal server error");
  }
});

router.post("/createProject", async (req, res, next) => {
  const user = req.user ? req.user : null;
  if (!user || user.auth_code != 2) {
    return res.status(401).json("등록 권한이 없습니다.");
  }
  if (
    req.body.project_id == "" ||
    req.body.project_name == "" ||
    req.body.start_project == "" ||
    req.body.end_project == "" ||
    req.body.description == ""
  ) {
    return res.status(400).json("필수 항목을 모두 입력해주세요.");
  }
  try {
    // Create the employee
    console.log(req.body);
    const project = await Project.create(req.body);
    return res.status(200).json({ project });
  } catch (error) {
    if (error.name == "SequelizeUniqueConstraintError") {
      return res.status(400).json("중복항목이 존재합니다.");
    }
    if (error.name == "SequelizeForeignKeyConstraintError") {
      return res.status(400).json("존재하는 고객과 PM을 입력해주세요.");
    }
    return res.status(500).json("internal server error");
  }
});

module.exports = router;
