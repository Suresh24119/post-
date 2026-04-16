import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import PostCard from "./PostCard";
import { useAuth } from "../context/AuthContext";

export default function PostList({ refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts(user?.id);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger, user]);

  const filteredPosts = posts.filter(p => 
    p.heading.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && posts.length === 0) {
    return (
      <div className="post-grid">
        <div className="card" style={{ opacity: 0.5, textAlign: 'center' }}>
          <span className="label-sm">Synchronizing</span>
          <h2>Fetching from Supabase...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="post-grid">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--surface-highest)',
        marginBottom: '2rem'
      }}>
        <div>
          <span className="label-sm" style={{ margin: 0, color: 'var(--on-surface-variant)', opacity: 0.6 }}>INDEXED ENTRIES</span>
          <h2 style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Latest Intelligence</h2>
        </div>
        <div style={{ position: 'relative', width: '320px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--on-surface-variant)',
            opacity: 0.4
          }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input 
            placeholder="Search archive..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: '14px 14px 14px 48px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              borderRadius: '8px', 
              background: 'var(--surface-high)',
              border: '1px solid var(--surface-highest)',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      </header>
      {filteredPosts.length === 0 ? (
        <p className="card" style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          {search ? "No results matching your query." : "No entries found in the archive."}
        </p>
      ) : (
        filteredPosts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
