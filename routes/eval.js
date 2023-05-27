// 평가 요청 처리
const express = require("express");
const {
  PmEval,
  CoEval,
  CusEval,
  Project,
  sequelize,
  WorksFor,
  Eval,
} = require("../models");
const { fn, col, Op } = require("sequelize");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
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

    res.status(200).json({ projectNames });
  } catch (error) {
    console.error("Error retrieving project names from the database: ", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
