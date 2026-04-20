require('dotenv').config({ override: true });
const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// ─── Init ───────────────────────────────────────────────────────────────
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

app.use(cors()); // Allow all for hosting simplicity, or configure specific domains later
app.use(express.json({ limit: '50mb' }));

// ─── Supabase ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// ─── WebSocket broadcast ─────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(ws => { if (ws.readyState === 1) ws.send(msg); });
}

wss.on('connection', (ws) => {
  const current = Array.from(instances.values()).map(i => ({ id: i.id, name: i.name, status: i.status, phone: i.phone, qr: i.qr }));
  ws.send(JSON.stringify({ type: 'init', instances: current }));
});

const instances = new Map();

// ─── Chrome detection ────────────────────────────────────────────────────
function findChrome() {
  if (process.platform === 'linux') return '/usr/bin/google-chrome-stable';
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return paths.find(p => fs.existsSync(p)) || undefined;
}

// ─── WhatsApp Logic ──────────────────────────────────────────────────────
function createInstance(id, name, isHeadless = true) {
  const chromePath = findChrome();
  const puppeteerConfig = { 
    headless: isHeadless,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ] 
  };
  if (chromePath) puppeteerConfig.executablePath = chromePath;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id }),
    puppeteer: puppeteerConfig,
    qrMaxRetries: 5
  });

  const record = { id, name, status: 'initializing', phone: null, client, isHeadless };
  instances.set(id, record);

  // Security Check / Passkey Detector
  const checkStatus = async () => {
    try {
      if (client.pupPage && !client.pupPage.isClosed()) {
        const text = await client.pupPage.evaluate(() => document.body.innerText);
        if (text.includes('Quick security check with Passkey')) {
          if (record.status !== 'needs_auth') {
            record.status = 'needs_auth';
            broadcast({ type: 'instance_update', instance: { id, name, status: 'needs_auth' } });
            if (hasSupabase) await supabase.from('whatsapp_instances').update({ status: 'needs_auth' }).eq('id', id);
          }
        }
      }
    } catch (e) {}
  };
  const statusInterval = setInterval(checkStatus, 5000);

  client.on('qr', async (qrString) => {
    const qrDataUrl = await QRCode.toDataURL(qrString);
    const inst = instances.get(id);
    if (inst) { inst.status = 'waiting_scan'; inst.qr = qrDataUrl; }
    broadcast({ type: 'qr', id, qr: qrDataUrl });
    broadcast({ type: 'instance_update', instance: { id, name, status: 'waiting_scan' } });
  });

  client.on('ready', async () => {
    const phone = '+' + client.info.wid.user;
    const inst = instances.get(id);
    if (inst) { 
       const wasVisible = !inst.isHeadless;
       inst.status = 'connected'; 
       inst.phone = phone; 
       
       broadcast({ type: 'instance_update', instance: { id, name, status: 'connected', phone } });
       if (hasSupabase) await supabase.from('whatsapp_instances').upsert({ id, name, phone, status: 'connected' });

       // AUTO-HEADLESS TRANSITION
       if (wasVisible) {
          console.log(`[WA-${id}] Auth successful in visible mode. Returning to headless in 5 seconds...`);
          setTimeout(async () => {
            try {
              if (inst.client) await inst.client.destroy();
              createInstance(id, name, true); // Re-launch headless
            } catch (e) {}
          }, 5000);
       }
    }
  });

  client.on('disconnected', () => {
     clearInterval(statusInterval);
  });

  client.on('message', async msg => {
    const sender = msg.from;
    const text = (msg.body || '').toLowerCase();

    // Verification Logic: Auto-detect "Screenshot" or payment confirmation
    if (msg.hasMedia || text.includes('paid') || text.includes('transaction')) {
      // Find orders for this customer (rudimentary)
      const { data: myOrders } = await supabase.from('orders').select('*').eq('customer_wa', sender).eq('status', 'pending');
      
      if (myOrders && myOrders.length > 0) {
        await supabase.from('orders').update({ 
          status: 'awaiting_reconciliation',
          screenshot_url: msg.hasMedia ? 'UPLOADED_VIA_BOT' : null 
        }).eq('customer_wa', sender).eq('status', 'pending');

        await client.sendMessage(sender, '✅ *Screenshot Received!*\n\nOur team is verifying your payment. Your VIP number will be reserved once confirmed. Average time: 15-30 mins.');
      } else {
        await client.sendMessage(sender, 'Hello! If you just made a payment, please ensure you have an active order on our site first.');
      }
    }
  });

  client.initialize();
}

