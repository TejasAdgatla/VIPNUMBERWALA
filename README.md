# VIPNumberWala E-commerce & WhatsApp Automation

This platform is a premium VIP mobile number marketplace featuring automated WhatsApp verification, planetary numerology analysis, and a native Cashfree payment gateway.

## 🚀 Deployment Guide (Render)

This project is configured for **Render.com** using a Blueprint (`render.yaml`).

### Prerequisites
- GitHub Account
- Render Account
- Cashfree Merchant Credentials (Production/Sandbox)
- Supabase Account (PostgreSQL)

### Steps to Deploy
1. **GitHub**: Create a new private repository on GitHub and push this code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
2. **Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **Blueprints** -> **New Blueprint Instance**.
   - Connect your GitHub repo.
   - It will detect the `render.yaml` file.
3. **Secrets**: 
   - When prompted for the `vip-secrets` group, add the following:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `CASHFREE_CLIENT_ID`
     - `CASHFREE_CLIENT_SECRET`
     - `CASHFREE_BASE_URL` (https://api.cashfree.com/pg)
     - `VITE_CASHFREE_MODE` (production)
     - `CASHFREE_RETURN_URL` (Your Render frontend URL + /checkout/status?order_id={order_id})
4. **Go Live**: Click **Deploy**.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, WhatsApp-web.js (Puppeteer), Axios.
- **Database**: Supabase (PostgreSQL).
- **Payment**: Cashfree Payments (v3 SDK).

## 🛡️ Security
Sensitive files like `.env` and WhatsApp session data are strictly ignored in `.gitignore`. **NEVER** commit your real keys to GitHub.
