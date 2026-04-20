import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin: React.FC = () => {
  const { loginAdmin } = useAuth();
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(pass);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ background: '#FFF', padding: '40px', borderRadius: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)', width: '100%', maxWidth: 400, textAlign: 'center' }}
      >
        <div style={{ width: 64, height: 64, background: 'var(--bg-deep)', borderRadius: 20, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
          <Lock size={32} />
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 8 }}>Restricted Access</h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 32 }}>Enter the master password to unlock the terminal.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="password"
              className="input-field"
              placeholder="••••••••"
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.2em', borderColor: error ? '#DC2626' : 'var(--border-subtle)' }}
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoFocus
            />
          </div>
          
          <button type="submit" className="btn-primary btn-large" style={{ width: '100%' }}>
            Unlock Vault <ShieldCheck size={18} />
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, color: '#DC2626', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <AlertCircle size={14} /> Invalid authentication credentials.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