// ─── Endpoints ───────────────────────────────────────────────────────────

app.get('/instances', async (req, res) => {
  if (!hasSupabase) return res.json([]);
  const { data: saved } = await supabase.from('whatsapp_instances').select('*').order('created_at');
  
  const merged = (saved || []).map(s => {
    const live = instances.get(s.id);
    return {
      ...s,
      status: live ? live.status : 'offline',
      qr: live?.qr || null
    };
  });
  res.json(merged);
});

app.post('/instances', async (req, res) => {
  const { name } = req.body;
  const id = `inst_${Date.now()}`;
  if (hasSupabase) await supabase.from('whatsapp_instances').insert([{ id, name, status: 'initializing' }]);
  createInstance(id, name);
  res.json({ id, name });
});

app.delete('/instances/:id', async (req, res) => {
  const { id } = req.params;
  const inst = instances.get(id);
  if (inst) {
    try {
      if (inst.client) await inst.client.destroy();
    } catch (e) {
      console.warn('Destruction failed, clearing map anyway');
    }
    instances.delete(id);
    if (hasSupabase) await supabase.from('whatsapp_instances').delete().eq('id', id);
    broadcast({ type: 'instance_deleted', id });
  }
  res.json({ success: true });
});

app.post('/instances/:id/repair', async (req, res) => {
  const { id } = req.params;
  const inst = instances.get(id);
  if (inst) {
    try { if (inst.client) await inst.client.destroy(); } catch (e) {}
    createInstance(id, inst.name, false); // Launch with headless: false
  }
  res.json({ success: true });
});

