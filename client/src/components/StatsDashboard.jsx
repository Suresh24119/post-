import { useEffect, useState } from "react";
import { getPosts } from "../services/api";

export default function StatsDashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    assets: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPosts();
        const posts = res.data || [];
        setStats({
          total: posts.length,
          public: posts.filter(p => p.is_public).length,
          private: posts.filter(p => !p.is_public).length,
          assets: posts.filter(p => p.file).length
        });
      } catch (error) {
        console.error("Stats failure:", error);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  const statItemStyle = {
    flex: 1,
    padding: '24px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid var(--surface-highest)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
      <div style={statItemStyle}>
        <span className="label-sm" style={{ margin: 0, opacity: 0.6 }}>Total Nodes</span>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{stats.total.toString().padStart(2, '0')}</h3>
      </div>
      <div style={statItemStyle}>
        <span className="label-sm" style={{ margin: 0, color: 'var(--primary-dim)' }}>Public Access</span>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{stats.public.toString().padStart(2, '0')}</h3>
      </div>
      <div style={statItemStyle}>
        <span className="label-sm" style={{ margin: 0, color: 'var(--on-surface-variant)' }}>Private Vault</span>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{stats.private.toString().padStart(2, '0')}</h3>
      </div>
      <div style={statItemStyle}>
        <span className="label-sm" style={{ margin: 0, color: '#10b981' }}>Secure Assets</span>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{stats.assets.toString().padStart(2, '0')}</h3>
      </div>
    </div>
  );
}
