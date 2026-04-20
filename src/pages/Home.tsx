import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Sparkles, Phone, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import NumberGrid from '../components/NumberGrid';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

const STATS = [
  { value: '2,400+', label: 'Numbers Sold'  },
  { value: '500+',   label: 'Happy Clients' },
  { value: '4.9★',   label: 'Avg. Rating'   },
  { value: '< 2hrs', label: 'Delivery Time' },
];

const FEATURES = [
  {
    icon: <Shield size={26} color="var(--accent-gold)" />,
    title: '100% Legally Verified',
    body: 'Complete documentation, operator verification, and immediate legal transfer to your name — guaranteed.',
  },
  {
    icon: <Phone size={26} color="#059669" />,
    title: 'Instant WhatsApp Process',
    body: 'Talk to a real human expert on WhatsApp. Zero forms, zero waiting. Direct purchase conversation.',
  },
  {
    icon: <Sparkles size={26} color="#7C3AED" />,
    title: 'Chaldean Numerology',
    body: 'Every number is cross-indexed with ancient Chaldean charts, planetary energies, and your life-path.',
  },
  {
    icon: <Star size={26} color="var(--accent-saffron)" />,
    title: 'India\'s Largest Inventory',
    body: 'Over 500+ premium VIP numbers spanning Airtel, Jio, Vi & BSNL with 4.9★ rating nationwide.',
  },
];

const TESTIMONIALS = [
  { name: 'Rahul Mehta',  city: 'Mumbai, MH',    stars: 5, text: '"Got my 9999 series number within 2 hours. The numerology report was spot on. Business is flying!"', number: '98999 09999' },
  { name: 'Priya Sharma', city: 'New Delhi',      stars: 5, text: '"Running my clinic on a Venus number now. Within a month, I had more patients than ever before."',    number: '77777 81111' },
  { name: 'Karan Kapoor', city: 'Bengaluru, KA',  stars: 5, text: '"Process was so smooth. They explained every digit. Felt like speaking to a real Chaldean expert."',   number: '90000 01111' },
  { name: 'Anjali Singh', city: 'Ahmedabad, GJ',  stars: 5, text: '"Bought a rudraksha too. Premium packaging, quick delivery. Will recommend to everyone in family."',    number: '66666 78888' },
  { name: 'Vikas Gupta',  city: 'Hyderabad, TS',  stars: 5, text: '"My 8888 series is now my business number. Saturn energy is working wonders. Thank you team!"',         number: '98888 80000' },
];

