import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Auth from '../components/Auth';

export default function PostDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await getPostById(id, user?.id);
        setPost(res.data);
      } catch (err) {
        showNotification("Intelligence Node Not Found or Access Denied", "error");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate, showNotification, user?.id]);

  const downloadAsset = async (postId) => {
    if (!postId) return;
    try {
      setDownloading(true);
      showNotification("Initializing secure retrieval...", "info");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/posts/download/${postId}?userId=${user?.id || ''}`);
      if (!response.ok) throw new Error("Asset missing or inaccessible");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'intelligence-node-asset';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) fileName = match[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification("Asset decrypted and saved successfully", "success");
    } catch (error) {
      console.error("Secure retrieval failed:", error);
      showNotification("Secure retrieval failed: Asset inaccessible", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-light)' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', padding: '0 0 100px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '2rem 1rem'
        }}>
          <button
            onClick={() => navigate('/')}
            className="btn-select"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--surface-high)',
              border: '1px solid var(--surface-highest)',
              margin: '0'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK TO STREAM
          </button>

          <button
            className="btn-primary"
            disabled={downloading}
            onClick={() => downloadAsset(post.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              fontWeight: '800',
              boxShadow: post.file ? '0 10px 30px -10px var(--primary-dim)' : 'none',
              background: downloading ? 'var(--surface-highest)' : (post.file ? 'linear-gradient(135deg, var(--primary-dim), #60a5fa)' : 'var(--surface-highest)'),
              color: downloading ? 'var(--on-surface-variant)' : (post.file ? '#fff' : 'var(--on-surface-variant)'),
              cursor: (post.file && !downloading) ? 'pointer' : 'not-allowed',
              borderRadius: '0',
              borderBottom: '4px solid var(--primary-dim)',
              transition: 'all 0.3s ease',
              opacity: downloading ? 0.8 : 1
            }}
          >
            {downloading ? (
              <div className="loader-sm"></div>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {downloading ? 'RETRIEVAL IN PROGRESS...' : (post.file ? 'INTELLIGENCE DOWNLOAD' : 'LOCKED ASSET')}
          </button>
        </div>

        <div style={{ padding: '0', overflow: 'hidden' }}>
          {post.file && (
            <div style={{ width: '100%', maxHeight: '600px', overflow: 'hidden', background: '#000' }}>
              <img
                src={post.file}
                alt={post.heading}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          )}

          <div style={{ padding: '4rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2.5rem' }}>
              <div style={{
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '900',
                letterSpacing: '0.1em',
                background: post.is_public ? 'var(--primary-dim)' : 'var(--on-surface)',
                color: '#fff'
              }}>
                {post.is_public ? 'PUBLIC' : 'RESTRICTED'}
              </div>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: '600', opacity: 0.6 }}>
                NODAL INDEX: {String(post.id).substring(0, 8).toUpperCase() || 'N/A'}
              </span>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: '600', opacity: 0.6 }}>
                • {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : "Recently Indexed"}
              </span>
            </div>

            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: '900',
              letterSpacing: '-0.05em',
              marginBottom: '3rem',
              lineHeight: '1',
              color: 'var(--on-surface)',
              background: 'linear-gradient(to bottom, var(--on-surface) 70%, var(--on-surface-variant))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {post.heading}
            </h1>

            <div style={{
              fontSize: '1.25rem',
              lineHeight: '1.8',
              color: 'var(--on-surface)',
              opacity: 0.9,
              whiteSpace: 'pre-wrap',
              marginBottom: '4rem',
              maxWidth: '800px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {post.description}
            </div>

            <div style={{
              background: 'var(--surface-high)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '1px solid var(--surface-highest)',
              marginBottom: '4rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '0.05em', margin: 0 }}>INTELLIGENCE PREVIEW</h3>
                {post.file && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-dim)' }}>ENCRYPTED ASSET DETECTED</span>
                )}
              </div>

              {post.file ? (
                <div style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#000',
                  boxShadow: '0 20px 50px -15px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={post.file}
                    alt="Preview"
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{
                  padding: '5rem 2rem',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  border: '2px dashed var(--surface-highest)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2, marginBottom: '1.5rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <p style={{ fontWeight: '700', opacity: 0.4, margin: 0 }}>NO DOWNLOADABLE ASSET ATTACHED TO THIS ENTRY</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--surface-highest)', paddingTop: '2rem' }}>
              <button
                className="btn-primary"
                disabled={!post.file || downloading}
                onClick={() => downloadAsset(post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  background: post.file ? 'linear-gradient(135deg, var(--primary-dim), #60a5fa)' : 'var(--surface-highest)',
                  color: post.file ? '#fff' : 'var(--on-surface-variant)',
                  border: 'none',
                  boxShadow: post.file ? '0 8px 20px -5px var(--primary-dim)' : 'none',
                  cursor: post.file ? 'pointer' : 'not-allowed',
                  opacity: (!post.file || downloading) ? 0.6 : 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {post.file ? 'DOWNLOAD ASSET' : 'LOCKED ASSET'}
              </button>
              <button
                className="btn-select"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showNotification("Intelligence link copied to clipboard");
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                SHARE NODE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
