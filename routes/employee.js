// 경영진의 개발자 관리 처리
const WorksFor = require("../models/worksFor");
const Employee = require("../models/employee");
const Project = require("../models/project");
const Job = require("../models/job");
const { Op, fn, col } = require("sequelize");
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
  const user = req.user;
  if (!user || user.auth_code != 1) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  const employee_condition = {
    auth_code: 0,
    [Op.or]: [{ dept_id: "D004" }, { dept_id: "D003" }],
  };
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

  if (!project_name && !employee_name && !not_working) {
    try {
      if (job_name != "") {
        console.log("job name null 아님");
        const employee_list = await Employee.findAll({
          where: { ...employee_condition },
          attributes: [
            "employee_id",
            "employee_name",
            "skill_set",
            "dev_level",
          ],
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

        const res_employee_list = [];
        employee_list.forEach((tuple) => {
          let job_data = [];
          let data = {
            employee_id: tuple.employee_id,
            employee_name: tuple.employee_name,
            skill_set: tuple.skill_set,
            dev_level: tuple.dev_level,
            job_name: [],
          };
          tuple.WorksFors.forEach((tuple) => {
            job_data.push(tuple.Job.job_name);
          });
          data.job_name = job_data;
          res_employee_list.push(data);
        });
        return res.status(200).json(res_employee_list);
      }
      const employee_list = await Employee.findAll({
        where: { ...employee_condition },
        attributes: ["employee_id", "employee_name", "skill_set", "dev_level"],
        include: {
          model: WorksFor,
          attributes: ["job_code"],
          include: {
            model: Job,
            required: true,
            where: { ...job_condition },
            attributes: ["job_name"],
          },
        },
      });

      const res_employee_list = [];
      employee_list.forEach((tuple) => {
        let job_data = [];
        let data = {
          employee_id: tuple.employee_id,
          employee_name: tuple.employee_name,
          skill_set: tuple.skill_set,
          dev_level: tuple.dev_level,
          job_name: [],
        };
        tuple.WorksFors.forEach((tuple) => {
          job_data.push(tuple.Job.job_name);
        });
        data.job_name = job_data;
        res_employee_list.push(data);
      });
      return res.status(200).json(res_employee_list);
    } catch {
      return res.status(500).json("internal server error");
    }
  }

  // project_name으로 검색했을 경우 - 해당 프로젝트에 참여 중인, 참여했던 직원 리스트
  if (project_name) {
    try {
      const employee_list = await Project.findAll({
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

      const res_employee_list = [];
      if (employee_list.length != 0) {
        employee_list[0].WorksFors.forEach((tuple) => {
          let data = {
            employee_id: tuple.Employee.employee_id,
            employee_name: tuple.Employee.employee_name,
            skill_set: tuple.Employee.skill_set,
            dev_level: tuple.Employee.dev_level,
            job_name: tuple.Job.job_name,
          };
          res_employee_list.push(data);
        });
        return res.status(200).json(res_employee_list);
      } else {
        return res.status(200).json(employee_list);
      }
    } catch {
      res.status(500).json("project - internal server error");
    }
  }
  // employee_name으로 검색했을 경우
  if (employee_name) {
    try {
      const employee_list = await Employee.findAll({
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
      const res_employee_list = [];
      employee_list.forEach((tuple) => {
        let job_data = [];
        let data = {
          employee_id: tuple.employee_id,
          employee_name: tuple.employee_name,
          skill_set: tuple.skill_set,
          dev_level: tuple.dev_level,
          job_name: [],
        };
        tuple.WorksFors.forEach((tuple) => {
          job_data.push(tuple.Job.job_name);
        });
        data.job_name = job_data;
        res_employee_list.push(data);
      });

      return res.status(200).json(res_employee_list);
    } catch {
      return res.status(500).json("employee - internal server error");
    }
  }

  if (not_working) {
    try {
      const query = `select distinct employee_id, employee_name, skill_set, dev_level, job_name
      from (select r1.employee_id, employee_name, skill_set, auth_code, dev_level, job_code
      from (select employee_id, employee_name, skill_set, dev_level, auth_code
      from DBProject.employee as r1 
            where not exists ( 
            select distinct employee_id 
            from dbproject.works_for as r2 
            where r1.employee_id = r2.employee_id 
            and r2.end_work  > now() 
            )) as r1 left join dbproject.works_for r2
            on r1.employee_id = r2.employee_id) as t1
            left join dbproject.job t2 on t1.job_code = t2.job_code
	    where auth_code=0 and dev_level!=0;`;
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
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const employee_id = req.query.employee_id;
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

    const project_avg_query = `select t2.project_id, project_name, ifnull(avg(eval_score), "미평가") as avg 
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
    right join dbproject.project as t2 on t2.project_id = t1.project_id
    where end_project < now()
    group by t2.project_id, project_name;`;
    const completedProjects = await sequelize.query(project_avg_query, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      employee,
      ongoingProjects,
      completedProjects,
      all_avg,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

router.get("/working_days", async (req, res) => {
  const user = req.user ? req.user : null;
  if (!user) {
    return res.status(401).json("Unauthenticated ");
  }
  if (user.auth_code != 1) {
    return res.status(401).json("Unauthenticated ");
  }
  try {
    const year = req.query.year;
    const query = `select employee_id, employee_name, dept_id, working_days
    from (SELECT employee_id, sum(working_days) as working_days
    FROM (
        SELECT employee_id, project_id, DATEDIFF(end_work, start_work) AS working_days
        FROM dbproject.works_for
        WHERE DATE_FORMAT(start_work, '%Y') = "${year}" AND
            DATE_FORMAT(end_work, '%Y') = "${year}"
        UNION
        SELECT employee_id, project_id, DATEDIFF(end_work, concat("${year}", "-01", "-01")) AS working_days
        FROM dbproject.works_for
        WHERE DATE_FORMAT(start_work, '%Y') < "${year}" AND
            DATE_FORMAT(end_work, '%Y') = "${year}"
        UNION
        SELECT employee_id, project_id, DATEDIFF(end_work, concat("${year}", "-12", "-31")) AS working_days
        FROM dbproject.works_for
        WHERE DATE_FORMAT(start_work, '%Y') = "${year}" AND
            DATE_FORMAT(end_work, '%Y') > "${year}"
    ) AS t1 group by employee_id order by working_days DESC) AS t2 natural join dbproject.employee;`;
    const working_days = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    return res.status(200).json(working_days);
  } catch {
    return res.status(500).json("internal server error");
  }
});

module.exports = router;
