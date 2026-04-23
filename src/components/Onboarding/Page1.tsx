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
}

export default function Page1({ setView }: Page1Props) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [page1Data, setPage1Data] = useState<Page1>({
    first_name: "",
    last_name: "",
    phone_number: "",
    who_are_you: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPage1Data((prev) => ({
      ...prev,
      [name]: value, //look at the name attribute of the input to determine which field to update
    }));
  };

  //handler
  const handlePage1Submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("General Info payload:", page1Data);
    //TODO:connect to backend
    setPage1Data({
      first_name: "",
      last_name: "",
      phone_number: "",
      who_are_you: "",
    });
    setView("page2"); //go to next page of onboarding (currently just loops back to itself since only page 1 is implemented)
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
          placeholder="First Name"
          value={page1Data.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={page1Data.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          pattern="\(\d{3}\) \d{3}-\d{4}"
          title="Please enter in (250) 555-0199 format"
          value={page1Data.phone_number}
          onChange={handleChange}
        />

        <span className="radio-group-title">Who are you?</span>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="who_are_you"
              value="Student"
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
              onChange={handleChange}
              required
            />
            Organization
          </label>
        </div>

        <button type="submit" className="btn">
          Next Step &rarr;
        </button>
      </form>
    </div>
  );
}
