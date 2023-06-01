const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const SiteData = require("../models/siteData");

module.exports = new LocalStrategy(
  {
    usernameField: "id",
    passwordField: "password",
  },
  async (id, password, done) => {
    console.info("___new LocalStrategy()");
    try {
      const user = await SiteData.findOne({ where: { id } });
      // user가 존재
      if (user) {
        const result = await bcrypt.compare(password, user.password);
        if (result) {
          done(null, user);
          // user 존재, 비밀번호 틀림
        } else {
          done(null, false, { message: "비밀번호가 일치하지 않습니다." });
        }
        // user가 존재하지 않음
      } else {
        done(null, false, { message: "존재하지 않는 회원입니다." });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }
);
