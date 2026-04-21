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

  const milestones = Math.ceil(total / 50000);
  const milestoneAmount = Math.floor(total / milestones);
  const [activeMilestone, setActiveMilestone] = useState(1);

  const initiatePayment = async (amount: number, index: number) => {
    if (!user || !cashfree) return;
    setLoading(true);
    setActiveMilestone(index);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          customer_phone: user.phone,
          items: items.map(i => i.id),
          milestoneIndex: index,
          totalMilestones: milestones
        })
      });

      const orderData = await response.json();
      
      if (orderData.payment_session_id) {
        await cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_self",
        });
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      alert('Payment failed: ' + (error.details?.message || 'Check your internet connection'));
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
          <h1 className="text-display-md" style={{ marginBottom: 16 }}>Payment Received!</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
            Your payment has been processed. If this was an installment, please check your Vault to complete the remaining parts. 
            The number will be fully allotted once all parts are paid.
          </p>
          <button onClick={() => { clearCart(); navigate('/profile'); }} className="btn-primary" style={{ width: '100%' }}>Go to My Vault</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: 1000 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(32px, 6vw, 60px)' }}>
        
        {/* Left: Summary */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ padding: 8, background: 'var(--accent-gold)', borderRadius: 10, color: '#FFF' }}><ShoppingBag size={20} /></div>
            <h1 className="text-display-sm" style={{ margin: 0 }}>Checkout {milestones > 1 && <span style={{ opacity: 0.5 }}>({milestones} Parts)</span>}</h1>
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
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>High-Value Security</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                     Payments above ₹50,000 are split into safe installments per Cashfree guidelines.
                  </p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Installments */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ background: '#FFF', padding: 'clamp(24px, 4vw, 40px)', borderRadius: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-display-sm" style={{ marginBottom: 12 }}>{milestones > 1 ? 'Instalment Plan' : 'Payment Method'}</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>
               {milestones > 1 
                ? `Total split into ${milestones} equal parts of ₹${milestoneAmount.toLocaleString()}`
                : 'Choose from UPI, Cards, Netbanking or Wallets.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
               {Array.from({ length: milestones }).map((_, i) => (
                 <div key={i} style={{ 
                    padding: '20px', 
                    border: '1.5px solid ' + (i === 0 ? 'var(--accent-gold)' : 'var(--border-subtle)'), 
                    borderRadius: 20, 
                    background: i === 0 ? 'var(--bg-deep)' : 'transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    opacity: i === 0 ? 1 : 0.6
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, background: '#FFF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', fontWeight: 800, color: 'var(--accent-gold)' }}>
                         {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Part {i + 1}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹{milestoneAmount.toLocaleString()}</div>
                      </div>
                   </div>
                   
                   {i === 0 ? (
                     <button 
                       onClick={() => initiatePayment(milestoneAmount, i + 1)} 
                       disabled={loading}
                       className="btn-primary" 
                       style={{ padding: '8px 16px', fontSize: 12 }}
                     >
                       {loading && activeMilestone === i + 1 ? <Loader2 size={14} className="spin" /> : 'Pay Part 1'}
                     </button>
                   ) : (
                     <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Unlocks after Part {i}</div>
                   )}
                 </div>
               ))}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>
              100% Secure • RBI Regulated Gateway
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CheckoutPage;
