import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const success = mode === 'login' 
      ? await login(phone, password)
      : await register(phone, password);
      
    setLoading(false);
    if (success) onClose();
    else setError(mode === 'login' ? 'Invalid credentials' : 'User already exists or signup failed');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} 
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} 
          />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ position: 'relative', width: '100%', maxWidth: 400, background: '#FFF', borderRadius: 28, padding: 40, boxShadow: 'var(--shadow-xl)' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, color: 'var(--text-tertiary)' }}><X size={20} /></button>
            
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
               <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-gold)' }}>
                  <Lock size={28} />
               </div>
               <h2 className="text-display-lg" style={{ fontSize: '1.5rem' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                 {mode === 'login' ? 'Enter your details to access your account' : 'Register to start purchasing VIP numbers'}
               </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div className="input-group">
                  <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>Phone Number</label>
                  <input className="input-field" placeholder="91XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
               </div>

               <div className="input-group">
                  <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>Password</label>
                  <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
               </div>

               {error && <p style={{ color: '#DC2626', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}

               <button type="submit" disabled={loading} className="btn-primary btn-large" style={{ width: '100%' }}>
                  {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Login' : 'Signup')}
                  {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
               </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', marginTop: 24 }}>
               {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
               <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                 {mode === 'login' ? 'Signup Now' : 'Login Now'}
               </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
