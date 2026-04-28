import { useState } from "react";
import "./Auth.css";
import { Eye, EyeOff } from "lucide-react";

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  who_are_you: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  setView: (view: "login" | "signup" | "forgot") => void;
  showPassword: boolean;
  handleToggle: () => void;
  onLoginSuccess: (isNew: boolean, user: UserData) => void;
}

export default function Login({
  setView,
  showPassword,
  handleToggle,
  onLoginSuccess,
}: LoginProps) {
  const [loginData, setLoginData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //handlers
  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(""); //clear any previous error messages
    setIsLoading(true); //show loading state

    try {
      // Make API call to login endpoint
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (!response.ok) {
        // Throw an error so the catch block can handle it
        throw new Error(data.message || "Something went wrong during signup.");
      }
      setLoginData({ email: "", password: "" }); // Clear form on successful login
      onLoginSuccess(false, data.user);
    } catch (error: any) {
      setErrorMessage(
        error.message || "An unexpected error occurred during login.",
      );
    } finally {
      setIsLoading(false); // Hide loading state
      // Handle login error (e.g., show error message)
    }
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
          name="email"
          type="email"
          placeholder="Enter your email"
          value={loginData.email}
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

        <div className="divider">
          <span>or</span>
        </div>

        <a href="http://localhost:5000/auth/google" className="btn-google">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </a>

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
