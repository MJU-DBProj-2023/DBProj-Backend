// 경영진과 일반 직원의 프로젝트 관련 요청 처리
const express = require("express");
const { date_format } = require("./middelwares");
const { Op, fn, col } = require("sequelize");
const Project = require("../models/project");
const WorksFor = require("../models/worksFor");
const Employee = require("../models/employee");
const Job = require("../models/job");
const router = express.Router();

// // 프로젝트 전체 정보 조회
// router.get("/", async (req, res, next) => {
//   let today = new Date();
//   let dateString = date_format(today);
//   try {
//     project_ing = await Project.findAll({
//       raw: true,
//       where: {
//         end_project: { [Op.gt]: dateString },
//       },
//       attributes: ["project_id", "project_name", "budget", "customer", "pm"],
//     });
//     project_end = await Project.findAll({
//       raw: true,
//       where: {
//         end_project: { [Op.lte]: dateString },
//       },
//       attributes: ["project_id", "project_name", "budget", "customer", "pm"],
//     });
//     res.status(200).json({ response: [project_ing, project_end] });
//   } catch {
//     res.status(500).json({ err_msg: "서버 오류입니다." });
//   }
// });

// 경영진과 일반 직원의 프로젝트 관련 요청 처리
router.get("/", async (req, res, next) => {
  const employee_id = req.user ? req.user.employee_id : null;
  console.log(employee_id);
  const currentDate = new Date();
  try {
    const inProgressProjects = await Project.findAll({
      attributes: ["project_name"],
      where: {
        end_project: {
          [Op.gt]: currentDate,
        },
      },
    });

    const completedProjects = await Project.findAll({
      attributes: ["project_name"],
      where: {
        end_project: {
          [Op.lte]: currentDate,
        },
      },
    });

    const projectNames = inProgressProjects.map(
      (project) => project.project_name
    );
    const completedProjectNames = completedProjects.map(
      (project) => project.project_name
    );

    res.status(200).json({ projectNames, completedProjectNames });
  } catch (error) {
    console.error("Error retrieving project names from the database: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// 프로젝트ID, 프로젝트명, 고객 이름, 날짜로 프로젝트 검색
// 프로젝트ID, 프로젝트명, 예산, 발주처, 시작, 종료날짜, PM 반환
router.get("/search", async (req, res, next) => {
  const currentDate = new Date();
  const { project_id, project_name, customer, date } = req.query;

  try {
    let whereCondition = {
      end_project: {
        [Op.gt]: currentDate,
      },
    };

    if (project_id) {
      whereCondition.project_id = project_id;
    }

    if (project_name) {
      whereCondition.project_name = project_name;
    }

    if (customer) {
      whereCondition.customer = customer;
    }

    if (date) {
      whereCondition = {
        [Op.and]: [
          {
            start_project: {
              [Op.lte]: date,
            },
          },
          {
            end_project: {
              [Op.gte]: date,
            },
          },
        ],
      };
    }

    const inProgressProjects = await Project.findAll({
      attributes: [
        "project_id",
        "project_name",
        "budget",
        "customer",
        "start_project",
        "end_project",
        "PM",
      ],
      where: {
        ...whereCondition,
        end_project: {
          [Op.gt]: currentDate,
        },
      },
    });

    const completedProjects = await Project.findAll({
      attributes: [
        "project_id",
        "project_name",
        "budget",
        "customer",
        "start_project",
        "end_project",
        "pm",
      ],
      where: {
        ...whereCondition,
        end_project: {
          [Op.lte]: currentDate,
        },
      },
    });

    res_inProgressProjects = [];
    res_completedProjects = [];

    inProgressProjects.forEach((project) => {
      data = {
        project_id: project.project_id,
        project_name: project.project_name,
        budget: project.budget,
        customer: project.customer,
        start_project: date_format(new Date(project.start_project)),
        end_project: date_format(new Date(project.end_project)),
        pm: project.pm,
      };
      res_inProgressProjects.push(data);
    });

    completedProjects.forEach((project) => {
      data = {
        project_id: project.project_id,
        project_name: project.project_name,
        budget: project.budget,
        customer: project.customer,
        start_project: project.start_project,
        end_project: project.end_project,
        pm: project.pm,
      };
      res_completedProjects.push(data);
    });

    // 시작일과 종료일 사이에 프로젝트가 없을 경우에 대한 처리
    // if (
    //   date &&
    //   projectNames.length === 0 &&
    //   completedProjectNames.length === 0
    // ) {
    //   res.status(404).json({
    //     message: "No projects found between the specified dates.",
    //   });
    //   return;
    // }

    res.status(200).json({ res_inProgressProjects, res_completedProjects });
  } catch (error) {
    console.error("Error retrieving project names from the database: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// 프로젝트 상세정보 조회
router.get("/search/detail/:project_id", async (req, res, next) => {
  project_id = req.params.project_id;
  try {
    project_detail = await Project.findAll({
      raw: true,
      where: { project_id },
      attributes: [
        "project_id",
        "project_name",
        "description",
        "start_project",
        "end_project",
        "customer",
        "budget",
        "pm",
        "dev_tool",
        "dev_skill",
        "dev_language",
        "customer",
        "customer_phone",
        "customer_email",
      ],
      include: {
        model: WorksFor,
        required: true,
        attributes: ["employee_id"],
        include: [
          {
            model: Employee,
            Job,
            require: true,
            attributes: ["employee_name", "dept_id"],
          },
          {
            model: Job,
            require: true,
            attributes: ["job_name"],
          },
        ],
      },
    });

    try {
      response = {
        project_id: project_detail[0].project_id,
        project_name: project_detail[0].project_name,
        description: project_detail[0].description,
        start_project: date_format(new Date(project_detail[0].start_project)),
        end_project: date_format(new Date(project_detail[0].end_project)),
        budget: project_detail[0].budget,
        pm: project_detail[0].pm,
        dev_tool: project_detail[0].dev_tool,
        dev_skill: project_detail[0].dev_skill,
        dev_language: project_detail[0].dev_language,
        customer: project_detail[0].customer,
        customer_phone: project_detail[0].customer_phone,
        customer_email: project_detail[0].customer_email,
        works_for: [],
      };
    } catch (ReferenceError) {
      return res.status(200).json([]);
    }

    project_detail.forEach((project) => {
      employee = {
        employee_id: project["WorksFors.employee_id"],
        employee_name: project["WorksFors.Employee.employee_name"],
        dept_id: project["WorksFors.Employee.dept_id"],
        job_name: project["WorksFors.Job.job_name"],
      };
      response.works_for.push(employee);
    });

    res.status(200).json([response]);
  } catch {
    res.json({ err_msg: "서버 오류입니다." });
  }
});

module.exports = router;
