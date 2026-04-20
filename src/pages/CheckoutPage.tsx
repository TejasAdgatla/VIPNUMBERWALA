import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Cashfree: any;
  }
}

const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  
  // Cashfree initialization
  const [cashfree, setCashfree] = useState<any>(null);

  useEffect(() => {
    if (window.Cashfree) {
      const mode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";
      setCashfree(new window.Cashfree({ mode }));
    } else {
      console.error('Cashfree SDK not loaded');
    }
  }, []);

  useEffect(() => {
    if (items.length === 0 && status !== 'success') {
      navigate('/vip-numbers');
    }
  }, [items, navigate, status]);

  const initiatePayment = async () => {
    if (!user || !cashfree) return;
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customer_phone: user.phone,
          items: items.map(i => i.id)
        })
      });

      const orderData = await response.json();
      
      if (orderData.payment_session_id) {
        let checkoutOptions = {
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_self", // Optional: "_self" or "_blank"
        };
        
        await cashfree.checkout(checkoutOptions);
        // Cashfree handles the redirect or modal
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Could not initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 500, padding: 40, background: '#FFF', borderRadius: 32, boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: 80, height: 80, background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-display-md" style={{ marginBottom: 16 }}>Payment Successful!</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
            Thank you for your purchase. Your VIP numbers have been reserved and our agent will contact you shortly for the transfer process.
          </p>
          <button onClick={() => { clearCart(); navigate('/'); }} className="btn-primary" style={{ width: '100%' }}>Back to Dashboard</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: 1000 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 60 }}>
        
        {/* Left: Summary */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ padding: 8, background: 'var(--accent-gold)', borderRadius: 10, color: '#FFF' }}><ShoppingBag size={20} /></div>
            <h1 className="text-display-sm" style={{ margin: 0 }}>Checkout</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{item.phone}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.category} • {item.energy}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{item.price}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, fontSize: 20, fontWeight: 800 }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--accent-gold)' }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-deep)', padding: 24, borderRadius: 20, border: '1px solid rgba(180,135,15,0.2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
               <ShieldCheck size={20} color="var(--accent-gold)" />
               <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Secure Processing</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Your payment is processed securely via Cashfree Payments. We do not store your card or bank details.
                  </p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Action */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ background: '#FFF', padding: 40, borderRadius: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-display-sm" style={{ marginBottom: 12 }}>Payment Method</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Choose from UPI, Cards, Netbanking or Wallets.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
               <div style={{ padding: '20px', border: '2px solid var(--accent-gold)', borderRadius: 20, background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, background: '#FFF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                     <CreditCard size={24} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Cashfree Secure Gateway</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Powered by Cashfree Payments India</div>
                  </div>
               </div>
            </div>

            <button 
              onClick={initiatePayment} 
              disabled={loading}
              className="btn-primary btn-large" 
              style={{ width: '100%', position: 'relative' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" style={{ marginRight: 8 }} />
                  Initializing...
                </>
              ) : (
                <>
                  Pay ₹{total.toLocaleString()} Now
                  <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </>
              )}
            </button>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>
              100% Secure & Trusted • No Hidden Charges
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CheckoutPage;
