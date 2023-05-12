const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const { sequelize } = require("./models/index");
dotenv.config();

// router 분리
const userRouter = require("./routes/user");

const app = express();
app.set("port", process.env.PORT || 3000);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => console.error(err));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRETE));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRETE,
    cookie: {
      httpOnly: true,
      maxAge: 600000,
      secure: false,
    },
    name: "my-session-cookie",
    // store 속성 -> 서버 사이드 session이 어디에 저장될지 지정 (defualt = memeory)
  })
);
// passport 초기화 및 session 연결
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);

app.listen(app.get("port"), () => {
  console.log("Express App on port 3000!");
});
