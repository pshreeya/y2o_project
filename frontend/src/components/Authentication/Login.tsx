import { useState } from "react";
import "./Auth.css";
import { Eye, EyeOff } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  setView: (view: "login" | "signup" | "forgot") => void;
  showPassword: boolean;
  handleToggle: () => void;
  onLoginSuccess: (isNewUser: boolean, userId: string) => void;
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
      onLoginSuccess(false, data.user.id);
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
