import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { useNumbers } from '../context/NumbersContext';
import { useCart } from '../context/CartContext';

const PLANET_DATA: Record<number, { name: string, color: string }> = {
  1: { name: 'Sun',     color: '#C2410C' },
  2: { name: 'Moon',    color: '#6B7280' },
  3: { name: 'Jupiter', color: '#B45309' },
  4: { name: 'Rahu',    color: '#7C3AED' },
  5: { name: 'Mercury', color: '#059669' },
  6: { name: 'Venus',   color: '#DB2777' },
  7: { name: 'Ketu',    color: '#92400E' },
  8: { name: 'Saturn',  color: '#4B5563' },
  9: { name: 'Mars',    color: '#DC2626' },
};

interface FilterState {
  category: string;
  numerology: string;
}

interface NumberGridProps {
  searchQuery?: string;
  filters?: FilterState;
}

const NumberGrid: React.FC<NumberGridProps> = ({ searchQuery = '', filters }) => {
  const { numbers } = useNumbers();
  const { addToCart, items } = useCart();
  
  const filteredNumbers = numbers.filter(n => {
    if (!n.available) return false;
    
    // Search filter
    if (searchQuery && !n.phone.replace(/\s/g, '').includes(searchQuery.replace(/\s/g, ''))) {
      return false;
    }
    
    // Category filter
    if (filters?.category && n.category !== filters.category) return false;
    
    // Numerology filter
    if (filters?.numerology && String(n.numerologyTotal) !== filters.numerology) return false;
    
    return true;
  });

  if (filteredNumbers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 32, border: '1px dashed var(--border-subtle)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 18 }}>No magic numbers match your current criteria.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, color: 'var(--accent-gold)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all filters</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
      {filteredNumbers.map((num, i) => (
        <motion.div
          key={num.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-5%' }}
          transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' }}
        >
          <NumberCard
            num={num}
            inCart={items.some(item => item.id === num.id)}
            onAdd={() => addToCart({ id: num.id, phone: num.phone, price: num.price, category: num.category, energy: num.energy })}
          />
        </motion.div>
      ))}
    </div>
  );
};

interface NumCardProps {
  num: { phone: string; price: string; category: string; energy: string; numerologyTotal: number; };
  inCart: boolean;
  onAdd: () => void;
}

const NumberCard: React.FC<NumCardProps> = ({ num, inCart, onAdd }) => {
  const planet = PLANET_DATA[num.numerologyTotal] || PLANET_DATA[1];
  const planetColor = planet.color;
  const [hovered, setHovered] = useState(false);

  const raw         = num.phone.replace(/\D/g, '');
  const local       = raw.startsWith('91') && raw.length === 12 ? raw.slice(2) : raw.slice(-10);
  const displayPhone = local.length === 10 ? `${local.slice(0, 5)} ${local.slice(5)}` : num.phone;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: hovered || inCart ? '1.5px solid rgba(180,135,15,0.4)' : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 18,
        padding: '24px 22px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 18,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered || inCart
          ? '0 16px 48px rgba(28,18,8,0.12), 0 4px 16px rgba(180,135,15,0.08)'
          : '0 2px 10px rgba(28,18,8,0.07)',
        cursor: 'default',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: hovered || inCart ? 'var(--gradient-gold)' : 'transparent',
        borderRadius: '18px 18px 0 0',
        transition: 'background 0.3s ease',
      }} />

      <div style={{
        position: 'absolute', bottom: -20, right: -8,
        fontFamily: 'var(--font-display)', fontSize: 160, fontWeight: 700,
        color: hovered ? 'rgba(180,135,15,0.06)' : 'rgba(28,18,8,0.03)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        transition: 'color 0.3s ease',
      }}>{num.numerologyTotal}</div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
        <span className="badge" style={{ color: 'var(--accent-gold)', background: 'rgba(180,135,15,0.08)' }}>{num.category}</span>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.1rem',
          fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--text-primary)', lineHeight: 1, marginBottom: 14,
        }}>{displayPhone}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: planetColor }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{planet.name}</span>
          </div>
          <span className="badge" style={{ background: 'rgba(0,0,0,0.04)' }}>Chaldean № {num.numerologyTotal}</span>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 18, position: 'relative',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Price</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1 }}>{num.price}</div>
        </div>
        <button
          onClick={onAdd}
          disabled={inCart}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: inCart ? '#059669' : (hovered ? 'var(--gradient-gold)' : '#FFFFFF'),
            border: inCart ? '1.5px solid #059669' : '1.5px solid rgba(180,135,15,0.45)',
            color: inCart || hovered ? '#FFF' : 'var(--accent-gold)',
            padding: '9px 16px', borderRadius: 10,
            fontFamily: 'var(--font-body)',
            fontWeight: 700, fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase',
            transition: 'all 0.22s ease', cursor: inCart ? 'default' : 'pointer',
          }}
        >
          {inCart ? <Check size={14} /> : <ShoppingCart size={14} />}
          {inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default NumberGrid;
