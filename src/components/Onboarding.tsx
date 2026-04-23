import { useState } from "react";
import Auth from "./Auth.tsx";
import Page1 from "./Onboarding/Page1.tsx";
import OrganizationPage from "./Onboarding/OrganizationPage.tsx";
import StudentPage from "./Onboarding/StudentPage.tsx";
import ParentPage from "./Onboarding/ParentPage.tsx";
import Activation from "./Onboarding/Activation.tsx";

type View = "page1" | "page2" | "page3";

const Onboarding: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [view, setView] = useState<View>("page1");

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    who_are_you: "",
  });

  return (
    <div>
      {!isAuthenticated ? (
        <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <>
          {/* Use the view state to conditionally render onboarding pages */}
          {view === "page1" && <Page1 setView={setView} />}
          {view === "page2" && (
            <>
              {userData.who_are_you === "Organization" && (
                <OrganizationPage setView={setView} />
              )}
              {userData.who_are_you === "Student" && (
                <StudentPage setView={setView} />
              )}
              {userData.who_are_you === "Parent" && (
                <ParentPage setView={setView} />
              )}
            </>
          )}
          {view === "page3" && (
            <Activation setView={setView} userData={userData} />
          )}
        </>
      )}
    </div>
  );
};

export default Onboarding;