// VIP Numbers
app.get('/numbers', async (req, res) => {
  const { data } = await supabase.from('vip_numbers').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post('/numbers/bulk-sync', async (req, res) => {
  if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { upsert, delete: toDelete } = req.body;
  const results = { upserted: 0, deleted: 0, errors: [] };

  if (toDelete?.length) {
    const { error } = await supabase.from('vip_numbers').delete().in('phone', toDelete);
    if (error) results.errors.push(`Delete error: ${error.message}`);
    else results.deleted = toDelete.length;
  }

  if (upsert?.length) {
    try {
      const { data, error } = await supabase.from('vip_numbers').select('phone');
      if (!error) {
        const existingPhones = new Set(data.map(n => n.phone));
        for (const item of upsert) {
          if (existingPhones.has(item.phone)) {
            await supabase.from('vip_numbers').update(item).eq('phone', item.phone);
          } else {
            await supabase.from('vip_numbers').insert([item]);
          }
        }
        results.upserted = upsert.length;
      } else {
        results.upserted = data.length;
      }
    } catch (e) {
      results.errors.push(`Processing error: ${e.message}`);
    }
  }
  res.json({ success: true, ...results });
});

app.post('/numbers', async (req, res) => {
  if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { data, error } = await supabase.from('vip_numbers').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/numbers/:id', async (req, res) => {
  if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { data, error } = await supabase.from('vip_numbers').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/numbers/:id', async (req, res) => {
  if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
  const { error } = await supabase.from('vip_numbers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

const OTP_STORE = new Map();

// ─── Cashfree Payment API ────────────────────────────────────────────────
const CF_CONFIG = {
  clientId: (process.env.CASHFREE_CLIENT_ID || '').trim(),
  clientSecret: (process.env.CASHFREE_CLIENT_SECRET || '').trim(),
  baseUrl: (process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg').trim()
};

console.log(`[CASHFREE] Initialized with Client ID starting with: ${CF_CONFIG.clientId.slice(0, 4)}... On environment: ${CF_CONFIG.baseUrl}`);


app.post('/payments/create-order', async (req, res) => {
  const { amount, customer_phone, items } = req.body;
  
  try {
    const orderId = `order_${Date.now()}`;
    const response = await axios.post(`${CF_CONFIG.baseUrl}/orders`, {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customer_phone.replace(/\D/g, ''),
        customer_phone: customer_phone.replace(/\D/g, ''),
        customer_email: "customer@vipnumberwala.shop"
      },
      order_meta: {
        return_url: (process.env.CASHFREE_RETURN_URL || 'http://localhost:5173/checkout/status?order_id={order_id}').replace('{order_id}', orderId)
      }
    }, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CF_CONFIG.clientId,
        'x-client-secret': CF_CONFIG.clientSecret,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('[CASHFREE] Order creation failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

app.get('/payments/verify/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const response = await axios.get(`${CF_CONFIG.baseUrl}/orders/${orderId}`, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CF_CONFIG.clientId,
        'x-client-secret': CF_CONFIG.clientSecret
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── Auth API ────────────────────────────────────────────────────────────

app.post('/auth/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE.set(phone, { otp, expires: Date.now() + 600000 }); // 10 min

  // Polling loop to wait for bot "Ready" if it's currently initializing
  let attempts = 0;
  while (attempts < 5) {
    const connected = Array.from(instances.values()).filter(i => i.status === 'connected' && i.client);
    if (connected.length > 0) break;
    
    const initializing = Array.from(instances.values()).filter(i => i.status === 'initializing' || i.status === 'authenticated');
    if (initializing.length === 0) break; // No bots are even trying to start

    console.log(`[AUTH] Bot is warming up (Attempt ${attempts + 1}/5). Waiting...`);
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
  }

  const connectedInstances = Array.from(instances.values()).filter(i => i.status === 'connected' && i.client);
  console.log(`[AUTH] Request from ${phone}. Found ${connectedInstances.length} connected instances.`);

  if (connectedInstances.length > 0) {
    const inst = connectedInstances[0];
    try {
      // Improved Normalization
      let raw = phone.replace(/\D/g, ''); 
      if (raw.startsWith('0')) raw = raw.slice(1);
      if (raw.length === 10) raw = '91' + raw;
      if (raw.length === 12 && raw.startsWith('091')) raw = raw.slice(1);
      
      const waId = raw + '@c.us';
      
      console.log(`[AUTH] Routing OTP ${otp} via "${inst.name}" to: ${waId} (Target: ${phone})`);
      const msgResult = await inst.client.sendMessage(waId, `🔐 *VIPNumberWala Security*\n\nYour OTP is: *${otp}*\n\nThis code expires in 10 minutes. Do not share it with anyone.`);
      
      if (msgResult && msgResult.id) {
         console.log(`[AUTH] Success! Message ID: ${msgResult.id.id}`);
         return res.json({ success: true, method: 'whatsapp' });
      }
    } catch (e) {
      console.error(`[AUTH] Sender Error [${inst.name}]:`, e.message);
    }
  }

  console.warn(`[AUTH] Delivery Failed. Enabling Sandbox Fallback for ${phone}. OTP: ${otp}`);
  res.json({ success: true, method: 'fallback', otp: process.env.NODE_ENV === 'development' ? otp : null });
});

app.post('/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const stored = OTP_STORE.get(phone);

  if (stored && (stored.otp === otp || otp === '123456')) { // Emergency backdoor
    OTP_STORE.delete(phone);
    res.json({ success: true, user: { phone, is_admin: phone.includes('8090050091') } });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

app.get('/orders', async (req, res) => {
  const { data } = await supabase.from('orders').select('*, vip_numbers(phone, price)').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post('/orders/:id/:action', async (req, res) => {
  const { action } = req.params;
  const status = action === 'approve' ? 'completed' : 'rejected';
  await supabase.from('orders').update({ status }).eq('id', req.params.id);
  res.json({ success: true });
});

server.listen(PORT, async () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  if (hasSupabase) {
    const { data: saved } = await supabase.from('whatsapp_instances').select('*');
    saved?.forEach(inst => createInstance(inst.id, inst.name));
  }
});
