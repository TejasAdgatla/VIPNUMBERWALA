import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageSquare, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportWA, setSupportWA] = useState('918090050091');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, settingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/settings`)
        ]);
        
        const allOrders = await ordersRes.json();
        const settings = await settingsRes.json();
        
        if (settings.support_whatsapp) setSupportWA(settings.support_whatsapp);
        
        // Filter orders for current user
        const myOrders = allOrders.filter((o: any) => o.customer_phone === user.phone);
        setOrders(myOrders);
      } catch (e) {
        console.error('Failed to fetch profile data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading your vault...</div>;

  return (
    <div className="container" style={{ padding: 'clamp(40px, 10vw, 80px) 20px' }}>
      <header style={{ marginBottom: 40 }}>
         <h1 className="text-display-md" style={{ marginBottom: 8, fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>Your Vault</h1>
         <p style={{ color: 'var(--text-secondary)' }}>Manage your premium numbers and track your requests</p>
      </header>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'clamp(60px, 15vw, 100px) 20px', background: 'var(--bg-deep)', borderRadius: 24, border: '1px solid var(--border-subtle)' }}>
           <ShoppingBag size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
           <h3>No numbers purchased yet</h3>
           <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your premium destiny is waiting for you.</p>
           <button onClick={() => navigate('/vip-numbers')} className="btn-primary">Browse VIP Numbers</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {orders.map((order) => {
            const isPartial = order.status === 'partial';
            const progress = (order.paid_milestones / order.total_milestones) * 100;
            const nextMilestoneAmount = order.total_amount / order.total_milestones;

            const payNextPart = async () => {
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments/create-order`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: nextMilestoneAmount,
                    customer_phone: user?.phone,
                    items: [order.number_id],
                    milestoneIndex: order.paid_milestones + 1,
                    totalMilestones: order.total_milestones
                  })
                });
                const data = await res.json();
                if (data.payment_session_id) {
                   // Using window.Cashfree directly or a shared instance
                   const mode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";
                   const cf = new (window as any).Cashfree({ mode });
                   cf.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: '_self' });
                }
              } catch (e) {
                alert('Could not initiate next payment.');
              }
            };

            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: '#FFF', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '1 1 250px' }}>
                   <div style={{ width: 56, height: 56, background: isPartial ? 'var(--accent-gold)' : 'var(--accent-emerald)', color: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CreditCard size={24} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                        {order.vip_numbers?.phone || 'Loading...'} 
                        {isPartial && <span style={{ fontSize: 12, color: 'var(--accent-gold)', marginLeft: 8 }}>(In Vault)</span>}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                         <span style={{ textTransform: 'capitalize', color: isPartial ? 'var(--accent-gold)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                            • {isPartial ? `Part ${order.paid_milestones} Paid` : 'Fully Allotted'}
                         </span>
                      </div>
                   </div>
                </div>

                <div style={{ flex: '2 1 300px' }}>
                   {isPartial ? (
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
                           <span>Payment Progress</span>
                           <span>{order.paid_milestones}/{order.total_milestones}</span>
                        </div>
                        <div className="progress-bar-container">
                           <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                     </div>
                   ) : (
                      <div style={{ padding: '8px 16px', background: 'var(--bg-deep)', borderRadius: 12, border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                         <span style={{ fontWeight: 700, letterSpacing: 1 }}>{order.vip_numbers?.phone || order.phone}</span>
                         <a 
                          href={`https://wa.me/${supportWA.replace(/\D/g, '')}?text=Hi, I purchased the number ${order.vip_numbers?.phone} and it is fully paid. Help with transfer.`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                         >
                            <MessageSquare size={16} />
                         </a>
                      </div>
                   )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                   {isPartial ? (
                     <button onClick={payNextPart} className="btn-primary" style={{ height: 40, padding: '0 20px', fontSize: 12 }}>
                        Pay Part {order.paid_milestones + 1}
                     </button>
                   ) : (
                     <a href={`https://wa.me/${supportWA.replace(/\D/g, '')}?text=Help with Order ${order.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ height: 40, padding: '0 20px', fontSize: 12, color: '#25D366' }}>
                        Support <ExternalLink size={14} style={{ marginLeft: 6 }} />
                     </a>
                   )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
