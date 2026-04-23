import { useState } from "react";
import Login from "./Authentication/Login.tsx";
import Signup from "./Authentication/Signup.tsx";
import ForgotPassword from "./Authentication/ForgotPassword.tsx";

type View = "login" | "signup" | "forgot";

interface AuthProps {
  onLoginSuccess: () => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
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
          onLoginSuccess={onLoginSuccess}
        />
      )}
      {view === "forgot" && <ForgotPassword setView={setView} />}
    </>
  );
}
