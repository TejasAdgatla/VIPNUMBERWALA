import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNumbers } from '../context/NumbersContext';
import type { VIPNumber } from '../context/NumbersContext';
import { Trash2, PenLine, Plus, X, ToggleLeft, ToggleRight, TrendingUp, Users, BarChart3, IndianRupee, Box, Wallet } from 'lucide-react';

const PLANETS = ['Sun', 'Moon', 'Jupiter', 'Rahu', 'Mercury', 'Venus', 'Ketu', 'Saturn', 'Mars'];

const EMPTY_FORM = {
  phone: '', price: '', purchaseCost: 0, numerologyTotal: 1,
  category: '', energy: 'Sun', available: true,
};

const TABS = [
  { id: 'dashboard', label: '📊 Insights' },
  { id: 'inventory', label: '📋 VIP Numbers' },
  { id: 'orders',    label: '📦 Orders' },
  { id: 'settings',  label: '⚙️ Settings' },
];

const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { numbers, categories, addNumber, updateNumber, deleteNumber, refresh: refreshNums } = useNumbers();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<VIPNumber | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [settings, setSettings] = useState({ support_whatsapp: '918090050091' });
  const [stats, setStats] = useState<any>(null);


  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/admin/stats`);
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/settings`);
      if (res.ok) setSettings(await res.json());
    } catch (e) {}
  };

  const saveSettings = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) alert('Settings saved successfully!');
  };

  const openAddForm = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEditForm = (num: VIPNumber) => {
    setEditTarget(num);
    setForm({ 
      phone: num.phone, 
      price: num.price, 
      purchaseCost: num.purchaseCost || 0,
      numerologyTotal: num.numerologyTotal, 
      category: num.category, 
      energy: num.energy, 
      available: num.available 
    });
    setShowForm(true);
  };
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders`);
      if (res.ok) setOrders(await res.json());
    } finally { setLoadingOrders(false); }
  };

  useEffect(() => { 
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'orders') fetchOrders(); 
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const handleOrderAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders/${id}/${action}`, { method: 'POST' });
    if (res.ok) {
      alert(`Order ${action}ed successfully.`);
      fetchOrders();
      refreshNums();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) updateNumber({ ...editTarget, ...form });
    else addNumber(form);
    setShowForm(false);
    setForm(EMPTY_FORM);
  };
  const toggleAvailability = (num: VIPNumber) => updateNumber({ ...num, available: !num.available });
  const [showBulkSync, setShowBulkSync] = useState(false);
  const [bulkJson, setBulkJson] = useState(JSON.stringify({
    upsert: [],
    delete: []
  }, null, 2));
  const [syncResult, setSyncResult] = useState<any>(null);

  const runBulkSync = async () => {
    try {
      const payload = JSON.parse(bulkJson);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/numbers/bulk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSyncResult(data);
      if (!data.errors?.length) setTimeout(() => { setShowBulkSync(false); setSyncResult(null); }, 3000);
    } catch (e) {
      alert('Invalid JSON! Please check your formatting.');
    }
  };

  return (
    <div className="admin-container">

      {/* ── Sidebar ── */}
      <nav className="admin-sidebar">
        <div>
          <div className="admin-logo">VIP<span>Number</span>Wala</div>
          <p className="admin-tagline">Admin Dashboard</p>
          <div className="nav-links">
            {TABS.map(tab => (
              <button key={tab.id} className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <a href="/" target="_blank" className="preview-link">↗ View Live Site</a>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <h1>{TABS.find(t => t.id === activeTab)?.label.replace(/^[^\s]+ /, '') || ''}</h1>
            <p className="admin-sub">
              {activeTab === 'dashboard' ? 'Real-time performance and financial insights' : `${numbers.length} numbers in inventory · ${numbers.filter(n => n.available).length} available`}
            </p>
          </div>
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setShowBulkSync(true)}>
                📦 Bulk Sync
              </button>
              <button className="btn-primary add-btn" onClick={openAddForm}>
                <Plus size={18} /> Add Number
              </button>
            </div>
          )}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && stats && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-grid">
            
            {/* ── Toolbar: Range Selectors & Filters ── */}
            <div className="dashboard-wide-card" style={{ gridColumn: '1 / -1', background: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #f0f0f0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 600, color: '#374151', marginRight: '1rem' }}>⚙️ Analytical Tools:</div>
              <select className="range-selector" style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 28 Days</option>
                <option>This Quarter</option>
                <option>All Time</option>
                <option>Custom Range...</option>
              </select>
              <select className="range-selector" style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                <option>All Categories</option>
                <option>VVIP Numbers</option>
                <option>Royal Numbers</option>
              </select>
              <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>⬇ Export CSV Report</button>
              <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>🖨 Print Summary</button>
            </div>

             {/* Row 1: Core Financials */}
             <div className="stat-card">
                <div className="stat-icon"><IndianRupee size={24} /></div>
                <div className="stat-info">
                   <div className="stat-label">Total Revenue</div>
                   <div className="stat-value">₹{stats.revenue.total.toLocaleString()}</div>
                   <div className="stat-progress">
                     <span style={{color: '#10b981'}}>↑ Today: ₹{stats.revenue.today.toLocaleString()}</span> &nbsp; (7d: ₹{stats.revenue.last7d.toLocaleString()})
                   </div>
                </div>
             </div>
             
             <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}><TrendingUp size={24} /></div>
                <div className="stat-info">
                   <div className="stat-label">Realized Profit</div>
                   <div className="stat-value" style={{ color: '#059669' }}>₹{stats.profit.toLocaleString()}</div>
                   <div className="stat-progress">Margin: {stats.margin.toFixed(1)}%</div>
                </div>
             </div>

             <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><BarChart3 size={24} /></div>
                <div className="stat-info">
                   <div className="stat-label">Avg. Order Value</div>
                   <div className="stat-value">₹{Math.round(stats.aov).toLocaleString()}</div>
                   <div className="stat-progress">{stats.ordersCount} Successful Trans.</div>
                </div>
             </div>

             {/* Row 2: Traffic & Engagement */}
             <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}><Users size={24} /></div>
                <div className="stat-info">
                   <div className="stat-label">Total Site Visitors</div>
                   <div className="stat-value">{stats.visitors?.total?.toLocaleString()}</div>
                   <div className="stat-progress" style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                     <span>📱 {stats.visitors?.mobile} Mobile</span>
                     <span>💻 {stats.visitors?.desktop} Desktop</span>
                   </div>
                </div>
             </div>

             {/* Row 3: Inventory Health (Calculated Live) */}
             <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Box /></div>
                <div className="stat-info">
                   <div className="stat-label">Live Inventory Value</div>
                   <div className="stat-value">
                     ₹{numbers.filter(n => n.available).reduce((acc, num) => acc + parseFloat(num.price.replace(/[^\d.]/g, '') || '0'), 0).toLocaleString()}
                   </div>
                   <div className="stat-progress">Selling value of {numbers.filter(n => n.available).length} numbers</div>
                </div>
             </div>

             <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Wallet /></div>
                <div className="stat-info">
                   <div className="stat-label">Unrealized Potential Profit</div>
                   <div className="stat-value" style={{ color: '#10b981' }}>
                     ₹{numbers.filter(n => n.available).reduce((acc, num) => acc + (parseFloat(num.price.replace(/[^\d.]/g, '') || '0') - (num.purchaseCost || 0)), 0).toLocaleString()}
                   </div>
                   <div className="stat-progress">Once current stock is sold</div>
                </div>
             </div>

             {/* ── Table Matrix: Dedicated Tools ── */}
             
             {/* Tool 1: Recent Transactions */}
             <div className="dashboard-wide-card" style={{ gridColumn: '1 / -1', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #f0f0f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '1.1rem', margin: 0 }}>💰 Financial Ledger (Recent)</h3>
                 <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>View Ledger</button>
               </div>
               <div className="table-wrap">
                 {stats.recentOrders && stats.recentOrders.length > 0 ? (
                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                     <thead>
                       <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left', color: '#6b7280' }}>
                         <th style={{ padding: '0.7rem 0' }}>Date</th>
                         <th>Transaction Amount</th>
                         <th>Status</th>
                       </tr>
                     </thead>
                     <tbody>
                       {stats.recentOrders.map((o: any) => (
                         <tr key={o.number_id + o.created_at} style={{ borderBottom: '1px solid #f3f4f6' }}>
                           <td style={{ padding: '0.7rem 0', fontWeight: 500 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                           <td style={{ color: '#059669', fontWeight: 600 }}>₹{parseFloat(o.paid_amount || '0').toLocaleString()}</td>
                           <td><span className="badge completed">Completed</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <p style={{ color: '#888', fontSize: '0.9rem', padding: '1rem 0' }}>No recent completed orders.</p>
                 )}
               </div>
             </div>

             {/* Tool 2: Category Breakdown Table */}
             <div className="dashboard-wide-card" style={{ gridColumn: '1 / -1', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #f0f0f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '1.1rem', margin: 0 }}>📊 Category Health Matrix</h3>
               </div>
               <div className="table-wrap">
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                   <thead>
                     <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left', color: '#6b7280' }}>
                       <th style={{ padding: '0.7rem 0' }}>Category</th>
                       <th>Total Active Stock</th>
                       <th>Total Value</th>
                       <th>Avg. Profit Margin</th>
                     </tr>
                   </thead>
                   <tbody>
                     {categories.map(cat => {
                       const catNums = numbers.filter(n => n.category === cat && n.available);
                       const val = catNums.reduce((acc, num) => acc + parseFloat(num.price.replace(/[^\d.]/g, '') || '0'), 0);
                       const cost = catNums.reduce((acc, num) => acc + (num.purchaseCost || 0), 0);
                       const margin = val > 0 ? ((val - cost) / val) * 100 : 0;
                       return (
                         <tr key={cat} style={{ borderBottom: '1px solid #f3f4f6' }}>
                           <td style={{ padding: '0.7rem 0', fontWeight: 600 }}>{cat}</td>
                           <td>{catNums.length} numbers</td>
                           <td>₹{val.toLocaleString()}</td>
                           <td style={{ color: margin > 40 ? '#059669' : '#f59e0b' }}>{margin.toFixed(1)}%</td>
                         </tr>
                       )
                     })}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Tool 3: Low Stock / High Value Alerts */}
             <div className="dashboard-wide-card" style={{ gridColumn: '1 / -1', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #f0f0f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🚨 Inventory Alerts (Highest Potential Profit)</h3>
               </div>
               <div className="table-wrap">
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                   <thead>
                     <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left', color: '#6b7280' }}>
                       <th style={{ padding: '0.7rem 0' }}>Number</th>
                       <th>Category</th>
                       <th>Expected Profit</th>
                       <th>Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {numbers
                       .filter(n => n.available)
                       .sort((a, b) => {
                         const pA = parseFloat(a.price.replace(/[^\d.]/g, '') || '0') - (a.purchaseCost || 0);
                         const pB = parseFloat(b.price.replace(/[^\d.]/g, '') || '0') - (b.purchaseCost || 0);
                         return pB - pA;
                       })
                       .slice(0, 5)
                       .map(num => (
                         <tr key={num.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                           <td style={{ padding: '0.7rem 0', fontWeight: 600, fontFamily: 'monospace' }}>{num.phone}</td>
                           <td><span className="cat-chip">{num.category}</span></td>
                           <td style={{ color: '#10b981', fontWeight: 600 }}>
                             ₹{(parseFloat(num.price.replace(/[^\d.]/g, '') || '0') - (num.purchaseCost || 0)).toLocaleString()}
                           </td>
                           <td><button className="btn-outline" style={{fontSize:'0.7rem', padding:'0.2rem 0.5rem'}} onClick={() => window.open(`/?search=${num.phone}`, '_blank')}>Push to Top</button></td>
                         </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

          </motion.div>
        )}

        {/* ── Inventory Tab ── */}
        {activeTab === 'inventory' && (
          <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Number</th><th>Category</th><th>Price</th><th>Numerology</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {numbers.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>No numbers yet. Click "Add Number" to get started.</td></tr>
                  )}
                  {numbers.map(num => (
                    <tr key={num.id} className={!num.available ? 'row-dimmed' : ''}>
                      <td className="td-phone">{num.phone}</td>
                      <td><span className="cat-chip">{num.category}</span></td>
                      <td className="td-price">{num.price}</td>
                      <td>
                        <span className="num-chip">No.{num.numerologyTotal}</span>
                        <span className="planet-chip">{num.energy}</span>
                      </td>
                      <td>
                        <button className={`toggle-btn ${num.available ? 'on' : 'off'}`} onClick={() => toggleAvailability(num)}>
                          {num.available ? <><ToggleRight size={16} /> Live</> : <><ToggleLeft size={16} /> Hidden</>}
                        </button>
                      </td>
                      <td className="td-actions">
                        <button className="icon-btn edit" onClick={() => openEditForm(num)} title="Edit"><PenLine size={15} /></button>
                        <button className="icon-btn del" onClick={() => deleteNumber(num.id)} title="Delete"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Number</th><th>Price</th><th>Phone</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading Orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>No active orders found in database.</td></tr>
                  ) : orders.map(ord => (
                    <tr key={ord.id}>
                      <td><div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{ord.id.slice(0,8)}...</div></td>
                      <td className="td-phone">{ord.vip_numbers?.phone || 'Loading...'}</td>
                      <td className="td-price">{ord.amount || ord.vip_numbers?.price}</td>
                      <td>{ord.customer_phone}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className={`badge ${ord.status}`}>{ord.status.replace(/_/g, ' ')}</span>
                          
                          {ord.status === 'awaiting_reconciliation' && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn-primary" onClick={() => handleOrderAction(ord.id, 'approve')} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#059669' }}>Verify</button>
                              <button className="btn-outline" onClick={() => handleOrderAction(ord.id, 'reject')} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', color: '#dc2626', borderColor: '#dc2626' }}>Reject</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="settings-card">
              <h3>Site Configuration</h3>
              <div className="settings-form">
                <div className="field-group">
                   <label>Support WhatsApp Number</label>
                   <input type="text" value={settings.support_whatsapp} onChange={e => setSettings(s => ({ ...s, support_whatsapp: e.target.value }))} placeholder="91XXXXXXXXXX (Include Country Code)" />
                   <p style={{ fontSize: 11, color: '#888' }}>This number will be used for all "Chat on WhatsApp" buttons.</p>
                </div>
                <div className="field-group"><label>Brand Name</label><input type="text" defaultValue="VIPNumberWala" /></div>
                <div className="field-group"><label>UPI ID</label><input type="text" defaultValue="vipnumberwala@upi" /></div>
                <button className="btn-primary" onClick={saveSettings}>Save Changes</button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showBulkSync && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" style={{ maxWidth: '640px' }} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <div className="modal-header">
                <h2>📦 Bulk Inventory Sync</h2>
                <button className="modal-close" onClick={() => setShowBulkSync(false)}><X size={20} /></button>
              </div>
              <p className="modal-sub">Paste your JSON data below. This will **Upsert** (Add/Update) and **Delete** specific numbers.</p>
              
              <textarea 
                className="bulk-textarea"
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
                rows={12}
                spellCheck={false}
              />

              {syncResult && (
                <div className={`sync-feedback ${syncResult.errors?.length ? 'err' : 'ok'}`}>
                  {syncResult.errors?.length ? '❌ Errors found!' : '✅ Sync successful!'}
                  <div className="sync-stats">
                    <span>Upserted: {syncResult.upserted}</span>
                    <span>Deleted: {syncResult.deleted}</span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setShowBulkSync(false)}>Cancel</button>
                <button className="btn-primary" onClick={runBulkSync}>▶️ Run Daily Sync</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <motion.div className="modal-box" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div className="modal-header">
                <h2>{editTarget ? 'Edit Number' : 'Add New Number'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="field-group">
                  <label>Phone Number *</label>
                  <input type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-row">
                    <div className="field-group">
                      <label>Selling Price (Display)</label>
                      <input type="text" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹50,000" required />
                    </div>
                    <div className="field-group">
                      <label>Purchase Cost (Calculations)</label>
                      <input type="number" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: parseFloat(e.target.value) })} placeholder="Actual cost" required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Chaldean Number (1–9)</label>
                    <input type="number" min={1} max={9} value={form.numerologyTotal} onChange={e => setForm(f => ({ ...f, numerologyTotal: Number(e.target.value) }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>Category (Type or Select)</label>
                    <input 
                      list="category-list"
                      placeholder="e.g. VVIP Triple"
                      value={form.category} 
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      required
                    />
                    <datalist id="category-list">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div className="field-group">
                  <label>Planetary Energy</label>
                  <select value={form.energy} onChange={e => setForm(f => ({ ...f, energy: e.target.value }))}>
                    {PLANETS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                    Show on storefront (Available)
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Add Number'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-container { display: flex; flex-direction: column; min-height: 100vh; background: #f8f7f4; font-family: var(--font-sans); }
        @media (min-width: 768px) { .admin-container { flex-direction: row; } }

        .admin-sidebar { width: 100%; flex-shrink: 0; background: #1a1713; color: #fff; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        @media (min-width: 768px) { .admin-sidebar { width: 220px; padding: 2rem 1.25rem; justify-content: space-between; } }
        
        .admin-logo { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.25rem; }
        .admin-logo span { color: var(--accent-color); }
        .admin-tagline { font-size: 0.72rem; opacity: 0.45; margin-bottom: 1rem; }
        @media (min-width: 768px) { .admin-tagline { margin-bottom: 2rem; } }
        
        .nav-links { display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.4rem; }
        @media (min-width: 768px) { .nav-links { flex-direction: column; } }
        
        .nav-btn { text-align: left; padding: 0.7rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: rgba(255,255,255,0.55); transition: var(--transition-smooth); background: transparent; }
        .nav-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .nav-btn.active { background: var(--accent-color); color: white; }
        .preview-link { font-size: 0.78rem; opacity: 0.45; padding: 0.4rem 1rem; display: inline-block; transition: opacity 0.2s; }
        .preview-link:hover { opacity: 1; color: var(--accent-color); }

        .admin-main { flex: 1; padding: 1.5rem; width: 100%; overflow-x: hidden; }
        @media (min-width: 768px) { .admin-main { padding: 2.5rem 3rem; } }
        
        .admin-topbar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        @media (min-width: 640px) { .admin-topbar { flex-direction: row; justify-content: space-between; align-items: flex-start; } }
        
        .admin-topbar h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .admin-sub { font-size: 0.82rem; color: #999; }
        .add-btn { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; white-space: nowrap; }

        .table-wrap { background: white; border-radius: var(--radius-md); overflow-x: auto; box-shadow: var(--shadow-sm); width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #f8f7f4; }
        th { padding: 0.85rem 1.25rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 600; }
        td { padding: 1rem 1.25rem; border-top: 1px solid #f0f0f0; font-size: 0.88rem; vertical-align: middle; }
        .row-dimmed td { opacity: 0.4; }
        .td-phone { font-weight: 700; font-family: var(--font-serif); font-size: 0.98rem; }
        .td-price { font-weight: 700; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; border-radius: var(--radius-md); padding: 1.5rem; display: flex; align-items: flex-start; gap: 1.25rem; box-shadow: var(--shadow-sm); border: 1px solid #f0f0f0; transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .stat-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(230,81,0,0.1); color: var(--accent-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-info { flex: 1; }
        .stat-label { font-size: 0.85rem; font-weight: 600; color: #6b7280; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 1.65rem; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 0.4rem; font-family: var(--font-sans); }
        .stat-progress { font-size: 0.78rem; font-weight: 500; color: #9ca3af; }

        .td-actions { display: flex; gap: 0.5rem; }
        .cat-chip { font-size: 0.72rem; background: var(--secondary-bg); padding: 0.2rem 0.55rem; border-radius: 99px; }
        .num-chip { font-size: 0.7rem; background: var(--accent-color); color: white; padding: 0.18rem 0.5rem; border-radius: 99px; margin-right: 0.3rem; }
        .planet-chip { font-size: 0.7rem; background: #eee; color: #555; padding: 0.18rem 0.5rem; border-radius: 99px; }
        .badge { font-size: 0.72rem; padding: 0.28rem 0.65rem; border-radius: 99px; font-weight: 600; }
        .badge.pending { background: #fef3c7; color: #92400e; }
        .badge.awaiting_reconciliation { background: #dbeafe; color: #1e40af; }
        .badge.completed { background: #d1fae5; color: #065f46; }
        .badge.rejected { background: #fee2e2; color: #b91c1c; }
        .toggle-btn { display: flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 600; padding: 0.28rem 0.6rem; border-radius: 99px; transition: var(--transition-smooth); }
        .toggle-btn.on { background: #d1fae5; color: #065f46; }
        .toggle-btn.off { background: #f3f4f6; color: #9ca3af; }
        .icon-btn { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: var(--transition-smooth); }
        .icon-btn.edit { background: #eff6ff; color: #2563eb; }
        .icon-btn.edit:hover { background: #2563eb; color: white; }
        .icon-btn.del { background: #fef2f2; color: #dc2626; }
        .icon-btn.del:hover { background: #dc2626; color: white; }

        .settings-card { background: white; border-radius: var(--radius-md); padding: 2.5rem; max-width: 560px; box-shadow: var(--shadow-sm); }
        .settings-card h3 { font-size: 1.2rem; margin-bottom: 2rem; font-family: var(--font-sans); }
        .settings-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .field-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
        .field-group input, .field-group select, .field-group textarea { padding: 0.7rem 0.9rem; border: 1.5px solid #e0e0e0; border-radius: var(--radius-sm); font-family: var(--font-sans); font-size: 0.92rem; transition: border-color 0.2s; }
        .field-group input:focus, .field-group select:focus, .field-group textarea:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(230,81,0,0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; }
        .checkbox-group input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--accent-color); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-box { background: white; border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 520px; box-shadow: 0 25px 60px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-header h2 { font-size: 1.4rem; }
        .modal-close { color: #888; transition: color 0.2s; }
        .modal-close:hover { color: var(--text-color); }
        .modal-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; border-top: 1px solid #f0f0f0; padding-top: 1.25rem; }

        .bulk-textarea { width: 100%; font-family: monospace; font-size: 0.85rem; padding: 1rem; background: #1a1713; color: #10b981; border-radius: 8px; border: none; outline: none; transition: 0.2s; }
        .bulk-textarea:focus { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
        .sync-feedback { margin-top: 1.5rem; padding: 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
        .sync-feedback.ok { background: #ecfdf5; color: #065f46; }
        .sync-feedback.err { background: #fef2f2; color: #991b1b; }
        .sync-stats { display: flex; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.8rem; font-weight: 400; opacity: 0.8; }
      `}</style>
    </div>
  );
};

export default AdminPortal;
