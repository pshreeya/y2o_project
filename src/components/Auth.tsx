import { useState } from "react";
import "./Auth.css";

type View = "login" | "signup" | "forgot";

interface SignupForm {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginForm {
  identifier: string;
  password: string;
}

export default function Auth() {
  const [view, setView] = useState<View>("login");
  const [resetLoading, setResetLoading] = useState(false);

  const [loginData, setLoginData] = useState<LoginForm>({
    identifier: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<SignupForm>({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [resetEmail, setResetEmail] = useState("");

  // ── Handlers ──────────────────────────────────────────────

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login payload:", loginData);
    // TODO: connect to backend
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup payload:", signupData);
    // TODO: connect to backend
    setSignupData({
      full_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
    });
    setView("login");
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    console.log("Reset email:", resetEmail);
    // TODO: connect to backend
    setTimeout(() => setResetLoading(false), 1500); // placeholder
  };

  // ── Views ─────────────────────────────────────────────────

  if (view === "signup") {
    return (
      <div className="auth-container">
        <form className="form" onSubmit={handleSignup}>
          <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
          <h2>Sign Up</h2>
          <p className="subtitle">Join Y2O now!</p>

          <input
            type="text"
            placeholder="Full Name"
            value={signupData.full_name}
            onChange={(e) =>
              setSignupData({ ...signupData, full_name: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            pattern="^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$"
            title="Please enter a valid email address"
            value={signupData.email}
            onChange={(e) =>
              setSignupData({ ...signupData, email: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Phone Number (ex: 123-456-7890)"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            title="Please enter in 123-456-7890 format"
            value={signupData.phone}
            onChange={(e) =>
              setSignupData({ ...signupData, phone: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={signupData.username}
            onChange={(e) =>
              setSignupData({ ...signupData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number"
            value={signupData.password}
            onChange={(e) =>
              setSignupData({ ...signupData, password: e.target.value })
            }
            required
          />

          <button type="submit" className="btn">
            Sign Up
          </button>
          <p className="toggle-text">
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView("login");
              }}
            >
              Login
            </a>
          </p>
        </form>
      </div>
    );
  }

  if (view === "forgot") {
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

  // Default: login
  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleLogin}>
        <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
        <h2>Welcome Back!</h2>
        <p className="subtitle">Log in to your account</p>

        <input
          type="text"
          placeholder="Enter your email or username"
          value={loginData.identifier}
          onChange={(e) =>
            setLoginData({ ...loginData, identifier: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
          required
        />

        <div className="form-option">
          <a
            href="#"
            className="forgot"
            onClick={(e) => {
              e.preventDefault();
              setView("forgot");
            }}
          >
            Forgot password?
          </a>
        </div>

        <button type="submit" className="btn">
          Login
        </button>
        <p className="toggle-text">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("signup");
            }}
          >
            Sign Up
          </a>
        </p>

        <div className="admin-divider">
          <button
            type="button"
            className="btn admin-btn"
            onClick={() => console.log("Admin portal — TODO")}
          >
            Admin Portal
          </button>
        </div>
      </form>
    </div>
  );
}
