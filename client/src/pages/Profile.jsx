import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import { useNotification } from "../context/NotificationContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState({
    username: "",
    avatar_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await getProfile(user.id);
        if (res.data) {
          setProfile({
            username: res.data.username || "",
            avatar_url: res.data.avatar_url || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        id: user.id,
        email: user.email,
        username: profile.username,
        avatar_url: profile.avatar_url
      });
      showNotification("Intelligence Profile Updated", "success");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="container">Please login to view profile</div>;
  if (loading) return <div className="container">Synchronizing...</div>;

  return (
    <div className="container animate-in">
      <button 
        onClick={() => navigate(-1)} 
        className="btn-select"
        style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: 'var(--surface-high)',
          border: '1px solid var(--surface-highest)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        BACK
      </button>

      <header style={{ marginBottom: '3rem' }}>
        <span className="label-sm">Personnel File</span>
        <h1>User Profile</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>Manage your identity and intelligence credentials</p>
      </header>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleUpdate}>
          <div className="input-group">
            <span className="label-sm">Primary Identifier (Email)</span>
            <input value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="input-group">
            <span className="label-sm">Codename (Username)</span>
            <input 
              placeholder="Enter your codename"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <span className="label-sm">Avatar Blueprint (Image URL)</span>
            <input 
              placeholder="https://..."
              value={profile.avatar_url}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            />
          </div>

          <button className="btn-primary" disabled={saving} style={{ width: '100%', marginTop: '1rem' }}>
            {saving ? "UPDATING FILE..." : "UPDATE PROFILE"}
          </button>
        </form>
      </div>
    </div>
  );
}
