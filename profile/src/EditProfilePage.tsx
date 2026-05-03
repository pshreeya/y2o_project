import { useState, useEffect, useRef } from "react";
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

interface EditProfilePageProps {
  userData: {
    first_name: string;
    last_name: string;
  };
  onBack: () => void;
}

const MAX_SIZE_MB = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function EditProfilePage({ userData, onBack }: EditProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic info state
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Education state
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [newEduTitle, setNewEduTitle] = useState("");
  const [newEduDesc, setNewEduDesc] = useState("");
  const [isAddingEdu, setIsAddingEdu] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [isAddingProj, setIsAddingProj] = useState(false);

  const initials =
    `${userData.first_name?.[0] ?? ""}${userData.last_name?.[0] ?? ""}`.toUpperCase();

  // Load existing profile data on mount
  useEffect(() => {
    fetch("/api/get-profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName(data.name || "");
          setHeadline(data.headline || "");
          setLocation(data.location || "");
          setAbout(data.about || "");
          if (data.profilePic && data.profilePic !== "placeholder.jpg") {
            setProfilePicPreview(data.profilePic);
          }
          setEducation(data.education || []);
          setProjects(data.projects || []);
        }
      })
      .catch(() => {});
  }, []);

  // Handle profile picture file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    setUploadSuccess("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Please use JPG, PNG, GIF, or WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(
        `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max is ${MAX_SIZE_MB}MB.`
      );
      e.target.value = "";
      return;
    }

    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
    setUploadSuccess(`✓ "${file.name}" ready to upload.`);
  };

  // Save basic profile info
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("profession", headline);
      formData.append("location", location);
      formData.append("about", about);
      if (profilePicFile) {
        formData.append("profilePic", profilePicFile);
      }

      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save changes.");
      }

      setSaveSuccess("Profile updated successfully!");
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add education
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingEdu(true);
    try {
      const response = await fetch("/api/add-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newEduTitle, description: newEduDesc }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add education.");

      setEducation((prev) => [{ id: data.id, title: newEduTitle, description: newEduDesc }, ...prev]);
      setNewEduTitle("");
      setNewEduDesc("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingEdu(false);
    }
  };

  // Delete education
  const handleDeleteEducation = async (id: number) => {
    try {
      const response = await fetch("/api/delete-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete education.");
      setEducation((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProj(true);
    try {
      const response = await fetch("/api/add-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newProjTitle, description: newProjDesc }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add project.");

      setProjects((prev) => [{ id: data.id, title: newProjTitle, description: newProjDesc }, ...prev]);
      setNewProjTitle("");
      setNewProjDesc("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingProj(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: number) => {
    try {
      const response = await fetch("/api/delete-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete project.");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <button className="back-link" onClick={onBack}>
        ← Back to Profile
      </button>

      {/* Profile Picture + Basic Info */}
      <div className="edit-card">
        <h3>Profile Picture</h3>
        <div className="pfp-preview">
          {profilePicPreview ? (
            <img src={profilePicPreview} alt="Profile preview" />
          ) : (
            initials
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="photo-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          📷 Change Photo
        </button>
        <p className="upload-hint">JPG, PNG, GIF or WEBP · Max 3MB</p>
        {uploadError && <p className="upload-error">{uploadError}</p>}
        {uploadSuccess && <p className="upload-success">{uploadSuccess}</p>}

        <h3 className="section-subheading">Basic Information</h3>

        {saveError && <div className="form-error">{saveError}</div>}
        {saveSuccess && <div className="form-success">{saveSuccess}</div>}

        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Headline (e.g. Computer Science Student)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <textarea
            placeholder="Bio"
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          <button type="submit" className="btn-save" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Education */}
      <div className="edit-card">
        <h3>Education</h3>
        {education.length > 0 ? (
          education.map((item) => (
            <div className="existing-item" key={item.id}>
              <div className="existing-item-info">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDeleteEducation(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="existing-empty">No education added yet.</p>
        )}

        <hr className="section-divider" />
        <h3>Add Education</h3>
        <form onSubmit={handleAddEducation}>
          <input
            type="text"
            placeholder="School / Degree"
            value={newEduTitle}
            onChange={(e) => setNewEduTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What are you studying?"
            rows={3}
            value={newEduDesc}
            onChange={(e) => setNewEduDesc(e.target.value)}
            required
          />
          <button type="submit" className="btn-add" disabled={isAddingEdu}>
            {isAddingEdu ? "Adding..." : "Add Education"}
          </button>
        </form>
      </div>

      {/* Projects */}
      <div className="edit-card">
        <h3>Projects</h3>
        {projects.length > 0 ? (
          projects.map((item) => (
            <div className="existing-item" key={item.id}>
              <div className="existing-item-info">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDeleteProject(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="existing-empty">No projects added yet.</p>
        )}

        <hr className="section-divider" />
        <h3>Add Project</h3>
        <form onSubmit={handleAddProject}>
          <input
            type="text"
            placeholder="Project Name"
            value={newProjTitle}
            onChange={(e) => setNewProjTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Describe the project..."
            rows={3}
            value={newProjDesc}
            onChange={(e) => setNewProjDesc(e.target.value)}
            required
          />
          <button type="submit" className="btn-add" disabled={isAddingProj}>
            {isAddingProj ? "Adding..." : "Add Project"}
          </button>
        </form>
      </div>
    </>
  );
}
