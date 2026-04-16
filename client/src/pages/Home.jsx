import React, { useState } from "react";
import { Link } from "react-router-dom";
import PostForm from "../components/PostForm";
import PostList from "../components/PostList";
import StatsDashboard from "../components/StatsDashboard";
import Auth from "../components/Auth";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function Home() {
  const [refresh, setRefresh] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const { user, signOut } = useAuth();
  const { showNotification } = useNotification();

  const handleRefresh = () => setRefresh(prev => prev + 1);

  const handleLogout = async () => {
    try {
      await signOut();
      showNotification("Session Terminated", "info");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  return (
    <div className="container animate-in" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <span className="label-sm" style={{ margin: 0, textTransform: 'lowercase', opacity: 0.6 }}>{user.email}</span>
            <Link 
              to="/profile"
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.8rem', 
                background: 'var(--surface-high)', 
                color: 'var(--primary-dim)',
                border: '1px solid var(--surface-highest)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800
              }}
            >
              PROFILE
            </Link>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.8rem', 
                background: 'var(--surface-high)', 
                color: 'var(--error)',
                border: '1px solid var(--surface-highest)',
                boxShadow: 'none'
              }}
            >
              LOGOUT
            </button>
          </>
        ) : (
          <button 
            onClick={() => setShowAuth(!showAuth)}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.8rem', 
              background: 'var(--primary-dim)', 
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {showAuth ? "BACK" : "LOGIN / REGISTER"}
          </button>
        )}
      </div>

      {showAuth && !user ? (
        <Auth />
      ) : (
        <>
          <header style={{ marginBottom: '3rem', maxWidth: '600px' }}>
            <span className="label-sm">Intelligence Dashboard</span>
            <h1>Post Manager</h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem' }}>
              A high-end editorial experience for social intelligence and content management.
            </p>
          </header>
          
          <StatsDashboard refreshTrigger={refresh} />
          
          <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
            {user && (
              <section>
                <PostForm onRefresh={handleRefresh} />
              </section>
            )}
            
            <section>
              <PostList refreshTrigger={refresh} />
            </section>
          </main>
        </>
      )}
    </div>
  );
}
