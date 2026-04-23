import { useState } from "react";
import "./Onboarding.css";

interface OrganizationPage {
  organization_name: string;
  organization_type: string;
  organization_size: string;
  role: string;
  primary_goal: string;
}

interface OrganizationPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
}

export default function OrganizationPage({ setView }: OrganizationPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [orgData, setOrgData] = useState<OrganizationPage>({
    organization_name: "",
    organization_type: "",
    organization_size: "",
    role: "",
    primary_goal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrgSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Organization Info payload:", orgData);
    setOrgData({
      organization_name: "",
      organization_type: "",
      organization_size: "",
      role: "",
      primary_goal: "",
    });
    setView("page3");
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
            name="organization_name"
            value={orgData.organization_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="organization_type">Organization Type</label>
          <input
            type="text"
            id="organization_type"
            name="organization_type"
            value={orgData.organization_type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="organization_size">Organization Size</label>
          <input
            type="text"
            id="organization_size"
            name="organization_size"
            value={orgData.organization_size}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Your Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={orgData.role}
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
        <button type="submit" className="submit-button">
          Next Step &rarr;
        </button>
      </form>
    </div>
  );
}
