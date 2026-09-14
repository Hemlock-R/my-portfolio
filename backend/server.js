require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const pool = require("./database");

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  }),
);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/admin/dashboard.html", (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login.html");
  }

  res.sendFile(path.join(__dirname, "../admin/dashboard.html"));
});

app.use("/admin", express.static(path.join(__dirname, "../admin")));

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    await pool.query(
      `INSERT INTO contacts (name, email, phone, message, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
      [name, email, phone, message],
    );

    res.json({
      message: "Contact information received!",
    });
  } catch (error) {
    console.error("Database insert failed:", error);

    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;

    res.json({
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      message: "Invalid username or password",
    });
  }
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed",
      });
    }

    res.json({
      message: "Logged out successfully",
    });
  });
});

app.get("/api/admin/contacts", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to get contacts:", error);

    res.status(500).json({
      message: "Could not load contacts.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
