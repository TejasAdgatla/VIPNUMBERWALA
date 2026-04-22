import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);

    // Analytics Hit
    const trackHit = async () => {
      let vid = localStorage.getItem('v_id');
      if (!vid) { vid = 'v_' + Math.random().toString(36).slice(2, 11); localStorage.setItem('v_id', vid); }
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/analytics/hit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: location.pathname, visitorId: vid, device: window.innerWidth < 768 ? 'mobile' : 'desktop' })
        });
      } catch (e) {}
    };
    trackHit();
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
    { to: '/vip-numbers',label: 'Shop'             },
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

          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Desktop Auth (Hidden on small screens) */}
            <div className="desktop-auth">
              {user ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/profile" style={{ textAlign: 'right', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }} className="hover-opacity">
                       <div style={{ fontSize: 10, color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.is_admin ? 'Admin' : 'Personal'}</div>
                       <div style={{ fontSize: 13, fontWeight: 700 }}>{user.phone}</div>
                    </Link>
                    <button onClick={logout} style={{ color: 'var(--text-tertiary)', padding: 8, background: 'none', border: 'none', cursor: 'pointer' }} title="Logout"><LogOut size={18} /></button>
                 </div>
              ) : (
                 <button onClick={() => setIsAuthOpen(true)} className="btn-secondary" style={{ height: '40px', fontSize: '12.5px' }}>
                    <UserIcon size={16} />
                    Login / Join
                 </button>
              )}
            </div>

            {/* Cart Icon (Always Visible) */}
            <button onClick={() => setIsCartOpen(true)} style={{ position: 'relative', color: 'var(--text-primary)', background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
               <ShoppingCart size={22} />
               {items.length > 0 && (
                 <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-gold)', color: 'white', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {items.length}
                 </span>
               )}
            </button>

            {/* Mobile Menu Toggle (Always Visible on Mobile) */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 32, padding: '40px 0' }}>
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end onClick={() => setIsMenuOpen(false)} style={{ fontSize: 28, fontWeight: 700 }}>{link.label}</NavLink>
              ))}
              {!user && <button onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true); }} className="btn-primary" style={{ fontSize: 20 }}>Login / Signup</button>}
            </div>
            
            {user && (
              <div style={{ marginTop: 'auto', paddingBottom: 20 }}>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FFF', padding: '16px 20px', borderRadius: 20, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', textDecoration: 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', flexShrink: 0 }}>
                     <UserIcon size={24} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                     <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                       {user.is_admin ? 'Admin Vault' : 'My Vault'}
                     </div>
                     <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.phone}</div>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); setIsMenuOpen(false); }} style={{ padding: 12, color: 'var(--text-tertiary)', background: 'rgba(0,0,0,0.04)', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <LogOut size={20} />
                  </button>
                </Link>
              </div>
            )}
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


    </div>
  );
};

export default Layout;
