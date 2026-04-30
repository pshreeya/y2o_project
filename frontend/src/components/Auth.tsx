import { useState } from "react";
import Login from "./Authentication/Login.tsx";
import Signup from "./Authentication/Signup.tsx";
import ForgotPassword from "./Authentication/ForgotPassword.tsx";
import PhoneAuth from "./Authentication/PhoneAuth.tsx";

type View = "login" | "signup" | "forgot" | "phone";

interface AuthProps {
  onLoginSuccess: (isNewUser: boolean, userId: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [view, setView] = useState<View>("phone");

  const [showPassword, setShowPassword] = useState(false);
  const handleToggle = () => setShowPassword(!showPassword);

  return (
    <>
      {view === "phone" && (
        <PhoneAuth setView={setView} onLoginSuccess={onLoginSuccess} />
      )}
      {view === "login" && (
        <Login
          setView={setView}
          showPassword={showPassword}
          handleToggle={handleToggle}
          onLoginSuccess={onLoginSuccess}
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
