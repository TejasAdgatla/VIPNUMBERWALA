import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNumbers } from '../context/NumbersContext';
import { ArrowRight, User, Calendar, CreditCard, Phone, Hash, RefreshCw, Star } from 'lucide-react';

/* ── CHALDEAN DATABASE ─────────────────────────────────────────── */

const NUMERO_DB: Record<string, string> = {
  "11": "Amplified individuality, ego intensity, self-focus",
  "12": "Sensitivity, cooperation, emotional dependence",
  "13": "Creative expression, communication, charisma",
  "14": "Structured leadership, discipline, rigid mindset",
  "15": "Dynamic thinking, adaptability, restless energy",
  "16": "Ego clashes, sudden fall, responsibility burden ⚠️",
  "17": "Success, recognition, legacy, spiritual victory ⭐",
  "18": "Power struggle, karmic leadership, pressure",
  "19": "Aggressive leadership, action-driven success",
  "22": "High sensitivity, emotional depth, vulnerability",
  "23": "Protection, smooth success, social intelligence ⭐",
  "24": "Emotional instability, confusion ⚠️",
  "25": "Smart communication, adaptability",
  "26": "Love, care, family bonding",
  "27": "Intuitive intelligence, spiritual insight",
  "28": "Emotional stress, financial pressure ⚠️",
  "29": "Emotional aggression, impulsive reactions",
  "33": "Creative mastery, expression, artistic power",
  "34": "Practical intelligence, grounded creativity",
  "35": "Fast thinking, communication excellence",
  "36": "Talent + distraction, imbalance ⚠️",
  "37": "Intelligent success, luck, refined thinking ⭐",
  "38": "Blocked creativity, struggle in expression ⚠️",
  "39": "Emotional creativity, expressive force",
  "44": "Heavy burden, karmic weight ⚠️",
  "45": "Smart work, flexibility in structure",
  "46": "Financial growth, material stability 💰",
  "47": "Analytical depth, slow success",
  "48": "Hard struggle, delays, pressure ⚠️",
  "49": "Discipline + aggression, forceful progress",
  "55": "Extreme freedom, unpredictability",
  "56": "Change, instability, movement ⚠️",
  "57": "Strategic intelligence, smart planning",
  "58": "Business power, financial ambition",
  "59": "Intelligent action, persuasive communication",
  "66": "Luxury, attraction, comfort",
  "67": "Wisdom, delayed success ⭐",
  "68": "Financial instability, losses ⚠️",
  "69": "Emotional balance, material + heart alignment",
  "77": "Deep spirituality, isolation, inner power",
  "78": "Karmic struggle, hardship ⚠️",
  "79": "Spiritual strength, inner resilience ⭐",
  "88": "Extreme power, heavy karma ⚠️⚡",
  "89": "Aggressive success, power + intensity",
  "99": "Extreme energy, intensity, emotional overload"
};

const GOOD_NUMBERS = ["17", "23", "32", "37", "41", "46", "67", "72", "87", "97"];
const BAD_NUMBERS  = ["16", "26", "29", "43", "54", "56", "64", "68", "78", "86", "98"];

const PLANETARY_RULERS: Record<number, { name: string, energy: string }> = {
  1: { name: "Sun", energy: "Vitality, Leadership, Ego" },
  2: { name: "Moon", energy: "Emotion, Intuition, Sensitivity" },
  3: { name: "Jupiter", energy: "Expansion, Wisdom, Wealth" },
  4: { name: "Rahu", energy: "Innovation, Sudden Change, Ambition" },
  5: { name: "Mercury", energy: "Communication, Intellect, Speed" },
  6: { name: "Venus", energy: "Luxury, Love, Arts, Comfort" },
  7: { name: "Ketu", energy: "Spirituality, Intuition, Mysticism" },
  8: { name: "Saturn", energy: "Discipline, Karma, Longevity" },
  9: { name: "Mars", energy: "Action, Courage, Protection" }
};

