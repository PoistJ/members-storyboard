const path = require("node:path");
const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const indexController = require("./controllers/indexController");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
app.use(passport.session());
passport.use(new LocalStrategy(indexController.strategy));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(indexController.deserialize);

app.get("/", indexController.indexGet);
app.get("/sign-up", indexController.createUserGet);
app.post("/sign-up", indexController.createUserPost);
app.get("/join-the-club", indexController.joinClubGet);
app.post("/join-the-club", indexController.joinClubPost);
app.get("/login", indexController.loginGet);
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/authenticated",
    failureRedirect: "/login",
  }),
);
app.get("/log-out", indexController.logoutGet);
app.get("/authenticated", indexController.authenticateGet);
app.get("/create", indexController.createGet);
app.post("/create", indexController.createPost);

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }

  console.log("app listening on port 3000");
});
