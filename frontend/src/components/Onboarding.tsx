import { useState, useEffect } from "react";
import Auth from "./Auth.tsx";
import Page1 from "./Onboarding/Page1.tsx";
import OrganizationPage from "./Onboarding/OrganizationPage.tsx";
import StudentPage from "./Onboarding/StudentPage.tsx";
import ParentPage from "./Onboarding/ParentPage.tsx";
import Activation from "./Onboarding/Activation.tsx";
import Dashboard from "./Dashboard.tsx";

type View = "page1" | "page2" | "page3";

const Onboarding: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);
  const [view, setView] = useState<View>("page1");

  const [userData, setUserData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    who_are_you: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    const isNew = params.get("isNewUser");
    if (userId) {
      setIsAuthenticated(true);
      setIsNewUser(isNew === "true");
      setUserData((prev) => ({ ...prev, id: userId }));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div>
      {!isAuthenticated ? (
        <Auth
          onLoginSuccess={(isNew, loggedInUser) => {
            setIsAuthenticated(true);
            setIsNewUser(isNew);
            setUserData((prev) => ({
              ...prev,
              ...loggedInUser,
              phone_number: loggedInUser.phone_number || "",
            }));
          }}
        />
      ) : !isNewUser ? (
        //if not new user, skip onboarding entirely
        <Dashboard userData={userData} />
      ) : (
        //if they are a new user, show onboarding
        <>
          {view === "page1" && (
            <Page1
              setView={setView}
              userData={userData}
              setUserData={setUserData}
            />
          )}
          {view === "page2" && (
            <>
              {userData.who_are_you === "Organization" && (
                <OrganizationPage setView={setView} userData={userData} />
              )}
              {userData.who_are_you === "Student" && (
                <StudentPage setView={setView} userData={userData} />
              )}
              {userData.who_are_you === "Parent" && (
                <ParentPage setView={setView} userData={userData} />
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
