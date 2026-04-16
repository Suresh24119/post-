import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/apiConfig';

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
      // Wait for user ID to be available if possible
      try {
        setLoading(true);
        const res = await getPostById(id, user?.id);
        setPost(res.data);
      } catch (err) {
        // Only redirect if it's a real error and not just the initial load
        if (err.response?.status === 403 || err.response?.status === 404) {
          showNotification("Access Denied or Node Missing", "error");
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id, navigate, showNotification, user?.id]);

  const getFileType = (url) => {
    if (!url) return null;
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const downloadAsset = async (postId) => {
    if (!postId) return;
    try {
      setDownloading(true);
      showNotification("Initializing secure retrieval...", "info");
      const url = `${API_BASE}/api/posts/download/${postId}?userId=${user?.id || ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Asset missing or inaccessible");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

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
      window.URL.revokeObjectURL(downloadUrl);
      showNotification("Asset decrypted and saved", "success");
    } catch (error) {
      showNotification("Secure retrieval failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div className="loader"></div>
    </div>
  );

  if (!post) return null;

  const fileType = getFileType(post.file);

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Navigation & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '20px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-select"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface-high)', border: '1px solid var(--surface-highest)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            BACK TO STREAM
          </button>

          {post.file && (
            <button 
              className="btn-primary" 
              disabled={downloading}
              onClick={() => downloadAsset(post.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', boxShadow: '0 10px 20px -5px var(--primary-dim)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {downloading ? 'RETRIEVING...' : 'INTELLIGENCE DOWNLOAD'}
            </button>
          )}
        </div>

        {/* Universal Media Preview Section */}
        <div style={{ 
          width: '100%', 
          minHeight: '300px', 
          background: 'var(--surface-high)', 
          borderRadius: '24px', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--surface-highest)',
          marginBottom: '3rem',
          position: 'relative',
          boxShadow: '0 30px 60px -12px rgba(0,0,0,0.2)'
        }}>
          {post.file ? (
            <>
              {fileType === 'image' && (
                <img
                  src={post.file}
                  alt={post.heading}
                  style={{ width: '100%', height: 'auto', maxHeight: '800px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              )}

              {fileType === 'video' && (
                <video 
                  src={post.file} 
                  controls 
                  style={{ width: '100%', maxHeight: '600px', outline: 'none' }}
                  poster="/video-placeholder.png"
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {fileType === 'pdf' && (
                <iframe 
                  src={`${post.file}#toolbar=0`} 
                  style={{ width: '100%', height: '700px', border: 'none' }}
                  title="PDF Preview"
                />
              )}

              {fileType === 'other' && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dim)" strokeWidth="1.5" style={{ marginBottom: '1.5rem' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--on-surface)' }}>RAW DATA DETECTED</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>This asset type requires manual download for processing.</p>
                </div>
              )}

              {/* Universal Error Fallback */}
              <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '4rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface-variant)" strokeWidth="1" opacity="0.3">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--primary-dim)', marginBottom: '8px' }}>ENCRYPTED OR MISSING</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>The data node could not be retrieved from the archive.</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <span style={{ fontWeight: '900', fontSize: '0.75rem', opacity: 0.2, letterSpacing: '0.2em' }}>NO VISUAL ASSET ATTACHED</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
            <div style={{ padding: '6px 12px', background: post.is_public ? 'var(--primary-dim)' : 'rgba(255,255,255,0.05)', color: post.is_public ? '#fff' : 'var(--on-surface-variant)', fontSize: '0.7rem', fontWeight: '900', borderRadius: '4px' }}>
              {post.is_public ? 'PUBLIC' : 'RESTRICTED'}
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: '700' }}>INDEX: {String(post.id).substring(0,8)}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: '700' }}>• {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>

          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '900', 
            marginBottom: '2rem', 
            letterSpacing: '-0.04em', 
            lineHeight: '1.1', 
            color: 'var(--on-surface)',
            overflowWrap: 'anywhere'
          }}>
            {post.heading}
          </h1>
          
          <p style={{ 
            fontSize: '1.35rem', 
            lineHeight: '1.8', 
            color: 'var(--on-surface)', 
            opacity: 0.8, 
            whiteSpace: 'pre-wrap', 
            marginBottom: '4rem',
            overflowWrap: 'anywhere'
          }}>
            {post.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div style={{ padding: '2rem', background: 'var(--surface-high)', borderRadius: '16px', border: '1px solid var(--surface-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>
                {(post.custom_users?.username || 'A')[0].toUpperCase()}
             </div>
             <div>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.1em' }}>REPORTING OFFICER</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{post.custom_users?.username || 'Anonymous'}</span>
             </div>
          </div>
          <button 
            className="btn-select" 
            onClick={() => { navigator.clipboard.writeText(window.location.href); showNotification("Node link copied to secure clipboard"); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            SHARE NODE
          </button>
        </div>

      </div>
    </div>
  );
}
