import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";

interface SignupForm {
  email: string;
  password: string;
}

interface SignupProps {
  setView: (view: "login" | "signup" | "forgot") => void;
  showPassword: boolean;
  handleToggle: () => void;
  onLoginSuccess: (isNewUser: boolean, userId: string) => void;
}

export default function Signup({
  setView,
  showPassword,
  handleToggle,
  onLoginSuccess,
}: SignupProps) {
  const [signupData, setSignupData] = useState<SignupForm>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value, //look at the name attribute of the input to determine which field to update
    }));
  };

  //handler
  const handleSignup = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(""); //clear any previous error messages
    setIsLoading(true); //show loading state

    const timestamp = new Date().toISOString();

    const payload = {
      ...signupData,
      created_at: timestamp,
    };

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error so the catch block can handle it
        setErrorMessage(
          "An unexpected error occured during signup. Try again.",
        );
      }
      //clearing up the form fields
      setSignupData({
        email: "",
        password: "",
      });
      //if successful: call the onLoginSuccess callback to switch to the onboarding flow
      onLoginSuccess(true, data.user.id);
    } catch (error: any) {
      setErrorMessage("User already exists. Try logging in.");
    } finally {
      setIsLoading(false); //hide loading state
    }
  };

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSignup}>
        <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
        <h2>Sign Up</h2>
        <p className="subtitle">Join Y2O now!</p>
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          pattern="^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$"
          title="Please enter a valid email address"
          value={signupData.email}
          onChange={handleChange}
          required
        />
        <div className="password-input">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number"
            value={signupData.password}
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

        {errorMessage && (
          <p className="error-text" style={{ color: "red" }}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="btn"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="divider"><span>or</span></div>

        <a href="http://localhost:5000/auth/google" className="btn-google">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

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
