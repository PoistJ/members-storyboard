const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  port: 5432,
  database: process.env.DB,
});

const validateUser = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isAlpha()
    .withMessage("First name cannot contain numbers or symbols")
    .isLength({ min: 2, max: 30 })
    .withMessage("Must be at least 2 or less than 30 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isAlpha()
    .withMessage("Last name cannot contain numbers or symbols")
    .isLength({ min: 2, max: 30 })
    .withMessage("Must be at least 2 or less than 30 characters"),
  body("username")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage("Please type in a password that is at least 10 characters"),
  body("passwordConfirm")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password must match"),
];

exports.indexGet = (req, res) => res.render("home");

exports.createUserGet = (req, res) =>
  res.render("sign-up", {
    values: {},
  });

exports.createUserPost = [
  validateUser,
  async (req, res, next) => {
    try {
      const validationErr = validationResult(req);

      if (!validationErr.isEmpty()) {
        return res.status(400).render("sign-up", {
          values: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
          },
          errors: validationErr.array(),
        });
      }

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
];

exports.joinClubGet = (req, res) => {
  res.render("join-club");
};

exports.joinClubPost = async (req, res) => {
  if (req.body.secret === "theOmega") {
    await pool.query("UPDATE members SET status WHERE username = $1", [
      username,
    ]);
    res.redirect("/");
  } else {
    res.render("join-club");
  }
};
