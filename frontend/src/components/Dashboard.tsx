import React, { useState } from "react";
import "./Dashboard.css";

interface DashboardProps {
  userData: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    who_are_you: string;
  };
}

export default function Dashboard({ userData }: DashboardProps) {
  // We only need the active tab state for the sidebar now!
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");

  const API_URL = import.meta.env.VITE_API_URL || "";

  const handleLogout = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Failed to log out on the server.");
        alert("There was an issue logging out. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Network error. Please try again.");
    }
  };

  const getStatusClass = (role: string): string => {
    if (!role) return "unverified";
    return role.toLowerCase().replace(/\s+/g, "-");
  };

  // The data is already loaded and ready to use
  const displayFirstName = userData.first_name || "User";
  const displayRole = userData.who_are_you || "Member";

  return (
    <div className="dashboard-layout">
      {/* TOP NAV */}
      <nav className="top-nav">
        <div className="nav-left">
          <img src="/images/Y2OFC.png" alt="Y2O Logo" className="nav-logo" />
        </div>
        <div className="nav-right">
          <button className="btn btn-primary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h2>Hello, {displayFirstName}</h2>

          <span className={`badge badge-${getStatusClass(displayRole)}`}>
            {displayRole}
          </span>

          <nav className="sidebar-links">
            <button
              className={activeTab === "home" ? "active" : ""}
              onClick={() => setActiveTab("home")}
            >
              Home
            </button>
            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {activeTab === "home" && (
            <>
              <div className="welcome-banner">
                <h2>Welcome to the Dashboard!</h2>
              </div>

              <div className="feed">
                <div className="feed-header">
                  <h3>Members</h3>
                </div>

                <div className="feed-list">
                  <div className="person-card">
                    <div className="card-avatar">
                      {displayFirstName.charAt(0)}
                    </div>
                    <div className="card-info">
                      <div className="card-name">
                        {userData.first_name} {userData.last_name}
                      </div>
                    </div>
                    <div className="card-about">
                      This is your current active profile.
                    </div>
                    <div
                      className={`card-status badge badge-${getStatusClass(displayRole)}`}
                    >
                      {displayRole}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <div className="welcome-banner">
              <h2>Your Profile Settings</h2>
              <p>Manage your account details here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
