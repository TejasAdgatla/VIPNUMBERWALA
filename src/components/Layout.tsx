import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, PhoneCall, MessageSquare, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items } = useCart();

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }, [isMenuOpen]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const NAV_LINKS = [
    { to: '/',           label: 'Home'             },
    { to: '/vip-numbers',label: 'VIP Numbers'      },
    { to: '/numerology', label: 'Numerology'        },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onLoginRequest={() => { setIsCartOpen(false); setIsAuthOpen(true); }} />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="navbar" style={{ boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.6)' : 'none' }}>
        <div className="nav-content">

          <Link to="/" className="logo">
            <div className="logo-mark">V</div>
            <span className="logo-text">VIP<span>Number</span>Wala</span>
          </Link>

          <div className="desktop-links">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Cart Icon */}
            <button onClick={() => setIsCartOpen(true)} style={{ position: 'relative', color: 'var(--text-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
               <ShoppingCart size={22} />
               {items.length > 0 && (
                 <span style={{ position: 'absolute', top: -8, right: -10, background: 'var(--accent-gold)', color: 'white', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {items.length}
                 </span>
               )}
            </button>

            {/* Auth Button */}
            {user ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>{user.is_admin ? 'Admin' : 'Personal'}</div>
                     <div style={{ fontSize: 13, fontWeight: 700 }}>{user.phone}</div>
                  </div>
                  <button onClick={logout} style={{ color: 'var(--text-tertiary)', padding: 8 }} title="Logout"><LogOut size={18} /></button>
               </div>
            ) : (
               <button onClick={() => setIsAuthOpen(true)} className="btn-secondary" style={{ height: '40px', fontSize: '12.5px' }}>
                  <UserIcon size={16} />
                  Login / Join
               </button>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, padding: 8, color: 'var(--text-primary)' }}><X size={24} /></button>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 32, padding: 40 }}>
              {NAV_LINKS.map((link, i) => (
                <NavLink key={link.to} to={link.to} end style={{ fontSize: 28, fontWeight: 700 }}>{link.label}</NavLink>
              ))}
              {!user && <button onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true); }} className="btn-primary" style={{ fontSize: 20 }}>Login / Signup</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="page-content" style={{ flex: 1 }}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <h2>VIP<span>Number</span>Wala</h2>
            <p>India's finest marketplace for premium VIP mobile numbers and Chaldean-aligned spiritual products. Every number is your destiny.</p>
          </div>
          <div className="footer-links-row">
            <div className="link-col">
              <h4>Explore</h4>
              <Link to="/">Home</Link>
              <Link to="/vip-numbers">VIP Numbers</Link>
              <Link to="/numerology">Free Numerology Tool</Link>
            </div>
            <div className="link-col">
              <h4>Trust</h4>
              <span>✓ Verified Number Transfers</span>
              <span>✓ WhatsApp OTP Secured</span>
              <span>✓ Loyalty Rewards Coming Soon</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>© 2026 VIPNumberWala.shop — Made with ❤️ for India</p>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default Layout;
