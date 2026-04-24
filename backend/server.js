const express = require("express");
const db = require("./db");
const app = express();

const bcrypt = require("bcrypt");
const saltRounds = 12; //for security purposes, we use a higher number of salt rounds

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(5000, () => {
  console.log("Express server running on port 5000");
});

app.use(express.json());

const cors = require("cors");
app.use(cors());

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
