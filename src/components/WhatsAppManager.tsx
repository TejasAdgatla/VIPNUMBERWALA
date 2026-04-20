import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RefreshCw, Wifi, WifiOff, Loader, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = API.replace('http', 'ws'); // Automatically match protocol and host

interface Instance {
  id: string;
  name: string;
  status: 'initializing' | 'waiting_scan' | 'authenticated' | 'connected' | 'disconnected' | 'error';
  phone: string | null;
  qr?: string | null;
}

const STATUS_CONFIG = {
  initializing: { label: 'Initializing…', color: '#f59e0b', icon: <Loader size={14} className="spin" /> },
  waiting_scan:  { label: 'Scan QR Code', color: '#3b82f6', icon: <RefreshCw size={14} /> },
  authenticated: { label: 'Logging in…', color: '#10b981', icon: <Loader size={14} className="spin" /> },
  connected:     { label: 'Connected', color: '#22c55e', icon: <CheckCircle size={14} /> },
  needs_auth:    { label: 'Security Check', color: '#f97316', icon: <ShieldCheck size={14} /> },
  disconnected:  { label: 'Disconnected', color: '#9ca3af', icon: <WifiOff size={14} /> },
  error:         { label: 'Error', color: '#ef4444', icon: <AlertCircle size={14} /> },
};

