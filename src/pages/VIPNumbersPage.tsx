import React from 'react';
import NumberGrid from '../components/NumberGrid';
import { motion } from 'framer-motion';

const VIPNumbersPage: React.FC = () => (
  <div style={{ background: 'var(--bg-void)' }}>
    {/* Page Header */}
    <section style={{ padding: '100px 0 56px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', zIndex: 0 }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: 20 }}>
            <span style={{ width: 24, height: 1, background: 'var(--accent-gold)' }} />The VIP Numbers Vault<span style={{ width: 24, height: 1, background: 'var(--accent-gold)' }} />
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
            India's Largest<br />
            <span style={{ background: 'var(--gradient-text-gold)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Premium Number Marketplace</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '580px', lineHeight: 1.75, margin: 0 }}>
            Every number is indexed by Chaldean vibration, planetary energy, and operator. Find yours — it's waiting.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Grid */}
    <section style={{ padding: '64px 0 100px' }}>
      <div className="container">
        <NumberGrid />
      </div>
    </section>
  </div>
);

export default VIPNumbersPage;
