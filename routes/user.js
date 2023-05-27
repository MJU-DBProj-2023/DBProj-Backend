const express = require("express");
const bcrypt = require("bcrypt");

const passport = require("../passport/index.js");
const router = express.Router();

router.get("/login", (req, res, next) => {
  res.sendFile(__dirname + "/session_test.html");
});

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
      }); //로그인 성공하면 root 페이지로 redirect
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

module.exports = router;
