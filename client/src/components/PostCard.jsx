import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLikePost } from '../services/api';
import { API_BASE } from '../services/apiConfig';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  const isOwner = user && String(user.id) === String(post.user_id);

  const getFileType = (url) => {
    if (!url) return null;
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'IMAGE';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'VIDEO';
    if (ext === 'pdf') return 'PDF';
    return 'ASSET';
  };

  const fileType = getFileType(post.file);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
        alert("Authentication required for this protocol.");
        return;
    }
    setLikeLoading(true);
    try {
        const res = await toggleLikePost(post.id, user.id);
        if (res.data.liked) {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
        } else {
            setLikesCount(prev => prev - 1);
            setIsLiked(false);
        }
    } catch (err) {
        console.error("Transmission error:", err);
    } finally {
        setLikeLoading(false);
    }
  };
  
  const downloadFile = async (postId) => {
    try {
      setDownloading(true);
      const url = `${API_BASE}/api/posts/download/${postId}?userId=${user?.id || ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("File not found in archive");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'intelligence-asset';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) fileName = match[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Downlink failed:", error);
      alert("Intelligence asset retrieval failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="card post-card" 
      onClick={() => navigate(`/post/${post.id}`)}
      style={{ 
        border: '1px solid var(--surface-highest)',
        borderLeft: `5px solid ${post.is_public ? 'var(--primary-dim)' : '#f59e0b'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '340px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        padding: '1.75rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'transform 0.3s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '0.65rem',
                fontWeight: '900',
                letterSpacing: '0.12em',
                background: post.is_public ? 'linear-gradient(90deg, var(--primary-dim), #60a5fa33)' : 'rgba(245, 158, 11, 0.1)',
                color: post.is_public ? 'var(--primary-dim)' : '#f59e0b',
                textTransform: 'uppercase',
                border: `1px solid ${post.is_public ? 'var(--primary-dim)' : '#f59e0b'}`
            }}>
                {post.is_public ? '● SYNCED' : '○ ENCRYPTED'}
            </div>
            {fileType && (
                <div style={{ 
                    padding: '6px 14px', 
                    borderRadius: '100px', 
                    fontSize: '0.65rem', 
                    fontWeight: '900', 
                    background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--on-surface-variant)',
                    border: '1px solid var(--surface-highest)'
                }}>
                    {fileType}
                </div>
            )}
          </div>

          <button 
            onClick={handleLike}
            disabled={likeLoading}
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--surface-highest)',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isLiked ? '#ef4444' : 'var(--on-surface-variant)',
                cursor: 'pointer',
                padding: '8px 16px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{likesCount}</span>
          </button>
        </div>
        
        <h3 style={{ 
            fontSize: '1.85rem', 
            fontWeight: '900', 
            marginBottom: '1rem', 
            color: 'var(--on-surface)', 
            lineHeight: '1.2', 
            letterSpacing: '-0.04em',
            textTransform: 'capitalize',
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        }}>
          {post.heading}
        </h3>
        <p style={{ 
          color: 'var(--on-surface)', 
          fontSize: '1rem', 
          opacity: 0.5, 
          lineHeight: '1.7', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          marginBottom: '2.5rem',
          overflowWrap: 'anywhere'
        }}>
          {post.description}
        </p>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.25rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px solid var(--surface-highest)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--primary-dim), #3b82f6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontSize: '1rem', 
              fontWeight: '900',
              boxShadow: '0 8px 15px -5px var(--primary-dim)'
            }}>
                {(post.custom_users?.username || 'A')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.12em' }}>INTEL SOURCE</span>
                <span style={{ fontWeight: '900', fontSize: '1rem', color: 'var(--on-surface)', letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{post.custom_users?.username || "Anonymous Caller"}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.12em', display: 'block' }}>ARCHIVED</span>
            <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase() : "PENDING"}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {post.file && (
                <button 
                  disabled={downloading}
                  onClick={(e) => { e.stopPropagation(); downloadFile(post.id); }}
                  className="btn-primary"
                  style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '900', 
                    padding: '10px 18px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 20px -5px var(--primary-dim)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  {downloading ? "LINKING..." : "ASSET"}
                </button>
            )}
            {isOwner && (
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("CRITICAL: Final purge of data node. Proceed?")) {
                      try {
                        const { deletePost } = await import("../services/api");
                        await deletePost(post.id);
                        window.location.reload();
                      } catch (err) { console.error(err); }
                    }
                  }}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    color: '#ef4444', 
                    padding: '10px', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    borderRadius: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 6h18M19 6V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6M10 11v6M14 11v6" />
                  </svg>
                </button>
            )}
          </div>

          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: '900', 
            color: 'var(--primary-dim)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            letterSpacing: '0.08em'
          }}>
            INVESTIGATE <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
