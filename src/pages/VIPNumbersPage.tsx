import React, { useState } from 'react';
import NumberGrid from '../components/NumberGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Sparkles } from 'lucide-react';
import { useNumbers } from '../context/NumbersContext';

const CHALDEAN_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const VIPNumbersPage: React.FC = () => {
  const { categories } = useNumbers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', numerology: '' });
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => setFilters({ category: '', numerology: '' });
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100vh' }}>
      {/* Page Header */}
      <section style={{ padding: '100px 0 80px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', zIndex: 0 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: 20 }}>
              <span style={{ width: 24, height: 1, background: 'var(--accent-gold)' }} />The Shop<span style={{ width: 24, height: 1, background: 'var(--accent-gold)' }} />
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
              Find Your Destiny<br />
              <span style={{ background: 'var(--gradient-text-gold)', WebkitBackgroundClip: 'text', color: 'transparent' }}>In Every Digit</span>
            </h1>
            
            {/* Aesthetic Search Bar */}
            <div style={{ marginTop: 48, maxWidth: 800, position: 'relative' }}>
               <div style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={20} />
                    <input 
                      type="text" 
                      placeholder="Search for numbers (e.g. 999 or 786)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '20px 24px 20px 56px',
                        background: '#FFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 20,
                        fontSize: 16,
                        fontFamily: 'var(--font-body)',
                        boxShadow: 'var(--shadow-lg)',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      className="search-input-focus"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      height: 62,
                      padding: '0 24px',
                      background: showFilters ? 'var(--accent-gold)' : '#FFF',
                      color: showFilters ? '#FFF' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 20,
                      display: 'flex',
                      flex: '1 1 120px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Filter size={18} /> Filters
                    {activeCount > 0 && <span style={{ background: showFilters ? '#FFF' : 'var(--accent-gold)', color: showFilters ? 'var(--accent-gold)' : '#FFF', width: 20, height: 20, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCount}</span>}
                  </button>
               </div>

               {/* Filter Panel */}
               <AnimatePresence>
                 {showFilters && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    style={{ 
                      marginTop: 24, 
                      background: '#FFF', 
                      borderRadius: 32, 
                      padding: 40, 
                      boxShadow: '0 30px 80px rgba(28,18,8,0.12)', 
                      border: '1px solid rgba(180,135,15,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 32,
                      overflow: 'hidden'
                    }}
                   >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
                        
                        <div className="filter-group">
                           <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: 16 }}>Category</label>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                              {categories.length === 0 && <p style={{ fontSize: 13, color: '#999' }}>No categories in inventory yet.</p>}
                              {categories.map(c => (
                                <button 
                                  key={c}
                                  onClick={() => setFilters({...filters, category: filters.category === c ? '' : c})}
                                  style={{
                                    padding: '10px 18px',
                                    borderRadius: 14,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    border: '1px solid',
                                    borderColor: filters.category === c ? 'var(--accent-gold)' : 'rgba(0,0,0,0.06)',
                                    background: filters.category === c ? 'var(--bg-deep)' : '#F9F9F9',
                                    color: filters.category === c ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >{c}</button>
                              ))}
                           </div>
                        </div>

                        <div className="filter-group">
                           <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: 16 }}>Chaldean Number</label>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', gap: 8 }}>
                              {CHALDEAN_NUMS.map(n => (
                                <button 
                                  key={n}
                                  onClick={() => setFilters({...filters, numerology: filters.numerology === n ? '' : n})}
                                  style={{
                                    aspectRatio: '1',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 800,
                                    border: '1px solid',
                                    borderColor: filters.numerology === n ? 'var(--accent-gold)' : 'rgba(0,0,0,0.06)',
                                    background: filters.numerology === n ? 'var(--bg-deep)' : '#F9F9F9',
                                    color: filters.numerology === n ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >{n}</button>
                              ))}
                           </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                         <button onClick={clearFilters} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clear All Filters</button>
                         <button onClick={() => setShowFilters(false)} className="btn-primary" style={{ flex: '1 1 100%', maxWidth: 'max-content', padding: '14px 40px', borderRadius: 16 }}>Apply Filters</button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '80px 0 120px', minHeight: 600 }}>
        <div className="container">
          <NumberGrid searchQuery={searchQuery} filters={filters} />
        </div>
      </section>
      
      <style>{`
        .search-input-focus:focus {
          border-color: var(--accent-gold) !important;
          box-shadow: 0 20px 40px rgba(180,135,15,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default VIPNumbersPage;
