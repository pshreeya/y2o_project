import { useState } from "react";
import "./Onboarding.css";

interface StudentPage {
  age: number;
  grade: string;
  school: string;
  school_board: string;
  top_interests: string[];
  primary_goal: string;
}

interface StudentPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
}

export default function StudentPage({ setView }: StudentPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const [studentData, setStudentData] = useState<StudentPage>({
    age: 0,
    grade: "",
    school: "",
    school_board: "",
    top_interests: [],
    primary_goal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Student Info payload:", studentData);
    setStudentData({
      age: 0,
      grade: "",
      school: "",
      school_board: "",
      top_interests: [],
      primary_goal: "",
    });
    setView("page3");
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

        <button type="submit" className="submit-button">
          Next Step &rarr;
        </button>
      </form>
    </div>
  );
}
