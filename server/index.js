require('dotenv').config({ override: true });
const express = require('express');
const { createServer } = require('http');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// ─── Init ───────────────────────────────────────────────────────────────
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── Supabase ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// ─── Settings Logic ──────────────────────────────────────────────────────
let SUPPORT_WHATSAPP = '918090050091'; // Default

async function loadSettings() {
  if (hasSupabase) {
    const { data } = await supabase.from('settings').select('*').eq('key', 'support_whatsapp').single();
    if (data) SUPPORT_WHATSAPP = data.value;
  }
}
loadSettings();

// ─── Endpoints ───────────────────────────────────────────────────────────

// Settings API
app.get('/settings', async (req, res) => {
  res.json({ support_whatsapp: SUPPORT_WHATSAPP });
});

app.post('/settings', async (req, res) => {
  const { support_whatsapp } = req.body;
  if (support_whatsapp) {
    SUPPORT_WHATSAPP = support_whatsapp;
    if (hasSupabase) {
      await supabase.from('settings').upsert({ key: 'support_whatsapp', value: support_whatsapp });
    }
    res.json({ success: true, support_whatsapp });
  } else {
    res.status(400).json({ error: 'Missing support_whatsapp' });
  }
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
    const { data, error } = await supabase.from('vip_numbers').delete().in('phone', toDelete).select('phone');
    if (error) results.errors.push(`Delete error: ${error.message}`);
    else results.deleted = data ? data.length : 0;
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
      }
    } catch (e) {
      results.errors.push(`Processing error: ${e.message}`);
    }
  }
  res.json({ success: true, ...results });
});

app.post('/numbers', async (req, res) => {
  const { data, error } = await supabase.from('vip_numbers').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/numbers/:id', async (req, res) => {
  const { data, error } = await supabase.from('vip_numbers').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/numbers/:id', async (req, res) => {
  const { error } = await supabase.from('vip_numbers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Cashfree Payment API ────────────────────────────────────────────────
const CF_CONFIG = {
  clientId: (process.env.CASHFREE_CLIENT_ID || '').trim(),
  clientSecret: (process.env.CASHFREE_CLIENT_SECRET || '').trim(),
  baseUrl: (process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg').trim()
};

app.post('/payments/create-order', async (req, res) => {
  const { amount, customer_phone, items, milestoneIndex, totalMilestones } = req.body;
  try {
    const phoneStr = String(customer_phone || '').replace(/\D/g, '');
    const amountNum = Number(amount);
    
    if (!phoneStr) return res.status(400).json({ error: 'Valid customer phone is required' });
    if (!amountNum || amountNum < 1) return res.status(400).json({ error: 'Valid amount is required' });
    
    // Check for existing partial order for these items (if logic allows)
    // For simplicity, we just create a new session for the requested amount
    const orderId = `order_${phoneStr.slice(-4)}_${Date.now()}`;
    const response = await axios.post(`${CF_CONFIG.baseUrl}/orders`, {
      order_id: orderId,
      order_amount: amountNum,
      order_currency: "INR",
      customer_details: {
        customer_id: phoneStr,
        customer_phone: phoneStr,
        customer_email: "customer@vipnumberwala.shop"
      },
      order_meta: {
        return_url: (process.env.CASHFREE_RETURN_URL || 'http://localhost:5173/checkout/status?order_id={order_id}').replace('{order_id}', orderId)
      },
      order_tags: {
        customer_phone: phoneStr,
        items: items.join(','),
        milestone: String(milestoneIndex || 1),
        total_milestones: String(totalMilestones || 1),
        is_installment: String((totalMilestones || 1) > 1)
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
    const errorData = error.response?.data || error.message;
    console.error('Cashfree API Error:', errorData);
    res.status(500).json({ 
      error: 'Payment initialization failed', 
      details: errorData
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      supabase: hasSupabase,
      cashfree_id: !!CF_CONFIG.clientId,
      cashfree_secret: !!CF_CONFIG.clientSecret,
      cashfree_url: CF_CONFIG.baseUrl,
      return_url: !!process.env.CASHFREE_RETURN_URL
    }
  });
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

    const cfOrder = response.data;
    
    // If PAID, update Database
    if ((cfOrder.order_status === 'PAID' || cfOrder.order_status === 'SUCCESS') && hasSupabase) {
      const { items, milestone, total_milestones, customer_phone } = cfOrder.order_tags || {};
      const itemIds = (items || '').split(',').filter(Boolean);
      
      for (const numberId of itemIds) {
        // Try to find existing order for this number and user
        const { data: existing } = await supabase
          .from('orders')
          .select('*')
          .eq('number_id', numberId)
          .eq('customer_phone', customer_phone)
          .single();

        if (existing) {
          // Update existing order installments
          await supabase.from('orders').update({
            paid_milestones: parseInt(milestone),
            paid_amount: parseFloat(existing.paid_amount || 0) + cfOrder.order_amount,
            status: parseInt(milestone) >= parseInt(total_milestones) ? 'completed' : 'partial'
          }).eq('id', existing.id);
        } else {
          // Create new record
          await supabase.from('orders').insert([{
            number_id: numberId,
            customer_phone: customer_phone,
            customer_wa: customer_phone, // Sync both for legacy
            total_amount: cfOrder.order_amount * parseInt(total_milestones),
            paid_amount: cfOrder.order_amount,
            total_milestones: parseInt(total_milestones),
            paid_milestones: parseInt(milestone),
            status: parseInt(total_milestones) === 1 ? 'completed' : 'partial'
          }]);
        }
      }
    }

    res.json(cfOrder);
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── Simple Password Auth ────────────────────────────────────────────────

app.post('/auth/register', async (req, res) => {
  const { phone, password, role } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });

  // In a real app, use bcrypt to hash the password. 
  // For simplicity here, we'll store as is or assume Supabase handling.
  const { data: existing } = await supabase.from('users').select('*').eq('phone', phone).single();
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const { data, error } = await supabase.from('users').insert([{
    phone,
    password, // Plain text for now as per user request for simplicity, highly recommend hashing
    role: role || 'user'
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, user: { phone: data.phone, role: data.role } });
});

app.post('/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  
  // Admin Backdoor / Special handling
  if (phone === '8090050091' && password === 'admin123') {
     return res.json({ success: true, user: { phone, is_admin: true, role: 'admin' } });
  }

  const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
  
  if (error || !data || data.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ success: true, user: { phone: data.phone, is_admin: data.role === 'admin', role: data.role } });
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
  console.log(`🚀 API Server on http://localhost:${PORT}`);
});
