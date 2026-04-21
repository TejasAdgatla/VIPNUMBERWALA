#!/bin/bash

# --- CONFIGURATION ---
REPO_NAME="VIPNUMBERWALA"
FRONTEND_DOMAIN="vipnumberwala.shop"

echo "🚀 STARTING AUTOMATED DEPLOYMENT..."

# 1. Login to Railway (Opens Browser)
echo "--------------------------------------"
echo "STEP 1: RAILWAY LOGIN"
railway login

# 2. Deploy Backend
echo "--------------------------------------"
echo "STEP 2: DEPLOYING BACKEND TO RAILWAY..."
cd server
railway init
railway up
RAILWAY_URL=$(railway domain | head -n 1)
cd ..

if [ -z "$RAILWAY_URL" ]; then
  echo "❌ Error: Could not get Railway URL. Please check your Railway dashboard."
  exit 1
fi

echo "✅ Backend Live at: $RAILWAY_URL"

# 3. Update Frontend .env
echo "--------------------------------------"
echo "STEP 3: UPDATING FRONTEND CONFIG..."
echo "VITE_API_URL=https://$RAILWAY_URL" > .env
echo "VITE_WS_URL=wss://$RAILWAY_URL" >> .env

# 4. Deploy Frontend to GitHub Pages
echo "--------------------------------------"
echo "STEP 4: DEPLOYING FRONTEND TO GITHUB PAGES..."
npm install
npm run deploy

echo "--------------------------------------"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Backend: https://$RAILWAY_URL"
echo "Frontend: https://$FRONTEND_DOMAIN (or your GitHub Pages URL)"
echo "--------------------------------------"
