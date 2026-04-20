import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequest: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onLoginRequest }) => {
  const { items, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      onLoginRequest();
      return;
    }
    navigate('/checkout');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1100 }}
          />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 450, background: '#FFF', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.1)' }}
          >
            <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 className="text-display-lg" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ShoppingBag size={24} color="var(--accent-gold)" /> Your Bag
               </h2>
               <button onClick={onClose} style={{ color: 'var(--text-tertiary)' }}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px' }}>
               {items.length === 0 ? (
                 <div style={{ textAlign: 'center', marginTop: 100 }}>
                    <div style={{ color: 'var(--border-subtle)', marginBottom: 20 }}><ShoppingBag size={64} /></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Your bag is empty.</p>
                    <button onClick={onClose} className="btn-outline" style={{ marginTop: 24 }}>Explore Numbers</button>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ background: '#f8f7f4', borderRadius: 20, padding: 24, border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{item.phone}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', gap: 8 }}>
                               <span>{item.category}</span>
                               <span>•</span>
                               <span>{item.energy}</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-gold)', marginTop: 8 }}>{item.price}</div>
                         </div>
                         <button onClick={() => removeFromCart(item.id)} style={{ color: '#DC2626', padding: 8 }}><Trash2 size={18} /></button>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: 40, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <span className="text-label">Estimated Total</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>₹{total.toLocaleString()}</span>
                 </div>
                 <button onClick={handleCheckout} className="btn-primary btn-large" style={{ width: '100%' }}>
                    {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                    <ArrowRight size={18} style={{ marginLeft: 8 }} />
                 </button>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, color: 'var(--text-tertiary)', fontSize: 12 }}>
                    <CreditCard size={14} /> Secured by WhatsApp Reconciliation
                 </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
