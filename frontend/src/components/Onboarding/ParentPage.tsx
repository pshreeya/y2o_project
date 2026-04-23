import { useState } from "react";
import "./Onboarding.css";

interface ParentPage {
  teen_email: string;
  primary_focus: string;
}

interface ParentPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
  userData: any;
}

export default function ParentPage({ setView, userData }: ParentPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [parentData, setParentData] = useState<ParentPage>({
    teen_email: "",
    primary_focus: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      //combining parent data with userid
      const payload = {
        user_id: userData.id,
        ...parentData,
      };

      const response = await fetch("http://localhost:5000/api/parentpage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error so the catch block can handle it
        throw new Error(data.message || "Something went wrong.");
      }
      setView("page3");
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleParentSubmit}>
        <div className="header">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" id="logo" />
        </div>
        <div className="form-title">
          <h2>Tell us about your teen!</h2>
        </div>
        <ProgressBar value={2} />
        <div className="form-group">
          <label htmlFor="teen_email">Teen's Email</label>
          <input
            type="email"
            id="teen_email"
            name="teen_email"
            value={parentData.teen_email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="primary_focus">Primary Focus</label>
          <input
            type="text"
            id="primary_focus"
            name="primary_focus"
            value={parentData.primary_focus}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Going to Next page" : "Next Step →"}
        </button>
      </form>
    </div>
  );
}
