require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const passport = require("passport");
require("./passport/passport");
const { OAuth2Client } = require("google-auth-library");

app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// app.use(morgan("tiny"));

// import routes here
const signupRoute = require("./routes/signupRoute");
const editProfileRoute = require("./routes/editProfileRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const { loginWithGoogle } = require("./controllers/userController");
// route middleware

app.get(
  "/api/v1/login-with-google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/login",
    failureRedirect: "http://localhost:5173/login",
  })
);

app.get("/api/v1/google-success", (req, res) => {
  // console.log(req.user, "nnnnnnnnnnnnnnnnnnnnnnnnnnn");

  loginWithGoogle(req, res);
});

app.post("/api/v1/google-logout", async (req, res, next) => {
  console.log(req.user, "oooooooooo");

  // const accessToken = req.user.accessToken;

  // // Revoke Google access token
  // const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  // await oAuth2Client.revokeToken(accessToken);

  req.logout(function (err) {
    if (err) next(err);
    // Clear session cookie
    // res.clearCookie("connect.sid", { path: "/" });
    res.json({ data: "successful", message: "logout successful" });
  });
});
// app.post("/api/v1/google-logout", (req, res, next) => {
//   req.logout(function (err) {
//     if (err) next(err);
//     res.clearCookie("connect.sid", { path: "/" });
//     res.json({ data: "successful", message: "logout successful" });
//   });
// });

app.use("/api/v1", signupRoute);
app.use("/api/v1", editProfileRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/message", messageRoute);
app.use((err, req, res, next) => {
  //   console.error(err.stack);
  res.status(200).json({
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack,
  });
});

module.exports = app;
