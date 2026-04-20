import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CheckoutStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | null>(null);
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments/verify/${orderId}`);
        const data = await res.json();
        
        setStatus(data.order_status);
        if (data.order_status === 'PAID') {
          clearCart();
        }
      } catch (e) {
        console.error('Verification failed:', e);
        setStatus('FAILED');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, navigate, clearCart]);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Loader2 size={48} className="spin" color="var(--accent-gold)" />
        <h2 className="text-display-sm">Verifying Transaction...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please do not refresh or close this window.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 500, padding: 40, background: '#FFF', borderRadius: 32, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
        
        {status === 'PAID' ? (
          <>
            <div style={{ width: 80, height: 80, background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-display-md" style={{ marginBottom: 16 }}>Payment Confirmed!</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
               Your premium numbers are now reserved. Our team will contact you on WhatsApp to proceed with the activation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <a href="https://wa.me/919956591717" className="btn-primary" style={{ background: '#25D366' }}>
                  <MessageSquare size={18} /> Chat with Support
               </a>
               <button onClick={() => navigate('/')} className="btn-outline">Back to Home</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 80, height: 80, background: '#FEE2E2', color: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <XCircle size={48} />
            </div>
            <h1 className="text-display-md" style={{ marginBottom: 16 }}>Payment Failed</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
               Something went wrong with the transaction. No worries, your items are still in your bag.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <button onClick={() => navigate('/checkout')} className="btn-primary">
                  Try Again <ArrowRight size={18} />
               </button>
               <button onClick={() => navigate('/')} className="btn-outline">Return to Home</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutStatusPage;
