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
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
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
