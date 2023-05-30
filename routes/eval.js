// 평가 요청 처리
const express = require("express");
const {
  PmEval,
  CoEval,
  CusEval,
  Project,
  sequelize,
  WorksFor,
  Employee,
  Eval,
} = require("../models");
const { fn, col, Op } = require("sequelize");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const today = new Date();
    const projects = await Project.findAll({
      where: { end_project: { [Op.lt]: today } },
      attributes: [
        "project_id",
        "project_name",
        [
          sequelize.fn("AVG", sequelize.col("CusEvals.eval_score")),
          "avg_cus_rating",
        ],
        [
          sequelize.fn("AVG", sequelize.col("CoEvals.eval_score")),
          "avg_co_rating",
        ],
        [
          sequelize.fn("AVG", sequelize.col("PmEvals.eval_score")),
          "avg_pm_rating",
        ],
      ],
      include: [
        {
          model: WorksFor,
          attributes: [],
        },
        {
          model: CusEval,
          attributes: [],
          required: false,
        },
        {
          model: CoEval,
          attributes: [],
          required: false,
        },
        {
          model: PmEval,
          attributes: [],
          required: false,
        },
      ],
      group: ["Project.project_id"],
    });

    const projectNames = projects.map((project) => ({
      project_id: project.project_id,
      project_name: project.project_name,
      avg_cus_rating: project.dataValues.avg_cus_rating,
      avg_co_rating: project.dataValues.avg_co_rating,
      avg_pm_rating: project.dataValues.avg_pm_rating,
    }));

    res.status(200).json({ projectNames });
  } catch (error) {
    console.error("Error retrieving project names from the database: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/search", async (req, res, next) => {
  const { project_name } = req.query;

  try {
    const today = new Date();
    const projects = await Project.findAll({
      attributes: [
        "project_id",
        "project_name",
        [
          sequelize.fn("AVG", sequelize.col("CusEvals.eval_score")),
          "avg_cus_rating",
        ],
        [
          sequelize.fn("AVG", sequelize.col("CoEvals.eval_score")),
          "avg_co_rating",
        ],
        [
          sequelize.fn("AVG", sequelize.col("PmEvals.eval_score")),
          "avg_pm_rating",
        ],
      ],
      where: {
        project_name: {
          [Op.eq]: project_name,
        },
        end_project: {
          [Op.lt]: today,
        },
      },
      include: [
        {
          model: WorksFor,
          attributes: [],
        },
        {
          model: CusEval,
          attributes: [],
          required: false,
        },
        {
          model: CoEval,
          attributes: [],
          required: false,
        },
        {
          model: PmEval,
          attributes: [],
          required: false,
        },
      ],
      group: ["Project.project_id"],
    });

    const projectNames = projects.map((project) => ({
      project_id: project.project_id,
      project_name: project.project_name,
      avg_cus_rating: project.dataValues.avg_cus_rating,
      avg_co_rating: project.dataValues.avg_co_rating,
      avg_pm_rating: project.dataValues.avg_pm_rating,
    }));

    return res.status(200).json({ projectNames });
  } catch (error) {
    console.error("Error retrieving project names from the database: ", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/detail", async (req, res) => {
  const project_id = req.query.project_id;

  try {
    const project = await Project.findOne({
      where: {
        project_id: project_id,
        deleted_at: null,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const employeeData = await WorksFor.findAll({
      attributes: [
        "employee_id",
        "project_id",
        "job_code",
        "start_work",
        "end_work",
        "created_at",
        "deleted_at",
      ],
      include: [
        {
          model: Employee,
          attributes: ["employee_id", "employee_name"],
        },
      ],
      where: {
        project_id: project.project_id,
        deleted_at: null,
      },
    });

    const employeeDataWithAverages = await Promise.all(
      employeeData.map(async (workFor) => {
        const employee = workFor.Employee;
        const { avg_cus_score } = await CusEval.findOne({
          attributes: [
            [sequelize.fn("AVG", sequelize.col("eval_score")), "avg_cus_score"],
          ],
          where: {
            project_id: project.project_id,
            evaluated: employee.employee_id,
            deleted_at: null,
          },
          raw: true,
        });

        const { avg_co_score } = await CoEval.findOne({
          attributes: [
            [sequelize.fn("AVG", sequelize.col("eval_score")), "avg_co_score"],
          ],
          where: {
            project_id: project.project_id,
            evaluated: employee.employee_id,
            deleted_at: null,
          },
          raw: true,
        });

        const { avg_pm_score } = await PmEval.findOne({
          attributes: [
            [sequelize.fn("AVG", sequelize.col("eval_score")), "avg_pm_score"],
          ],
          where: {
            project_id: project.project_id,
            evaluated: employee.employee_id,
            deleted_at: null,
          },
          raw: true,
        });

        let all_avg_score =
          (Number(avg_co_score) +
            Number(avg_cus_score) +
            Number(avg_pm_score)) /
          3;
        console.log(avg_co_score + avg_cus_score + avg_pm_score);
        console.log("전체평균", all_avg_score);

        return {
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          avg_cus_score: Number(avg_cus_score).toFixed(2) || 0,
          avg_co_score: Number(avg_co_score).toFixed(2) || 0,
          avg_pm_score: Number(avg_pm_score).toFixed(2) || 0,
          all_avg_score,
        };
      })
    );

    const employeeDataWithAveragesSorted = employeeDataWithAverages.sort(
      (a, b) => b.all_avg_score - a.all_avg_score
    );

    const projectData = {
      project_id: project.project_id,
      project_name: project.project_name,
      employees: employeeDataWithAveragesSorted,
    };

    return res.json(projectData);
  } catch (error) {
    console.error("Error retrieving project details from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
