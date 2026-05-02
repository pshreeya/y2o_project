import { useState } from "react";
import "./Onboarding.css";

interface StudentPage {
  age: number | "";
  grade: string;
  school: string;
  school_board: string;
  top_interests: string[];
  primary_goal: string;
}

interface StudentPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
  userData: any;
}

export default function StudentPage({ setView, userData }: StudentPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [studentData, setStudentData] = useState<StudentPage>({
    age: "",
    grade: "",
    school: "",
    school_board: "",
    top_interests: [],
    primary_goal: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      //combining student data with userid
      const payload = {
        user_id: userData.id,
        ...studentData,
      };

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/studentpage`, {
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
      <form className="form" onSubmit={handleStudentSubmit}>
        <div className="header">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" id="logo" />
        </div>
        <div className="form-title">
          <h2>Tell us about yourself!</h2>
        </div>
        <ProgressBar value={2} />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={studentData.age}
          onChange={handleChange}
        />

        <input
          type="text"
          name="grade"
          placeholder="Grade"
          value={studentData.grade}
          onChange={handleChange}
        />

        <input
          type="text"
          name="school"
          placeholder="School"
          value={studentData.school}
          onChange={handleChange}
        />

        <input
          type="text"
          name="school_board"
          placeholder="School Board"
          value={studentData.school_board}
          onChange={handleChange}
        />

        <input
          type="text"
          name="top_interests"
          placeholder="Top Interests (comma separated)"
          value={studentData.top_interests.join(", ")}
          onChange={(e) =>
            setStudentData((prev) => ({
              ...prev,
              top_interests: e.target.value.split(",").map((s) => s.trim()),
            }))
          }
        />

        <input
          type="text"
          name="primary_goal"
          placeholder="Primary Goal"
          value={studentData.primary_goal}
          onChange={handleChange}
        />

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Going to Next page" : "Next Step →"}
        </button>
      </form>
    </div>
  );
}
