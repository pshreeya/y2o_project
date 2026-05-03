import { useState } from "react";
import "./Auth.css";
import type { UserData } from "../Auth";

interface PhoneAuthProps {
  setView: (view: "login" | "signup" | "forgot" | "phone") => void;
  onLoginSuccess: (isNewUser: boolean, user: UserData) => void;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export default function PhoneAuth({ setView, onLoginSuccess }: PhoneAuthProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [methodId, setMethodId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMethodId(data.method_id);
      setNormalizedPhone(data.phone_number);
      setStep("otp");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method_id: methodId, code, phone_number: normalizedPhone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onLoginSuccess(data.isNew, data.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="auth-container">
        <form className="form" onSubmit={handleVerifyOtp}>
          <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
          <h2>Enter Code</h2>
          <p className="subtitle">We sent a 6-digit code to</p>

          <input
            type="tel"
            value={formatPhone(normalizedPhone)}
            readOnly
            style={{ background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
          />

          <input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />

          {errorMessage && (
            <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem" }}>{errorMessage}</p>
          )}

          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            className="btn-google"
            onClick={() => { setStep("phone"); setCode(""); setErrorMessage(""); }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSendOtp}>
        <img src="/images/Y2OFC.png" alt="Y2O Logo" className="logo" />
        <h2>Welcome</h2>
        <p className="subtitle">Sign in or create an account</p>

        <input
          type="tel"
          placeholder="Phone number (e.g. +1 555 000 0000)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        {errorMessage && (
          <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem" }}>{errorMessage}</p>
        )}

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Code"}
        </button>

        <div className="divider"><span>or</span></div>

        <a href={`${API_URL}/api/auth/google`} className="btn-google">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <p className="toggle-text">
          Use email instead?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setView("login"); }}>Log in</a>
          {" "}or{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setView("signup"); }}>Sign up</a>
        </p>
      </form>
    </div>
  );
}
