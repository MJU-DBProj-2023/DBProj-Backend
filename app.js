const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const { sequelize } = require("./models/index");
const transporter = require("./nodemailer");
dotenv.config();

const app = express();
// app.set("trust proxy", 1);
app.set("Access-Control-Allow-Credentials", true);
app.set("port", process.env.PORT || 3001);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => console.error(err));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "X-AUTHENTICATION",
      "X-IP",
      "Content-Type",
      "Accept",
      "Cookie",
    ],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRETE));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secure: false,
    secret: process.env.COOKIE_SECRETE,
    cookie: {
      httpOnly: true,
      maxAge: 24000 * 60 * 60,
      domain: "localhost",
    },
  })
);
// passport 초기화 및 session 연결
app.use(passport.initialize());
app.use(passport.session());

// router 분리
const userRouter = require("./routes/user");
const employeeRouter = require("./routes/employee");
const projectRouter = require("./routes/project");
const evalRouter = require("./routes/eval");
const adminRouter = require("./routes/administrator");
const mypageRouter = require("./routes/mypage");
const worksForRouter = require("./routes/worksfor");

// 모든 요청에 대해 실행
app.use((req, res, next) => {
  // request가 유효한 동안 user를 전역적으로 사용 가능
  res.locals.user = req.user;
  console.log("user 정보 :");
  console.log(req.user);
  next();
});

app.get("/", (req, res) => {
  return res.sendFile(__dirname + "/routes/session_test.html");
});

app.use("/user", userRouter);
app.use("/index", projectRouter);
app.use("/employee", employeeRouter);
app.use("/eval", evalRouter);
app.use("/admin", adminRouter);
app.use("/mypage", mypageRouter);
app.use("/worksfor", worksForRouter);

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.listen(app.get("port"), () => {
  console.log("Express App on port 3001!");
});
