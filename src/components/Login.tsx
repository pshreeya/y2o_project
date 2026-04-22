import { useState } from "react";
import "./Auth.css";
import { Eye, EyeOff } from "lucide-react";

interface LoginForm {
  identifier: string;
  password: string;
}

interface LoginProps {
  setView: (view: "login" | "signup" | "forgot") => void;
  showPassword: boolean;
  handleToggle: () => void;
}

export default function Login({
  setView,
  showPassword,
  handleToggle,
}: LoginProps) {
  const [loginData, setLoginData] = useState<LoginForm>({
    identifier: "",
    password: "",
  });

  //handlers
  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login payload:", loginData);
    //TODO:connect to backend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleLogin}>
        <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
        <h2>Welcome Back!</h2>
        <p className="subtitle">Log in to your account</p>

        <input
          name="identifier"
          type="email"
          placeholder="Enter your email"
          value={loginData.identifier}
          onChange={handleChange}
          required
        />
        <div className="password-input">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={handleToggle}
          >
            {showPassword ? (
              <EyeOff size={20} className="text-gray-500" />
            ) : (
              <Eye size={20} className="text-gray-500" />
            )}
          </button>
        </div>

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
      </form>
    </div>
  );
}
