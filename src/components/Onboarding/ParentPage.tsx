import { useState } from "react";
import "./Onboarding.css";

interface ParentPage {
  teen_email: string;
  primary_focus: string;
}

interface ParentPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
}

export default function ParentPage({ setView }: ParentPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [parentData, setParentData] = useState<ParentPage>({
    teen_email: "",
    primary_focus: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Parent Info payload:", parentData);
    setParentData({
      teen_email: "",
      primary_focus: "",
    });
    setView("page3");
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
        <button type="submit" className="submit-button">
          Next Step &rarr;
        </button>
      </form>
    </div>
  );
}
