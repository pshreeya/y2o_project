import { useState } from "react";
import "./Auth.css";

interface ForgotPasswordProps {
  setView: (view: "login" | "signup" | "forgot") => void;
}

export default function ForgotPassword({ setView }: ForgotPasswordProps) {
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  //handler
  const handleForgot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    console.log("Reset email:", resetEmail);
    setTimeout(() => setResetLoading(false), 1500);
  };

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleForgot}>
        <h2>Forgot Password?</h2>
        <p className="subtitle">Enter your email to reset your password</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />

        <button type="submit" className="btn" disabled={resetLoading}>
          {resetLoading ? "Processing…" : "Reset Password"}
        </button>
        <p className="toggle-text">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setResetEmail("");
              setView("login");
            }}
          >
            Back to Login
          </a>
        </p>
      </form>
    </div>
  );
}
