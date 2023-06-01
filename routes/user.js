const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("../passport/index.js");
const { SiteData, Employee } = require("../models/index.js");
const transporter = require("../nodemailer/index.js");
const auth_code = require("../nodemailer/services.js");
const nodeCache = require("node-cache");
const myCache = new nodeCache({ stdTTL: 0, checkperiod: 600 }); // init
const router = express.Router();

// 로그인/로그아웃 요청 처리
// login (req.user 속성 생성)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    console.info("___passport.authenticate()");
    if (authError) {
      //로그인 에러
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      //아이디 or 비밀번호 틀렸을 때 같이 전달해온 info로 에러 메세지 보여줌(ex 존재하지 않는 회원입니다.)
      return res
        .status(400)
        .json(
          "로그인에 실패했습니다. 아이디와 비밀번호를 올바르게 입력했는지 확인해주세요."
        );
    }
    console.info("___req.login()"); //콘솔 확인용
    return req.login(user, (loginError) => {
      //req.login은 passport가 만들어주는 method
      if (loginError) {
        console.error(loginError);
        return next(loginError); //에러 처리 라우터로 넘김
      }
      console.log("req.session : ", req.session);
      console.log("req.session.passport : ", req.session.passport);

      return res.status(200).json({
        message: "로그인에 성공하였습니다.",
        user: user,
        session: req.session,
        user: req.user,
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙임
});

// logout (req.user를 삭제해줌)
router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    return res.status(200).json({ success: "logout success" });
  });
});

// id 변경
router.patch("/resetId", async (req, res) => {
  const user = req.user ? req.user : null;

  if (user) {
    const cuur_id = user.id;
    const { newId } = req.body;
    console.log(newId);

    try {
      let user = await SiteData.update(
        { id: newId },
        { where: { id: cuur_id } }
      );
      return res.status(200).json("changing ID success");
    } catch {
      return res.status(500).json("internal server error");
    }
  } else return res.status(401).json("Unauthenticated");
});

//비밀번호 변경 시 인증 코드 발송
router.post("/sendEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const user = req.user ? req.user : null;

    if (user) {
      const id = user.id;
      const user_data = await SiteData.findOne({
        where: { id: id },
        include: {
          model: Employee,
          required: true,
          attributes: ["email"],
        },
      });
      const user_email = user_data.Employee.email;

      if (email == user_email) {
        const verify_code = auth_code();
        transporter.sendMail({
          from: "prompt.solution3@gmail.com",
          to: user_email,
          subject: "[Prompt Solution]비밀번호 변경 인증 메일입니다.",
          text: verify_code,
        });
        await myCache.set(user_email, verify_code, 60 * 5);
        console.log(verify_code);
        return res.status(200).json("성공적으로 이메일을 발송하였습니다.");
      } else {
        return res.status(401).json("가입된 이메일과 일치하지 않습니다.");
      }
    } else {
      return res.status(401).json("Unauthenticated");
    }
  } catch {
    return res.status(500).json("internal server error");
  }
});

// 코드 인증
router.post("/verifyEmail", async (req, res) => {
  try {
    const { verify_code } = req.body;
    const user = req.user ? req.user : null;

    if (user) {
      const id = user.id;
      const user_data = await SiteData.findOne({
        where: { id: id },
        include: {
          model: Employee,
          required: true,
          attributes: ["email"],
        },
      });

      const user_email = user_data.Employee.email;
      const code = await myCache.get(user_email);

      if (code == verify_code) {
        await myCache.del(user_email);
        return res.status(200).json("성공적으로 인증을 완료하였습니다.");
      } else {
        return res.status(400).json("인증코드가 일치하지 않습니다.");
      }
    } else {
      return res.status(401).json("Unauthenticated");
    }
  } catch {
    return res.status(500).json("internal server error");
  }
});

//비밀번호 변경
router.patch("/resetPW", async (req, res) => {
  try {
    const { newPassword, currPassword } = req.body;
    const user = req.user ? req.user : null;

    if (user) {
      const user_data = await SiteData.findOne({ where: { id: user.id } });
      const result = await bcrypt.compare(currPassword, user_data.password);
      if (result) {
        await SiteData.update(
          { password: await bcrypt.hash(newPassword, 12) },
          { where: { id: user_data.id } }
        );
        return res.status(200).json("success");
      } else {
        return res.status(400).json("비밀번호가 일치하지 않습니다.");
      }
    } else {
      return res.status(401).json("Unauthenticated");
    }
  } catch {
    return res.status(500).json("internal server error");
  }
});

module.exports = router;
