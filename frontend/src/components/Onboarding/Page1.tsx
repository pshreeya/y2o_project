import { useState } from "react";
import "./Onboarding.css";

interface Page1 {
  first_name: string;
  last_name: string;
  phone_number: string;
  who_are_you: string;
}

interface Page1Props {
  setView: (view: "page1" | "page2" | "page3") => void;
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

export default function Page1({ setView, userData, setUserData }: Page1Props) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  //handler
  const handlePage1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/page1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error so the catch block can handle it
        throw new Error(data.message || "Something went wrong.");
      }
      setView("page2"); //go to next page of onboarding (currently just loops back to itself since only page 1 is implemented)
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false); //hide loading state
    }
  };

  return (
    <div className="form-container">
      <form className="form" onSubmit={handlePage1Submit}>
        <div className="header">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" id="logo" />
        </div>
        <div className="form-title">
          <h2>Let's get started!</h2>
        </div>
        <ProgressBar value={1} />

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={userData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={userData.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number (optional)"
          pattern="\(\d{3}\) \d{3}-\d{4}"
          title="Please enter in (250) 555-0199 format"
          value={userData.phone_number}
          onChange={handleChange}
        />

        <span className="radio-group-title">Who are you?</span>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="who_are_you"
              value="Student"
              checked={userData.who_are_you === "Student"}
              onChange={handleChange}
              required
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="who_are_you"
              value="Parent"
              checked={userData.who_are_you === "Parent"}
              onChange={handleChange}
              required
            />
            Parent
          </label>
          <label>
            <input
              type="radio"
              name="who_are_you"
              value="Organization"
              checked={userData.who_are_you === "Organization"}
              onChange={handleChange}
              required
            />
            Organization
          </label>
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Going to Next page" : "Next Step →"}
        </button>
      </form>
    </div>
  );
}
