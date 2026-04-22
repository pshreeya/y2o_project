import { useState } from "react";
import Login from "./login.tsx";
import Signup from "./signup.tsx";
import ForgotPassword from "./forgotpassword.tsx";

type View = "login" | "signup" | "forgot";

export default function Auth() {
  const [view, setView] = useState<View>("signup"); //default view

  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => setShowPassword(!showPassword);

  return (
    <>
      {view === "login" && (
        <Login
          setView={setView}
          showPassword={showPassword}
          handleToggle={handleToggle}
        />
      )}
      {view === "signup" && (
        <Signup
          setView={setView}
          showPassword={showPassword}
          handleToggle={handleToggle}
        />
      )}
      {view === "forgot" && <ForgotPassword setView={setView} />}
    </>
  );
}
