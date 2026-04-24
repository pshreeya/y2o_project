import "./Onboarding.css";

interface ActivationPageProps {
  setView: (view: "page1" | "page2" | "page3") => void;
  userData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    who_are_you: string;
  };
}

export default function Activation({ setView, userData }: ActivationPageProps) {
  const ProgressBar = ({ value, max = 3 }: { value: number; max?: number }) => (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );

  const Avatar = ({
    userData,
    size = 50,
    bgColor = "#8b2323",
  }: {
    userData: any;
    size?: number;
    bgColor?: string;
  }) => {
    const initials =
      `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();

    return (
      <div
        className="avatar"
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#f4f5f7",
            fontSize: size * 0.4,
            fontWeight: "bold",
          }}
        >
          {initials}
        </span>
      </div>
    );
  };
  return (
    <div className="form-container">
      <form className="form">
        <div className="header">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" id="logo" />
        </div>
        <div className="form-title">
          <h2>Awesome, you're all set!</h2>
        </div>
        <ProgressBar value={3} />
        <p className="confirmation-message">
          Welcome to the Y2O community! Your account has been successfully
          created.
        </p>
        <div className="avatar-container">
          <Avatar userData={userData} bgColor="#8b2323" />
        </div>

        <div className="next-steps">
          <h3>Start building your future today!</h3>
          <ul>
            <li>Explore local opportunities</li>
            <li>Connect with mentors and peers</li>
            <li>Track your volunteer hours</li>
            <li>Build your digital portfolio</li>
          </ul>
        </div>
        <button type="submit" className="btn">
          Go to Dashboard &rarr;
        </button>
      </form>
    </div>
  );
}
