const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  port: 5432,
  database: process.env.DB,
});

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

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM members WHERE username = $1",
        [username],
      );
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

app.get("/", (req, res) => res.render("home"));

app.get("/sign-up", (req, res) => res.render("sign-up"));
app.post(
  "/sign-up",
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Must not be empty")
    .isAlpha()
    .isLength({ min: 2, max: 30 })
    .withMessage("Must be at least 2 or less than 30 characters"),
  async (req, res, next) => {
    try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        "INSERT INTO members (first_name, last_name, username, password, status) VALUES ($1, $2, $3, $4, $5)",
        [
          req.body.firstName,
          req.body.lastName,
          req.body.username,
          hashedPass,
          "anon",
        ],
      );

      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  },
);

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }

  console.log("app listening on port 3000");
});
