import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className="intelligence-toast" style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          padding: '18px 36px',
          background: notification.type === 'error' ? 'var(--error)' : 'var(--primary-dim)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontFamily: 'Inter',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 10px white'
          }} />
          {notification.msg}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(50px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
