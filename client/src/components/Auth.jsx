import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        showNotification("Account created successfully! You can now sign in.", "success");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        showNotification("Logged In Successfully", "success");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-in" style={{ maxWidth: '450px', margin: '100px auto', padding: '48px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="label-sm">{isRegister ? "New Intelligence Profile" : "Identity Verification"}</span>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{isRegister ? "Register" : "Sign In"}</h2>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
          Secure access to the Intelligence Dashboard
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ gap: '24px' }}>
        <div className="input-group">
          <input 
            type="email" 
            placeholder="Official Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Security Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button disabled={loading} style={{ width: '100%' }}>
          {loading ? "AUTHENTICATING..." : (isRegister ? "CREATE ACCOUNT" : "SIGN IN")}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button 
          onClick={() => setIsRegister(!isRegister)}
          style={{ 
            background: 'transparent', 
            color: 'var(--primary-dim)', 
            boxShadow: 'none', 
            fontSize: '0.85rem',
            padding: '8px'
          }}
        >
          {isRegister ? "Already have a profile? Sign In" : "Need registration? Click here"}
        </button>
      </div>
    </div>
  );
}
