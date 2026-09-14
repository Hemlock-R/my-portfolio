require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "portfolio",
  user: "postgres",
  password: process.env.DB_PASSWORD
});

pool.query("SELECT NOW()", (error, result) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Database connected successfully!");
  }
});

module.exports = pool;
