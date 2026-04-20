import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { requestOTP, login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = await requestOTP(phone);
    setLoading(false);
    if (data && data.success) {
      if (data.otp) setFallbackOtp(data.otp);
      setStep('otp');
    }
    else setError('Failed to send OTP. Try again.');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(phone, otp);
    setLoading(false);
    if (success) onClose();
    else setError('Invalid OTP. Please check and try again.');
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
                  {step === 'phone' ? <Phone size={28} /> : <Lock size={28} />}
               </div>
               <h2 className="text-display-lg" style={{ fontSize: '1.5rem' }}>{step === 'phone' ? 'Welcome Back' : 'Verify Identity'}</h2>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{step === 'phone' ? 'Login with your phone to access your account' : `Enter the 6-digit code sent to ${phone}`}</p>
            </div>

            <form onSubmit={step === 'phone' ? handleRequest : handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               {step === 'phone' ? (
                 <div className="input-group">
                    <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>Phone Number</label>
                    <input className="input-field" placeholder="91XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
                 </div>
               ) : (
                 <div className="input-group">
                    <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>One-Time Password</label>
                    <input className="input-field" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }} />
                 </div>
               )}

               {step === 'otp' && fallbackOtp && (
                 <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid #10b981', color: '#059669', padding: '12px 16px', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Development Sandbox OTP</span>
                    <strong style={{ fontSize: 18, letterSpacing: 4 }}>{fallbackOtp}</strong>
                 </div>
               )}

               {error && <p style={{ color: '#DC2626', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}

               <button type="submit" disabled={loading} className="btn-primary btn-large" style={{ width: '100%' }}>
                  {loading ? <Loader2 className="animate-spin" /> : (step === 'phone' ? 'Get OTP' : 'Verify & Login')}
                  {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
               </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 24 }}>
               {step === 'otp' ? (
                 <button onClick={() => setStep('phone')} style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Change Number</button>
               ) : 'OTP will be delivered via WhatsApp'}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