export const WhatsAppManager: React.FC = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [serverOnline, setServerOnline] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mountedRef = useRef(true);

  // ── WebSocket connection (StrictMode-safe, auto-reconnect) ────────
  const connectWS = useCallback(() => {
    if (!mountedRef.current) return;
    // Don't open a second connection if one is already connecting/open
    if (wsRef.current && wsRef.current.readyState < 2) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setServerOnline(true);
      if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
    };

    ws.onmessage = (e) => {
      if (!mountedRef.current) return;
      const msg = JSON.parse(e.data);
      console.log('📡 WS Message:', msg);

      if (msg.type === 'init') {
        setInstances(msg.instances || []);
      } else if (msg.type === 'instance_update') {
        setInstances(prev => {
          const exists = prev.find(i => i.id === msg.instance.id);
          if (exists) return prev.map(i => i.id === msg.instance.id ? { ...i, ...msg.instance } : i);
          return [...prev, msg.instance];
        });
      } else if (msg.type === 'qr') {
        setInstances(prev => prev.map(i => i.id === msg.id ? { ...i, qr: msg.qr, status: 'waiting_scan' } : i));
      } else if (msg.type === 'qr_clear') {
        setInstances(prev => prev.map(i => i.id === msg.id ? { ...i, qr: null } : i));
      } else if (msg.type === 'instance_removed') {
        setInstances(prev => prev.filter(i => i.id !== msg.id));
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;        // intentional teardown — don't reconnect
      setServerOnline(false);
      reconnectTimer.current = setTimeout(connectWS, 3000);
    };

    ws.onerror = () => {
      // onerror always fires before onclose — just let onclose handle reconnect
      if (!mountedRef.current) return;
      setServerOnline(false);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connectWS();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      // Null out onclose BEFORE close() so the reconnect loop doesn't fire
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
    };
  }, [connectWS]);

  // ── API actions ─────────────────────────────────────────────────────
  const addInstance = async () => {
    if (!newName.trim()) return;
    try {
      await fetch(`${API}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName('');
      setAddingNew(false);
    } catch (e) {
      alert('Could not reach server. Is node index.js running?');
    }
  };

  const removeInstance = async (id: string) => {
    if (!confirm('Disconnect and remove this WhatsApp instance?')) return;
    await fetch(`${API}/instances/${id}`, { method: 'DELETE' });
  };

  const repairInstance = async (id: string) => {
    try {
      await fetch(`${API}/instances/${id}/repair`, { method: 'POST' });
    } catch (e) {
      alert('Failed to trigger repair. Server might be restarting.');
    }
  };

  return (
    <div className="wam-wrap">
      {/* Header */}
      <div className="wam-topbar">
        <div>
          <h2 className="wam-title">WhatsApp Instances</h2>
          <div className={`server-status ${serverOnline ? 'online' : 'offline'}`}>
            {serverOnline ? <><Wifi size={13} /> Server Online</> : <><WifiOff size={13} /> Server Offline — run <code>node server/index.js</code></>}
          </div>
        </div>
        <button className="btn-primary add-inst-btn" onClick={() => setAddingNew(true)} disabled={!serverOnline}>
          <Plus size={16} /> Add Number
        </button>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {addingNew && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setAddingNew(false); }}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <h3>Add WhatsApp Instance</h3>
              <p className="modal-sub">Give this instance a name (e.g. "Sales Number", "Support Line").</p>
              <input
                type="text"
                className="inst-input"
                placeholder="e.g. Sales Number"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInstance()}
                autoFocus
              />
              <div className="modal-footer">
                <button className="btn-outline" onClick={() => setAddingNew(false)}>Cancel</button>
                <button className="btn-primary" onClick={addInstance} disabled={!newName.trim()}>
                  Connect →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instance cards */}
      {instances.length === 0 ? (
        <div className="empty-inst">
          <div className="empty-icon">📱</div>
          <h3>No WhatsApp Instances</h3>
          <p>Click "Add Number" to link your first WhatsApp account.<br />A QR code will appear here for you to scan.</p>
        </div>
      ) : (
        <div className="inst-grid">
          {instances.map(inst => {
            const cfg = (STATUS_CONFIG as any)[inst.status] || STATUS_CONFIG.disconnected;
            return (
              <motion.div key={inst.id} className="inst-card" layout
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                {/* Card header */}
                <div className="inst-card-header">
                  <div>
                    <div className="inst-name">{inst.name}</div>
                    {inst.phone && <div className="inst-phone">{inst.phone}</div>}
                  </div>
                  <div className="inst-actions-row">
                    <div className="status-pill" style={{ background: cfg.color + '20', color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </div>
                    <button className="icon-btn del" onClick={() => removeInstance(inst.id)} title="Remove instance">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                {/* Needs Auth / Passkey State */}
                {inst.status === 'needs_auth' && (
                  <div className="error-banner" style={{ border: '1px solid #f97316', background: '#fff7ed', color: '#9a3412', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ShieldCheck size={20} color="#f97316" />
                      <strong style={{ fontSize: '0.9rem' }}>Security Check Required</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8, lineHeight: 1.4 }}>WhatsApp is asking for a security check. We need to open the browser temporarily to solve it.</p>
                    <button className="btn-primary" onClick={() => repairInstance(inst.id)} style={{ width: '100%', background: '#f97316', border: 'none', height: '36px', fontSize: '0.8rem' }}>
                      Solve Security Check
                    </button>
                  </div>
                )}

                {/* QR Code */}
                {inst.status === 'waiting_scan' && inst.qr && (
                  <motion.div className="qr-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="qr-label">Open WhatsApp → Linked Devices → Scan</p>
                    <img src={inst.qr} alt="QR Code" className="qr-img" />
                    <p className="qr-hint">QR refreshes automatically every ~20 seconds</p>
                  </motion.div>
                )}

                {/* Connected state */}
                {inst.status === 'connected' && (
                  <div className="connected-banner">
                    <CheckCircle size={20} color="#22c55e" />
                    <span>Active & Receiving Messages</span>
                  </div>
                )}

                {/* Authenticated state */}
                {inst.status === 'authenticated' && (
                  <div className="init-banner" style={{ background: '#ecfdf5', color: '#065f46' }}>
                    <div className="loader-ring" style={{ borderTopColor: '#10b981' }} />
                    <span>Scan successful! Finalizing connection…</span>
                  </div>
                )}

                {/* Initializing */}
                {inst.status === 'initializing' && (
                  <div className="init-banner">
                    <div className="loader-ring" />
                    <span>Starting browser — QR code will appear shortly…</span>
                  </div>
                )}

                {/* Error */}
                {inst.status === 'error' && (
                  <div className="error-banner">
                    <AlertCircle size={18} color="#ef4444" />
                    <span>Failed to start. Check that Chrome is installed on this machine.</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`
        .wam-wrap { padding: 0; }
        .wam-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .wam-title { font-size: 1.75rem; margin-bottom: 0.4rem; }
        .server-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; }
        .server-status.online { color: #22c55e; }
        .server-status.offline { color: #ef4444; }
        .server-status code { background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; }
        .add-inst-btn { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }

        /* Empty */
        .empty-inst { text-align: center; padding: 4rem 2rem; color: #888; background: white; border-radius: var(--radius-md); }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-inst h3 { font-size: 1.2rem; color: var(--text-color); margin-bottom: 0.5rem; font-family: var(--font-sans); }
        .empty-inst p { font-size: 0.9rem; line-height: 1.6; }

        /* Grid */
        .inst-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }

        /* Card */
        .inst-card { background: white; border-radius: var(--radius-md); padding: 1.75rem; box-shadow: var(--shadow-sm); border: 1px solid #f0f0f0; }
        .inst-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 1rem; }
        .inst-name { font-weight: 700; font-size: 1.05rem; color: var(--text-color); }
        .inst-phone { font-size: 0.85rem; color: #22c55e; font-weight: 600; margin-top: 0.25rem; }
        .inst-actions-row { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .status-pill { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 99px; white-space: nowrap; }

        /* QR */
        .qr-section { text-align: center; }
        .qr-label { font-size: 0.82rem; color: #555; margin-bottom: 1rem; }
        .qr-img { border-radius: var(--radius-sm); border: 3px solid #e8e8e8; display: block; margin: 0 auto; max-width: 220px; width: 100%; }
        .qr-hint { font-size: 0.75rem; color: #aaa; margin-top: 0.75rem; }

        /* States */
        .connected-banner { display: flex; align-items: center; gap: 0.6rem; background: #f0fdf4; border-radius: var(--radius-sm); padding: 0.9rem 1rem; font-size: 0.9rem; color: #166534; font-weight: 500; }
        .init-banner { display: flex; align-items: center; gap: 0.75rem; background: #fffbeb; border-radius: var(--radius-sm); padding: 0.9rem 1rem; font-size: 0.85rem; color: #92400e; }
        .error-banner { display: flex; align-items: center; gap: 0.6rem; background: #fef2f2; border-radius: var(--radius-sm); padding: 0.9rem 1rem; font-size: 0.85rem; color: #991b1b; }

        /* Loader ring */
        .loader-ring { width: 20px; height: 20px; border: 2px solid #f59e0b40; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-box { background: white; border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 440px; box-shadow: 0 25px 60px rgba(0,0,0,0.2); }
        .modal-box h3 { font-size: 1.4rem; margin-bottom: 0.5rem; }
        .modal-sub { font-size: 0.9rem; color: #666; margin-bottom: 1.5rem; }
        .inst-input { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid #e0e0e0; border-radius: var(--radius-sm); font-family: var(--font-sans); font-size: 1rem; margin-bottom: 1.5rem; transition: border-color 0.2s; }
        .inst-input:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(230,81,0,0.1); }
        .modal-footer { display: flex; gap: 0.75rem; justify-content: flex-end; }

        /* Icon buttons */
        .icon-btn { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: var(--transition-smooth); }
        .icon-btn.del { background: #fef2f2; color: #dc2626; }
        .icon-btn.del:hover { background: #dc2626; color: white; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default WhatsAppManager;
