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
  onLoginSuccess: () => void;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value, //look at the name attribute of the input to determine which field to update
    }));
  };

  //handler
  const handleSignup = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Signup payload:", signupData);
    //TODO: do the api call to create the user account here
    setSignupData({
      email: "",
      password: "",
    });
    //if successful: call the onLoginSuccess callback to switch to the onboarding flow
    onLoginSuccess();
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