const Home: React.FC = () => {
  const featuresRef = React.useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-10%' });
  const statsRef = React.useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-10%' });

  return (
    <div style={{ background: 'var(--bg-void)' }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', padding: '120px 0 80px',
        background: 'var(--bg-void)',
      }}>
        {/* Subtle gradient background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'var(--gradient-hero)',
        }} />
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-5%', right: '-5%',
          width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)',
          borderRadius: '50%', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(180,135,15,0.07) 0%, transparent 70%)',
          borderRadius: '50%', zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '80px', alignItems: 'center',
          }}>

            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <motion.div variants={fadeUp}>
                <span className="badge badge-gold">India's #1 VIP Number Platform</span>
              </motion.div>

              <motion.h1 variants={fadeUp} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Your Phone Number<br />
                <span style={{
                  background: 'var(--gradient-text-gold)',
                  WebkitBackgroundClip: 'text', color: 'transparent',
                }}>
                  Carries Energy
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{
                fontSize: '18px', color: 'var(--text-secondary)',
                lineHeight: 1.75, maxWidth: '460px', margin: 0,
              }}>
                Ancient Chaldean wisdom meets modern India. Pick a VIP mobile number aligned with your birth date, life-path, and planetary energy — and watch doors open.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/vip-numbers" className="btn-primary btn-large">
                  Browse VIP Numbers <ArrowRight size={16} />
                </Link>
                <Link to="/numerology" className="btn-secondary btn-large">
                  Free Numerology Check
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Starting ₹999 onwards', 'Instant WhatsApp delivery', '100% legally verified transfer'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <CheckCircle size={14} color="var(--accent-gold)" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Card Stack */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              style={{ position: 'relative', height: 340, display: 'flex', alignItems: 'center' }}
            >
              {/* Shadow cards */}
              <div style={{
                position: 'absolute', top: '8%', left: '4%', right: '4%', height: '84%',
                transform: 'rotate(-2.5deg)',
                background: '#F4EFE6', borderRadius: 20,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 16px rgba(28,18,8,0.06)',
              }} />
              <div style={{
                position: 'absolute', top: '4%', left: '2%', right: '2%', height: '90%',
                transform: 'rotate(1.5deg)',
                background: '#FDFAF4', borderRadius: 20,
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 4px 16px rgba(28,18,8,0.06)',
              }} />

              {/* Main card */}
              <div style={{
                position: 'relative', flex: 1,
                background: '#FFFFFF',
                borderRadius: 20,
                border: '1px solid rgba(180,135,15,0.25)',
                padding: '28px',
                boxShadow: '0 16px 48px rgba(28,18,8,0.12), 0 4px 12px rgba(28,18,8,0.06)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                zIndex: 2, overflow: 'hidden',
              }}>
                {/* Gold top strip */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'var(--gradient-gold)', borderRadius: '20px 20px 0 0',
                }} />
                {/* Watermark */}
                <div style={{
                  position: 'absolute', bottom: -24, right: -16,
                  fontSize: 180, fontFamily: 'var(--font-display)',
                  color: 'rgba(180,135,15,0.05)', lineHeight: 1,
                  userSelect: 'none', pointerEvents: 'none', fontWeight: 700,
                }}>9</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-subtle">PREMIUM</span>
                  <span className="badge badge-gold">MIRROR NUMBER</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: 'var(--text-primary)',
                    lineHeight: 1, marginBottom: 14,
                  }}>90000 09999</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span className="badge badge-subtle">Mars · 9</span>
                    <span className="badge badge-subtle">Airtel</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, background: '#059669', borderRadius: '50%', display: 'inline-block' }} />
                      Available
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Price</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1 }}>₹59,999</div>
                  </div>
                  <Link to="/vip-numbers" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
                    Buy Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section style={{
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '36px 0',
      }}>
        <div className="container">
          <motion.div
            ref={statsRef}
            variants={stagger} initial="hidden" animate={statsInView ? 'show' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '24px' }}
          >
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fadeUp} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRENDING NUMBERS
      ══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8%' }}>
            <motion.div variants={fadeUp} className="section-header">
              <span className="section-overline">Hand-Picked</span>
              <h2 className="section-title">Trending VIP Numbers</h2>
              <p className="section-subtitle">Most wanted numbers this week, curated by our numerology expert team.</p>
            </motion.div>
            <NumberGrid />
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
              <Link to="/vip-numbers" className="btn-secondary btn-large">
                View All 500+ Numbers <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-deep)' }}>
        <div className="container">
          <motion.div
            ref={featuresRef}
            variants={stagger} initial="hidden" animate={featuresInView ? 'show' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="section-header">
              <span className="section-overline">Why VIPNumberWala</span>
              <h2 className="section-title">Built for India. Built with Trust.</h2>
              <p className="section-subtitle">We combine ancient numerological wisdom with a seamless, WhatsApp-first purchase experience.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 18,
                  padding: '36px 28px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.25s ease',
                }}
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(28,18,8,0.10)', transition: { duration: 0.2 } }}
                >
                  <div style={{
                    width: 52, height: 52,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 22,
                  }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15.5px', color: 'var(--text-primary)', marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-void)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <span className="section-overline">Testimonials</span>
            <h2 className="section-title" style={{ margin: '16px auto 0' }}>Loved across India</h2>
          </motion.div>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, zIndex: 2, background: 'linear-gradient(to right, var(--bg-void), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, zIndex: 2, background: 'linear-gradient(to left, var(--bg-void), transparent)', pointerEvents: 'none' }} />

          <div className="animate-marquee-scroll" style={{ gap: '20px', padding: '8px 0' }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} style={{
                width: 360, flexShrink: 0,
                background: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 18,
                padding: '28px 24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ color: 'var(--accent-gold)', fontSize: 13, letterSpacing: '3px' }}>{'★'.repeat(t.stars)}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{t.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.city}</div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.07em',
                    color: 'var(--accent-gold)', background: 'rgba(180,135,15,0.07)',
                    border: '1px solid rgba(180,135,15,0.18)', padding: '5px 10px', borderRadius: 8,
                  }}>{t.number}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0 120px', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(109,40,217,0.07) 0%, transparent 70%)',
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-overline" style={{ justifyContent: 'center' }}>Ready to Buy?</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 700, lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              maxWidth: 680, margin: '20px auto 20px',
            }}>
              Your Lucky Number Is Waiting.<br />
              <span style={{ background: 'var(--gradient-text-gold)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Don't Let Someone Else Claim It.
              </span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
              Browse 500+ premium numbers. Talk to a real expert on WhatsApp. Get delivery in under 2 hours.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/vip-numbers" className="btn-primary btn-large">
                Browse All Numbers <ArrowRight size={18} />
              </Link>
              <a href="https://wa.me/919956591717" target="_blank" rel="noreferrer" className="btn-secondary btn-large">
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
