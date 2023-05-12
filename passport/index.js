const passport = require("passport");
const local = require("./localStrategy"); //로컬 전략 등록하기 위해
const SiteData = require("../models/siteData");

// 로그인 성공 시
passport.serializeUser((user, done) => {
  console.info("___passport.serializeUser()");
  done(null, user.id); // req.session에 사용자 id만 저장하여 접속 상태 저장 및 지속
});

// 로그인 성공하고 사용자가 요청할 때마다, 첫 번째 인자는 serializeUser에서 req.session에 저장된 사용자 정보임
passport.deserializeUser((id, done) => {
  console.info("___passport.deserializeUser()");
  SiteData.findOne({ where: { id } })
    .then((user) => done(null, user)) // req.user에 유저 정보 전체를 저장함
    .catch((err) => done(err));
});

passport.use(local);

module.exports = passport;
