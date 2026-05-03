const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

const app = express();
const saltRounds = 12;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

const googleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
        callbackURL: GOOGLE_CALLBACK_URL,
        state: false,
      },
      async (accessToken, refreshToken, profile, done) => {
        // ← THIS PART
        try {
          const email = profile.emails[0].value;
          const existing = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
          );
          if (existing.rows.length > 0) {
            return done(null, { user: existing.rows[0], isNewUser: false });
          }
          const result = await db.query(
            "INSERT INTO users (email, created_at) VALUES ($1, $2) RETURNING *",
            [email, new Date().toISOString()],
          );
          return done(null, { user: result.rows[0], isNewUser: true });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      session: false,
      scope: ["email", "profile"],
    }),
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: FRONTEND_URL,
    }),
    (req, res) => {
      const { user, isNewUser } = req.user;
      res.redirect(`${FRONTEND_URL}/?userId=${user.id}&isNewUser=${isNewUser}`);
    },
  );
} else {
  app.get("/api/auth/google", (_req, res) => {
    res
      .status(503)
      .json({ message: "Google sign-in is not configured on this server." });
  });
}

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["email", "profile"],
  }),
);

app.post("/api/signup", async (req, res) => {
  const { email, password, created_at } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const insertResult = await db.query(
      "INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, created_at],
    );

    res
      .status(201)
      .json({ message: "Signup successful", user: insertResult.rows[0] });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/logout", (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/page1", async (req, res) => {
  const { id, first_name, last_name, phone_number, who_are_you } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    const result = await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone_number = $3, role = $4 
       WHERE id = $5 
       RETURNING *`,
      [first_name, last_name, phone_number, who_are_you, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/studentpage", async (req, res) => {
  const {
    user_id,
    age,
    grade,
    school,
    school_board,
    top_interests,
    primary_goal,
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    const result = await db.query(
      `INSERT INTO student_profiles 
        (user_id, age, grade, school, school_board, top_interests, primary_goal) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [user_id, age, grade, school, school_board, top_interests, primary_goal],
    );

    res.status(200).json({
      message: "Student profile created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/parentpage", async (req, res) => {
  const { user_id, teen_email, primary_focus } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    const result = await db.query(
      `INSERT INTO parent_profiles 
        (user_id, teen_email, primary_focus) 
       VALUES 
        ($1, $2, $3) 
       RETURNING *`,
      [user_id, teen_email, primary_focus],
    );

    res.status(200).json({
      message: "Parent profile created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/orgpage", async (req, res) => {
  const { user_id, org_name, org_type, org_size, org_role, primary_goal } =
    req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    const result = await db.query(
      `INSERT INTO organization_profiles 
        (user_id, org_name, org_type, org_size, org_role, primary_goal) 
       VALUES 
        ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, org_name, org_type, org_size, org_role, primary_goal],
    );

    res.status(200).json({
      message: "Organization profile created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Y2O API is running!");
});

module.exports = app;
