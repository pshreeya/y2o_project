import { useState, useEffect } from "react";
import "./Profile.css";

interface EducationItem {
  id: number;
  title: string;
  description: string;
}

interface ProjectItem {
  id: number;
  title: string;
  description: string;
}

interface ProfileData {
  name: string;
  headline: string;
  location: string;
  about: string;
  profilePic: string;
  education: EducationItem[];
  projects: ProjectItem[];
}

interface ProfilePageProps {
  userData: {
    first_name: string;
    last_name: string;
    who_are_you: string;
  };
  onEditProfile: () => void;
}

export default function ProfilePage({ userData, onEditProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/get-profile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || "Failed to load profile.");
        } else {
          setProfile(data);
        }
      })
      .catch(() => setError("Network error. Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const initials =
    `${userData.first_name?.[0] ?? ""}${userData.last_name?.[0] ?? ""}`.toUpperCase();

  if (loading) {
    return <p style={{ color: "#888", padding: "20px" }}>Loading profile...</p>;
  }

  if (error) {
    return <p style={{ color: "#cc0000", padding: "20px" }}>{error}</p>;
  }

  return (
    <>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="banner" />
        <div className="header-content">
          <div className="pfp">
            {profile?.profilePic && profile.profilePic !== "placeholder.jpg" ? (
              <img src={profile.profilePic} alt="Profile" />
            ) : (
              initials
            )}
          </div>
          <div className="profile-name">{profile?.name || `${userData.first_name} ${userData.last_name}`}</div>
          {profile?.headline && (
            <div className="profile-headline">{profile.headline}</div>
          )}
          {profile?.location && (
            <div className="profile-location">📍 {profile.location}</div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="profile-card">
        <h3>About</h3>
        {profile?.about ? (
          <p>{profile.about}</p>
        ) : (
          <p className="empty-text">No bio added yet.</p>
        )}
      </div>

      {/* Education */}
      <div className="profile-card">
        <h3>Education</h3>
        {profile?.education && profile.education.length > 0 ? (
          profile.education.map((item) => (
            <div className="edu-item" key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
          ))
        ) : (
          <p className="empty-text">No education listed.</p>
        )}
      </div>

      {/* Projects */}
      <div className="profile-card">
        <h3>Projects</h3>
        {profile?.projects && profile.projects.length > 0 ? (
          profile.projects.map((item) => (
            <div className="edu-item" key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
          ))
        ) : (
          <p className="empty-text">No projects listed.</p>
        )}
        <hr className="section-divider" />
        <button className="edit-link" onClick={onEditProfile}>
          ✏ Edit Profile
        </button>
      </div>
    </>
  );
}