const analyzeNumber = (input: string) => {
  const original = input.replace(/\D/g, '');
  const zeroCount = (original.match(/0/g) || []).length;
  const cleaned = original.replace(/0/g, '');
  if (cleaned.length < 2) return null;

  const slidingPairs: string[] = [];
  const normalizedPairs: string[] = [];
  const freqMap: Record<string, number> = {};

  for (let i = 0; i < cleaned.length - 1; i++) {
    const pair = cleaned.slice(i, i + 2);
    slidingPairs.push(pair);
    const norm = pair.split('').sort().join('');
    normalizedPairs.push(norm);
    freqMap[norm] = (freqMap[norm] || 0) + 1;
  }

  let score = 5;
  const interpretations: { pair: string, freq: number, text: string, type: 'good' | 'bad' | 'neutral' }[] = [];

  Object.entries(freqMap).forEach(([pair, freq]) => {
    let type: 'good' | 'bad' | 'neutral' = 'neutral';
    let weight = 0;
    if (GOOD_NUMBERS.includes(pair)) { type = 'good'; weight = 2; }
    else if (BAD_NUMBERS.includes(pair)) { type = 'bad'; weight = -2; }

    score += weight * freq;
    if (type === 'good' && freq >= 2) score += 1;
    if (type === 'bad' && freq >= 2) score -= 1.5;

    interpretations.push({ pair, freq, text: NUMERO_DB[pair] || "General vibration energy", type });
  });

  score -= (zeroCount * 0.8);
  const firstPair = normalizedPairs[0];
  const lastPair  = normalizedPairs[normalizedPairs.length - 1];
  if (GOOD_NUMBERS.includes(firstPair)) score += 1;
  if (GOOD_NUMBERS.includes(lastPair)) score += 1.5;

  const finalScore = Math.max(0, Math.min(10, score));
  let verdict: 'Poor' | 'Average' | 'Strong' | 'Powerful' = 'Average';
  if (finalScore >= 8.5) verdict = 'Powerful';
  else if (finalScore >= 7) verdict = 'Strong';
  else if (finalScore < 4.5) verdict = 'Poor';

  const coreTotal = cleaned.split('').reduce((a, b) => a + parseInt(b), 0);
  const coreVibe = coreTotal > 9 ? (coreTotal % 9 || 9) : coreTotal;
  const corePlanet = PLANETARY_RULERS[coreVibe];

  return { original, cleaned, slidingPairs, normalizedPairs, freqMap, interpretations: interpretations.sort((a,b) => b.freq - a.freq), finalScore: finalScore.toFixed(1), verdict, coreVibe, corePlanet };
};

/* ── UI COMPONENT ─────────────────────────────────────────────── */

const computePersonalNumber = (dob: string) => {
  if (!dob) return 1;
  const day = dob.split('-')[2] || '1';
  const sum = day.split('').reduce((acc, d) => acc + parseInt(d), 0);
  return sum > 9 ? (sum % 9 || 9) : sum;
};

const getNameNumber = (name: string) => {
  const chaldeanMap: Record<string, number> = {
    A:1, I:1, J:1, Q:1, Y:1,
    B:2, K:2, R:2,
    C:3, G:3, L:3, S:3,
    D:4, M:4, T:4,
    E:5, H:5, N:5, X:5,
    U:6, V:6, W:6,
    O:7, Z:7,
    F:8, P:8
  };
  const sum = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((acc, char) => acc + (chaldeanMap[char] || 0), 0);
  return sum > 9 ? (sum % 9 || 9) : sum;
};

