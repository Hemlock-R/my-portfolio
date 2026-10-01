require("dotenv").config();
if (
  !process.env.DB_PASSWORD ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD_HASH ||
  !process.env.SESSION_SECRET
) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const path = require("path");
const session = require("express-session");
const pool = require("./database");
const bcrypt = require("bcrypt");

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(helmet());

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.get("/admin/login.html", (req, res, next) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin/dashboard.html");
  }

  next();
});

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

// Backend validation
if (!name || !email || !phone || !message) {
    return res.status(400).json({
        message: "Please fill in all fields."
    });
}

const cleanName = name.trim();
const cleanEmail = email.trim();
const cleanPhone = phone.trim();
const cleanMessage = message.trim();

if (!cleanName || !cleanEmail || !cleanPhone || !cleanMessage) {
    return res.status(400).json({
        message: "Please fill in all fields."
    });
}

// Full name validation
if (cleanName.split(/\s+/).length < 2) {
    return res.status(400).json({
        message: "Please enter your full name."
    });
}

// Email validation
const emailPattern =
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({
        message: "Please enter a valid email address."
    });
}

try 
   {
    await pool.query(
      `INSERT INTO contacts (name, email, phone, message, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
      [cleanName, cleanEmail, cleanPhone, cleanMessage],
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

app.get("/api/admin/session", (req, res) => {
  if (req.session.isAdmin) {
    return res.json({ authenticated: true });
  }

  res.json({ authenticated: false });
});

app.post("/api/admin/login", adminLoginLimiter, async(req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
) {
    req.session.isAdmin = true;
    req.session.csrfToken = require("crypto").randomBytes(32).toString("hex");

    res.json({
      message: "Login successful",
      csrfToken: req.session.csrfToken,
    });
  } else {
    res.status(401).json({
      message: "Invalid username or password",
    });
  }
});

app.post("/api/admin/logout", (req, res) => {
  if (!req.session.isAdmin || req.body.csrfToken !== req.session.csrfToken) {
    return res.status(403).json({
      message: "Invalid CSRF token.",
    });
  }
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

app.delete("/api/admin/contacts/:id", async (req, res) => {
  if (!req.session.isAdmin || req.body.csrfToken !== req.session.csrfToken) {
    return res.status(403).json({
      message: "Invalid CSRF token.",
    });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM contacts WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    res.json({
      message: "Submission deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete contact:", error);

    res.status(500).json({
      message: "Could not delete submission.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
