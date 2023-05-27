// 관리자의 프로젝트 관리 요청 처리 (프로젝트 등록 등)
const express = require("express");
const bcrypt = require("bcrypt");
const { parse_rrno_get_birth } = require("./middelwares");
const Employee = require("../models/employee");
const SiteData = require("../models/siteData");
const { Project } = require("../models");

const router = express.Router();

router.post("/createUser", async (req, res, next) => {
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
    next(error);
  }
});

router.post("/createProject", async (req, res, next) => {
  try {
    // Create the employee
    console.log(req.body);
    const project = await Project.create(req.body);
    return res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
