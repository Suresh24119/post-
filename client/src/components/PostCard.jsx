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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
        alert("Please login to like this post.");
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
        console.error("Like failed:", err);
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
      console.error("Download fetch failed:", error);
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
        borderLeft: `4px solid ${post.is_public ? 'var(--primary-dim)' : 'var(--on-surface-variant)'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '320px',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.6rem',
            fontWeight: '900',
            letterSpacing: '0.1em',
            background: post.is_public ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-high)',
            color: post.is_public ? 'var(--primary-dim)' : 'var(--on-surface-variant)',
            textTransform: 'uppercase',
            border: '1px solid currentColor'
          }}>
            {post.is_public ? '● PUBLIC' : '○ RESTRICTED'}
          </div>

          <button 
            onClick={handleLike}
            disabled={likeLoading}
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--surface-highest)',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isLiked ? '#ef4444' : 'var(--on-surface-variant)',
                cursor: 'pointer',
                padding: '6px 14px',
                transition: 'all 0.2s',
                boxShadow: 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>{likesCount}</span>
          </button>
        </div>
        
        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--on-surface)', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
          {post.heading}
        </h3>
        <p style={{ 
          color: 'var(--on-surface)', 
          fontSize: '1rem', 
          opacity: 0.6, 
          lineHeight: '1.6', 
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {post.description}
        </p>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '1.25rem', 
          borderBottom: '1px solid var(--surface-highest)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'var(--primary-dim)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontSize: '0.8rem', 
              fontWeight: '900' 
            }}>
                {(post.custom_users?.username || 'A')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.1em' }}>AUTHOR</span>
                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--on-surface)' }}>{post.custom_users?.username || "Anonymous"}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.1em', display: 'block' }}>ARCHIVED</span>
            <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase() : "PENDING"}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {post.file && (
                <button 
                  disabled={downloading}
                  onClick={(e) => { e.stopPropagation(); downloadFile(post.id); }}
                  style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: '900', 
                    padding: '8px 14px',
                    background: 'var(--surface-high)',
                    border: '1px solid var(--surface-highest)'
                  }}
                >
                  {downloading ? "..." : "ASSET"}
                </button>
            )}
            {isOwner && (
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Purge intelligence node?")) {
                      try {
                        const { deletePost } = await import("../services/api");
                        await deletePost(post.id);
                        window.location.reload();
                      } catch (err) { console.error(err); }
                    }
                  }}
                  style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', padding: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
            )}
          </div>

          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: '900', 
            color: 'var(--primary-dim)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            letterSpacing: '0.05em'
          }}>
            ACCESS <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
