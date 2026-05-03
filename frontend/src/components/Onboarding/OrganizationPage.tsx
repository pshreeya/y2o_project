import { useState } from "react";
import "./Onboarding.css";

interface OrganizationPage {
  org_name: string;
  org_type: string;
  org_size: string;
  org_role: string;
  primary_goal: string;
}

interface OrganizationPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
  userData: any;
}

export default function OrganizationPage({
  setView,
  userData,
}: OrganizationPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [orgData, setOrgData] = useState<OrganizationPage>({
    org_name: "",
    org_type: "",
    org_size: "",
    org_role: "",
    primary_goal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrgSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      //combining parent data with userid
      const payload = {
        user_id: userData.id,
        ...orgData,
      };

      const API_URL = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${API_URL}/api/orgpage`, {
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
      <form className="form" onSubmit={handleOrgSubmit}>
        <div className="header">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" id="logo" />
        </div>
        <div className="form-title">
          <h2>Tell us about your organization!</h2>
        </div>
        <ProgressBar value={2} />
        <div className="form-group">
          <label htmlFor="organization_name">Organization Name</label>
          <input
            type="text"
            id="organization_name"
            name="org_name"
            value={orgData.org_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="organization_type">Organization Type</label>
          <input
            type="text"
            id="organization_type"
            name="org_type"
            value={orgData.org_type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="organization_size">Organization Size</label>
          <input
            type="text"
            id="organization_size"
            name="org_size"
            value={orgData.org_size}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Your Role</label>
          <input
            type="text"
            id="role"
            name="org_role"
            value={orgData.org_role}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="primary_goal">Primary Goal</label>
          <input
            type="text"
            id="primary_goal"
            name="primary_goal"
            value={orgData.primary_goal}
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
