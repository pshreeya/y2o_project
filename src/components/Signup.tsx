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
}

export default function Signup({
  setView,
  showPassword,
  handleToggle,
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
    //TODO:connect to backend
    setSignupData({
      email: "",
      password: "",
    });
    setView("login");
  };

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSignup}>
        <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
        <h2>Sign Up</h2>
        <p className="subtitle">Join Y2O now!</p>

        {/* <input
            type="text"
            placeholder="Full Name"
            value={signupData.full_name}
            onChange={(e) =>
              setSignupData({ ...signupData, full_name: e.target.value })
            }
            required
            /> */}
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
        {/*<input
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
          />*/}
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
