import { useState } from "react";
import { createPost } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function PostForm({ onRefresh }) {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [form, setForm] = useState({
    heading: "",
    description: "",
    isPublic: true
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.heading || !form.description) {
        showNotification("Please fill all mandatory fields", "error");
        return;
    }

    setLoading(true);
    const data = new FormData();
    const today = new Date().toISOString().split('T')[0];
    data.append("heading", form.heading);
    data.append("description", form.description);
    data.append("isPublic", form.isPublic);
    data.append("date", today);
    if (user) {
      data.append("userId", user.id);
      data.append("userEmail", user.email);
    }
    if (file) data.append("file", file);

    try {
        await createPost(data);
        setForm({ heading: "", description: "", isPublic: true });
        setFile(null);
        setPreview(null);
        onRefresh();
        showNotification("Post Archive Updated Successfully", "success");
    } catch (error) {
        console.error("Error creating post:", error);
        const errorMsg = error.response?.data?.message || "Security/Network error occurred";
        const detail = error.response?.data?.detail ? ` (${error.response.data.detail})` : "";
        showNotification(`${errorMsg}${detail}`, "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="card">
      <span className="label-sm">Contribution</span>
      <h2 style={{ marginBottom: '2rem' }}>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="label-sm">Heading</span>
          <input 
            placeholder="What's on your mind?"
            value={form.heading}
            onChange={(e) => setForm({ ...form, heading: e.target.value })} 
          />
        </div>

        <div className="input-group">
          <span className="label-sm">Description</span>
          <textarea 
            placeholder="Detailed overview..."
            rows="5"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />
        </div>

        <div className="input-group">
          <span className="label-sm">Attachment (Optional)</span>
          <div 
            className={`upload-dropzone ${file ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragging'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragging');
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                setFile(droppedFile);
                if (droppedFile.type.startsWith('image/')) {
                  setPreview(URL.createObjectURL(droppedFile));
                }
              }
            }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
            ) : (
              <div className="icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
            )}
            <p>{file ? file.name : "Drag and drop files to upload"}</p>
            <span>{file ? "File selected for archive" : "Your files will be stored securely"}</span>
            <button type="button" className="btn-select">
              {file ? "Change file" : "Select files"}
            </button>
            <input 
              id="file-upload"
              type="file" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="input-group">
          <span className="label-sm">Privacy Status</span>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label style={{ 
              flex: 1, 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              background: form.isPublic ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-high)',
              border: form.isPublic ? '2px solid var(--primary-dim)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <input 
                type="checkbox" 
                checked={form.isPublic} 
                onChange={() => setForm({...form, isPublic: true})} 
                style={{ display: 'none' }} 
              />
              <span style={{ fontWeight: 700, color: form.isPublic ? 'var(--primary-dim)' : 'var(--on-surface-variant)' }}>PUBLIC</span>
            </label>
            <label style={{ 
              flex: 1, 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              background: !form.isPublic ? 'rgba(15, 23, 42, 0.05)' : 'var(--surface-high)',
              border: !form.isPublic ? '2px solid var(--on-surface)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <input 
                type="checkbox" 
                checked={!form.isPublic} 
                onChange={() => setForm({...form, isPublic: false})} 
                style={{ display: 'none' }} 
              />
              <span style={{ fontWeight: 700, color: !form.isPublic ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>PRIVATE</span>
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '1.25rem' }}>
            {loading ? "ARCHIVING..." : "SUBMIT POST"}
        </button>
      </form>
    </div>
  );
}
