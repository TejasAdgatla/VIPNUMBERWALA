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
    <div className="container" style={{ padding: '80px 20px' }}>
      <header style={{ marginBottom: 40 }}>
         <h1 className="text-display-md" style={{ marginBottom: 8 }}>Your Vault</h1>
         <p style={{ color: 'var(--text-secondary)' }}>Manage your premium numbers and track your requests</p>
      </header>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg-deep)', borderRadius: 24 }}>
           <ShoppingBag size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
           <h3>No numbers purchased yet</h3>
           <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your premium destiny is waiting for you.</p>
           <button onClick={() => navigate('/vip-numbers')} className="btn-primary">Browse VIP Numbers</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#FFF', borderRadius: 24, padding: 24, border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                 <div style={{ width: 64, height: 64, background: 'var(--accent-emerald)', color: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={24} />
                 </div>
                 <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Order #{order.id.slice(-6)}</h3>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                       <span style={{ textTransform: 'capitalize', color: order.status === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-gold)', fontWeight: 700 }}>• {order.status}</span>
                    </div>
                 </div>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {/* Note: This assumes vip_numbers was joined or you have the phone in order data */}
                    <div style={{ padding: '8px 16px', background: 'var(--bg-deep)', borderRadius: 12, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
                       <span style={{ fontWeight: 700, letterSpacing: 1 }}>{order.phone || 'Processing...'}</span>
                       <a 
                        href={`https://wa.me/${supportWA.replace(/\D/g, '')}?text=Hi, I purchased the number ${order.phone || order.id} and I need help with activation.`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                        title="Chat on WhatsApp"
                       >
                          <MessageSquare size={16} />
                       </a>
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                 <a href={`https://wa.me/${supportWA.replace(/\D/g, '')}?text=Help with Order ${order.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 12, color: '#25D366' }}>
                    Support <ExternalLink size={14} style={{ marginLeft: 6 }} />
                 </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
