#!/bin/bash
# 🚀 Hyperlocal Store 1-Click Deployment Script for aaPanel / Linux VPS

echo "========================================================="
echo "   Hyperlocal WhatsApp Quick Commerce Deployment Script   "
echo "========================================================="

# 1. Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not found! Please install Node.js v18 or v20 first."
    exit 1
fi

echo "✅ Node.js Version: $(node -v)"
echo "✅ NPM Version: $(npm -v)"

# 2. Install NPM packages
echo ""
echo "📦 Installing application dependencies..."
npm install --production=false

if [ $? -ne 0 ]; then
    echo "❌ npm install failed! Please check terminal logs."
    exit 1
fi

# 3. Build React & Express Server
echo ""
echo "🔨 Compiling React Frontend and Express Server into dist/..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ npm run build failed! Please check terminal logs."
    exit 1
fi

echo "✅ Build completed successfully!"

# 4. Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo ""
    echo "🔄 Starting application with PM2..."
    pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ Application is running in background with PM2!"
    echo "🌐 Access your app on port 3000 (http://localhost:3000)"
else
    echo ""
    echo "💡 PM2 not found. You can install it globally via: npm install -g pm2"
    echo "🚀 To run directly, execute: npm run start"
fi

echo "========================================================="
echo "🎉 Deployment Setup Finished! Superadmin at: /superadmin.php"
echo "========================================================="
