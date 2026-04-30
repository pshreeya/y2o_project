import "dotenv/config";
import express from "express";
import cors from "cors";
import * as stytch from "stytch";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret:     process.env.STYTCH_SECRET,
});

// Send OTP to phone number — creates account if it doesn't exist
app.post("/api/send-otp", async (req, res) => {
  let { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ error: "Phone number is required." });
  }
  // Ensure E.164 format — prepend +1 if no country code provided
  if (!phone_number.startsWith("+")) {
    phone_number = "+1" + phone_number.replace(/\D/g, "");
  }
  try {
    const response = await client.otps.sms.loginOrCreate({ phone_number });
    return res.json({
      method_id:    response.phone_id,
      user_created: response.user_created,
    });
  } catch (err) {
    console.error("Stytch send OTP error:", err);
    return res.status(500).json({ error: "Failed to send code. Check the phone number and try again." });
  }
});

// Verify the OTP code
app.post("/api/verify-otp", async (req, res) => {
  const { method_id, code } = req.body;
  if (!method_id || !code) {
    return res.status(400).json({ error: "Method ID and code are required." });
  }
  try {
    const response = await client.otps.sms.authenticate({
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Stytch server running on http://localhost:${PORT}`));
