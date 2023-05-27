// 평가 요청 처리
const express = require("express");
const { PmEval, CoEval, CusEval, Project, sequelize } = require("../models");
const { fn, col } = require("sequelize");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

router.get("/", async (req, res, next) => {
  if (req.query.type == "pm") {
    try {
      const eval_lists = PmEval.findAll({
        raw: true,
        attributes: ["project_id"],
        include: {
          model: Project,
          required: true,
          attributes: ["project_name"],
        },
      });
      res.json(eval_lists);
    } catch {
      res.json({ err_msg: "서버 오류입니다." });
    }
  } else if (req.query.type == "customer") {
    try {
      const eval_lists = CusEval.findAll({
        raw: true,
        attributes: ["project_id"],
        include: {
          model: Project,
          required: true,
          attributes: ["project_name"],
        },
      });
      res.json(eval_lists);
    } catch {
      res.json({ err_msg: "서버 오류입니다." });
    }
  }
  if (req.query.type == "colleague") {
    try {
      const eval_lists = CoEval.findAll({
        raw: true,
        attributes: ["project_id"],
        include: {
          model: Project,
          required: true,
          attributes: ["project_name"],
        },
      });
      res.json(eval_lists);
    } catch {
      res.json({ err_msg: "서버 오류입니다." });
    }
  }
});

router.get("/:project_id", async (res, req, next) => {
  const project_id = req.params.project_id;
  if (req.query.type == "customer") {
    try {
      const eval_detail = await CusEval.findAll({
        where: { project_id },
        order: [[fn("avg", col("eval_score")), "DESC"]],
        group: "evaluated",
      });
      return res.json(eval_detail);
    } catch {
      return res.json({ err_msg: "서버 오류입니다." });
    }
  } else if (req.query.type == "colleague") {
    try {
      const eval_detail = await CoEval.findAll({
        where: { project_id },
        order: [[fn("avg", col("eval_score")), "DESC"]],
        group: "evaluated",
      });
      return res.json(eval_detail);
    } catch {
      return res.json({ err_msg: "서버 오류입니다." });
    }
  }
  if (req.query.type == "pm") {
    try {
      const eval_detail = await PmEval.findAll({
        where: { project_id },
        order: [[fn("avg", col("eval_score")), "DESC"]],
        group: "evaluated",
      });
      return res.json(eval_detail);
    } catch {
      return res.json({ err_msg: "서버 오류입니다." });
    }
  }
});

module.exports = router;
