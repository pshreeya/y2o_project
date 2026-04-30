const express = require("express");
const db = require("./db");
const app = express();

const bcrypt = require("bcrypt");
const saltRounds = 12;

const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const stytch = require("stytch");

const stytchClient = (process.env.STYTCH_PROJECT_ID && process.env.STYTCH_SECRET)
  ? new stytch.Client({ project_id: process.env.STYTCH_PROJECT_ID, secret: process.env.STYTCH_SECRET })
  : null;

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const googleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        try {
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

  passport.serializeUser((data, done) => done(null, data));
  passport.deserializeUser((data, done) => done(null, data));

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "http://localhost:5173",
    }),
    (req, res) => {
      const { user, isNewUser } = req.user;
      res.redirect(
        `http://localhost:5173?userId=${user.id}&isNewUser=${isNewUser}`,
      );
    },
  );
}

app.get("/auth/google", (req, res, next) => {
  if (!googleConfigured) {
    return res
      .status(503)
      .json({ message: "Google sign-in is not configured on this server." });
  }
  passport.authenticate("google", { scope: ["email", "profile"] })(
    req,
    res,
    next,
  );
});

app.post("/api/signup", async (req, res) => {
  const { email, password, created_at } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    //hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //checking is the user exists
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    //inserts new user
    const insertResult = await db.query(
      "INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, created_at],
    );
    //sends newly created user to react
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

  //ensure there's an ID to update
  if (!id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    //update the existing user row with the new data
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

  //ensure there's an ID to update
  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    //update the existing user row with the new data
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

  //ensure there's an ID to update
  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    //update the existing user row with the new data
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

  //ensure there's an ID to update
  if (!user_id) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    //update the existing user row with the new data
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

// Send OTP to phone number
app.post("/api/send-otp", async (req, res) => {
  if (!stytchClient) {
    return res.status(503).json({ error: "Phone login is not configured on this server." });
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
    return res.json({ method_id: response.phone_id, user_created: response.user_created });
  } catch (err) {
    console.error("Stytch send OTP error:", err);
    return res.status(500).json({ error: "Failed to send code. Check the phone number and try again." });
  }
});

// Verify OTP code
app.post("/api/verify-otp", async (req, res) => {
  if (!stytchClient) {
    return res.status(503).json({ error: "Phone login is not configured on this server." });
  }
  const { method_id, code } = req.body;
  if (!method_id || !code) {
    return res.status(400).json({ error: "Method ID and code are required." });
  }
  try {
    const response = await stytchClient.otps.sms.authenticate({
      method_id,
      code,
      session_duration_minutes: 60,
    });
    return res.json({
      session_token: response.session_token,
      session_jwt:   response.session_jwt,
      user_id:       response.user_id,
    });
  } catch (err) {
    console.error("Stytch verify OTP error:", err);
    const errType = err.error_type || "";
    if (errType === "otp_code_not_found" || errType === "unable_to_auth_otp") {
      return res.status(401).json({ error: "Invalid or expired code." });
    }
    return res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

app.listen(5000, () => {
  console.log("Express server running on port 5000");
});
