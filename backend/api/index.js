const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const stytch = require("stytch");
const db = require("./db");

const app = express();

const stytchClient =
  process.env.STYTCH_PROJECT_ID && process.env.STYTCH_SECRET
    ? new stytch.Client({
        project_id: process.env.STYTCH_PROJECT_ID,
        secret: process.env.STYTCH_SECRET,
      })
    : null;

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

app.post("/api/signup", async (req, res) => {
  const { email, password, created_at } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (!stytchClient) {
    return res.status(503).json({ message: "Email signup is not configured." });
  }

  try {
    await stytchClient.passwords.create({ email, password });
  } catch (err) {
    if (err.error_type === "duplicate_email") {
      return res.status(400).json({ message: "User already exists" });
    }
    console.error("Stytch signup error:", err);
    return res.status(500).json({ message: "Signup failed. Please try again." });
  }

  try {
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const insertResult = await db.query(
      "INSERT INTO users (email, created_at) VALUES ($1, $2) RETURNING *",
      [email, created_at || new Date().toISOString()],
    );
    return res.status(201).json({ message: "Signup successful", user: insertResult.rows[0] });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!stytchClient) {
    return res.status(503).json({ message: "Email login is not configured." });
  }

  try {
    await stytchClient.passwords.authenticate({ email, password, session_duration_minutes: 60 });
  } catch (err) {
    const status = err.status_code || 500;
    if (status >= 400 && status < 500) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    console.error("Stytch login error:", err);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "Login successful", user: result.rows[0] });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
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

app.post("/api/send-otp", async (req, res) => {
  if (!stytchClient) {
    return res
      .status(503)
      .json({ error: "Phone login is not configured on this server." });
  }
  let { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ error: "Phone number is required." });
  }
  if (!phone_number.startsWith("+")) {
    phone_number = "+1" + phone_number.replace(/\D/g, "");
  }
  try {
    const response = await stytchClient.otps.sms.loginOrCreate({ phone_number });
    return res.json({
      method_id: response.phone_id,
      user_created: response.user_created,
    });
  } catch (err) {
    console.error("Stytch send OTP error:", err);
    return res
      .status(500)
      .json({ error: "Failed to send code. Check the phone number and try again." });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  if (!stytchClient) {
    return res
      .status(503)
      .json({ error: "Phone login is not configured on this server." });
  }
  const { method_id, code } = req.body;
  if (!method_id || !code) {
    return res.status(400).json({ error: "Method ID and code are required." });
  }
  try {
    const stytchResponse = await stytchClient.otps.sms.authenticate({
      method_id,
      code,
      session_duration_minutes: 60,
    });

    const phone = stytchResponse.user.phone_numbers[0].phone_number;

    const existing = await db.query("SELECT * FROM users WHERE phone_number = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.json({ user: existing.rows[0], isNew: false });
    }

    const inserted = await db.query(
      "INSERT INTO users (phone_number, created_at) VALUES ($1, $2) RETURNING *",
      [phone, new Date().toISOString()],
    );
    return res.json({ user: inserted.rows[0], isNew: true });
  } catch (err) {
    console.error("Stytch verify OTP error:", err);
    const errType = err.error_type || "";
    if (errType === "otp_code_not_found" || errType === "unable_to_auth_otp") {
      return res.status(401).json({ error: "Invalid or expired code." });
    }
    return res
      .status(500)
      .json({ error: "Verification failed. Please try again." });
  }
});

app.get("/", (_req, res) => {
  res.send("Y2O API is running!");
});

module.exports = app;
