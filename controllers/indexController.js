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
    .withMessage("Must not be empty")
    .isAlpha()
    .isLength({ min: 2, max: 30 })
    .withMessage("Must be at least 2 or less than 30 characters"),
];

exports.indexGet = (req, res) => res.render("home");

exports.createUserGet = (req, res) => res.render("sign-up");

exports.createUserPost = [
  validateUser,
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
];