const NumerologyPage: React.FC = () => {
  const { numbers } = useNumbers();
  const [mode, setMode] = useState<'find' | 'audit' | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', dob: '', budget: '50000', currentNumber: '' });
  const [results, setResults] = useState<any>(null);

  const handleProcess = () => {
    setTimeout(() => {
      if (mode === 'audit') {
        const analysis = analyzeNumber(formData.currentNumber);
        setResults(analysis);
      } else {
        const psychicNum = computePersonalNumber(formData.dob);
        const nameNum = getNameNumber(formData.name);
        const budgetVal = parseInt(formData.budget) || 100000;

        const suggestions = numbers
          .map(n => {
            const analysis = analyzeNumber(n.phone);
            let resonance = 0;
            if (analysis) {
              const cleaned = n.phone.replace(/\D/g, '');
              const total = cleaned.split('').reduce((a, b) => a + parseInt(b), 0) % 9 || 9;
              if (total === psychicNum) resonance += 2;
              if (total === nameNum) resonance += 1.5;
            }
            return { ...n, analysis, resonance };
          })
          .filter(n => {
            const price = parseInt(n.price.replace(/\D/g, '')) || 0;
            return price <= budgetVal && n.analysis;
          })
          .sort((a, b) => {
            const scoreA = parseFloat(a.analysis!.finalScore) + a.resonance;
            const scoreB = parseFloat(b.analysis!.finalScore) + b.resonance;
            return scoreB - scoreA;
          })
          .slice(0, 4);
        setResults({ suggestions, personal: { psychicNum, nameNum } });
      }
      setStep(3);
    }, 1500);
  };

  const reset = () => {
    setMode(null);
    setStep(1);
    setFormData({ name: '', dob: '', budget: '50000', currentNumber: '' });
    setResults(null);
  };

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100vh' }}>
      
      {/* Header */}
      <section style={{ padding: '80px 0 40px', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', zIndex: 0 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge badge-gold" style={{ marginBottom: 20 }}>Numerology Tools</span>
              <h1 className="text-display-xl" style={{ marginBottom: 16 }}>Numero<span className="text-gradient-gold">AI</span> Engine</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, margin: 0 }}>
                Analyze your personal frequency using our proprietary <b>Chaldean Matrix</b>. Find compatibility, audit your current number, and unlock your material destiny.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="container" style={{ maxWidth: 1000, padding: '60px 20px 120px' }}>
        <AnimatePresence mode="wait">
          
          {!mode && (
            <motion.div key="sel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}
            >
              <SelectionCard onClick={() => setMode('find')} icon={<Star size={32} />} title="Find Best Numbers" description="Scan our entire vault to find numbers that vibrate perfectly with your DOB & Name." />
              <SelectionCard onClick={() => setMode('audit')} icon={<Phone size={32} />} title="Audit My Current Number" description="Detailed Chaldean breakdown of your current number's strengths and instabilities." />
            </motion.div>
          )}

          {mode && step === 1 && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ background: '#FFF', padding: 48, borderRadius: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
                <h2 className="text-display-lg" style={{ fontSize: '1.75rem', margin: 0 }}>{mode === 'find' ? 'Elite Matching' : 'Full Alignment Audit'}</h2>
                <button onClick={reset} style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 700 }}>Back</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <InputWrapper label="Full Name" icon={<User />}>
                  <input className="input-field" placeholder="Rahul Sharma" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </InputWrapper>
                <InputWrapper label="Date of Birth" icon={<Calendar />}>
                  <input className="input-field" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </InputWrapper>
                {mode === 'find' ? (
                  <InputWrapper label="Budget" icon={<CreditCard />}>
                    <select className="input-field" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="50000">Up to ₹50,000</option>
                      <option value="1000000">Ultra Premium</option>
                    </select>
                  </InputWrapper>
                ) : (
                  <InputWrapper label="Mobile Number" icon={<Hash />}>
                    <input className="input-field" placeholder="91XXXXXXXX" value={formData.currentNumber} onChange={e => setFormData({...formData, currentNumber: e.target.value})} />
                  </InputWrapper>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                <button onClick={() => setStep(2)} className="btn-primary btn-large">Continue <ArrowRight size={18} /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="load" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              onAnimationComplete={() => handleProcess()}
              style={{ textAlign: 'center', padding: '100px 0' }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 32 }}>
                <RefreshCw size={56} color="var(--accent-gold)" />
              </motion.div>
              <h2 className="text-display-lg">Calculating Chaldean matrix...</h2>
              <p style={{ color: 'var(--text-tertiary)', marginTop: 12, fontSize: 14 }}>Please wait while we align your vibration.</p>
            </motion.div>
          )}

          {step === 3 && results && (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
               {mode === 'audit' ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, background: '#FFF', padding: 48, borderRadius: 28, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
                       <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: 40 }}>
                          <span className="text-label" style={{ marginBottom: 12, display: 'block' }}>Chaldean Score</span>
                          <div style={{ fontSize: 84, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-gold)', lineHeight: 1 }}>{results.finalScore}</div>
                          <div className="badge badge-gold" style={{ marginTop: 20 }}>{results.verdict}</div>
                       </div>
                       <div>
                          <h3 className="text-display-lg" style={{ fontSize: '1.8rem', marginBottom: 20 }}>Audit Result</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                             <MiniInfo label="Core Planet" val={`${results.corePlanet.name} (№ ${results.coreVibe})`} />
                             <MiniInfo label="Primary Energy" val={results.corePlanet.energy} />
                             <MiniInfo label="Positioning" val="Sliding Pairs" />
                             <MiniInfo label="Frequency" val={results.normalizedPairs.length + " pairs"} />
                          </div>
                       </div>
                    </div>
                    <div style={{ background: '#FFF', borderRadius: 24, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                       <div style={{ background: 'var(--bg-deep)', padding: '16px 32px', borderBottom: '1px solid var(--border-subtle)' }}>
                          <span className="text-label">Energy Map</span>
                       </div>
                       <div style={{ padding: '8px 0' }}>
                          {results.interpretations.map((item: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: i === results.interpretations.length -1 ? 'none' : '1px solid rgba(0,0,0,0.03)' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                  <div style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.pair}</div>
                                  <div>
                                     <div style={{ fontSize: 14, fontWeight: 700 }}>{item.text}</div>
                                     <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.freq > 1 ? `Dominant frequency: ${item.freq}x` : "Neutral influence"}</div>
                                  </div>
                               </div>
                               <div style={{ fontSize: 13, fontWeight: 700, color: item.type === 'good' ? '#059669' : item.type === 'bad' ? '#DC2626' : 'var(--text-muted)' }}>
                                  {item.type === 'good' ? "Success" : item.type === 'bad' ? "Instability" : "Neutral"}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                      <div style={{ background: 'var(--gradient-gold)', padding: 32, borderRadius: 24, color: 'white' }}>
                         <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Psychic Number</span>
                         <div style={{ fontSize: 42, fontWeight: 800 }}>{results.personal.psychicNum}</div>
                         <p style={{ fontSize: 13, margin: '8px 0 0', opacity: 0.9 }}>Your basic nature and character vibration.</p>
                      </div>
                      <div style={{ background: '#1a1713', padding: 32, borderRadius: 24, color: 'white' }}>
                         <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>Destiny Number</span>
                         <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--accent-gold)' }}>{results.personal.nameNum}</div>
                         <p style={{ fontSize: 13, margin: '8px 0 0', opacity: 0.6 }}>Your path, purpose, and social expression.</p>
                      </div>
                   </div>

                   <h3 className="text-display-lg" style={{ fontSize: '1.5rem' }}>Top Resonating Numbers</h3>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                      {results.suggestions.map((num: any, i: number) => (
                        <div key={i} style={{ background: '#FFF', borderRadius: 24, padding: 32, border: num.resonance > 0 ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)', position: 'relative' }}>
                           {num.resonance > 0 && <div style={{ position: 'absolute', top: 16, right: 16 }}><Star size={20} fill="var(--accent-gold)" color="var(--accent-gold)" /></div>}
                           <div className="text-label" style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                              <span>Chaldean Rank: {num.analysis.finalScore}</span>
                              {num.resonance > 0 && <span style={{ color: 'var(--accent-gold)' }}>• High Resonance Match</span>}
                           </div>
                           <h3 className="text-display-lg" style={{ fontSize: '1.9rem', marginBottom: 12, letterSpacing: '0.05em' }}>{num.phone}</h3>
                           <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              <span className="badge" style={{ background: '#f8f7f4' }}>{num.analysis.interpretations[0]?.text.split(',')[0]}</span>
                              <span className="badge" style={{ background: '#f8f7f4' }}>{num.energy}</span>
                           </div>
                           <button className="btn-primary" style={{ width: '100%' }}>Claim Reservation</button>
                        </div>
                      ))}
                   </div>
                </div>
               )}
               <div style={{ textAlign: 'center', marginTop: 64 }}>
                  <button onClick={reset} className="btn-outline">Restart Analysis</button>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
};

/* ── UI HELPERS ────────────────────────────────────────────────── */

const SelectionCard: React.FC<{ onClick: () => void, icon: any, title: string, description: string }> = ({ onClick, icon, title, description }) => (
  <motion.div whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }} onClick={onClick}
    style={{ background: '#FFF', padding: '48px 36px', borderRadius: 28, border: '1px solid var(--border-subtle)', textAlign: 'center', cursor: 'pointer' }}
  >
    <div style={{ color: 'var(--accent-gold)', marginBottom: 24, display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <h3 className="text-display-lg" style={{ fontSize: '1.5rem', marginBottom: 16 }}>{title}</h3>
    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{description}</p>
  </motion.div>
);

const InputWrapper: React.FC<{ label: string, icon: React.ReactElement, children: any }> = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
      {React.cloneElement(icon, { size: 14, color: 'var(--accent-gold)' } as any)}
      {label}
    </label>
    {children}
  </div>
);

const MiniInfo: React.FC<{ label: string, val: any }> = ({ label, val }) => (
  <div>
    <div className="text-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{val}</div>
  </div>
);

export default NumerologyPage;
