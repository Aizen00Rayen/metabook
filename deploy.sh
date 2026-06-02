#!/bin/bash
# Run this script on the VPS after cloning / pulling:
#   bash deploy.sh
set -e

echo "==> Installing dependencies..."
npm install

echo "==> Building frontend..."
npm run build

echo "==> Restarting server with PM2..."
pm2 describe metabook > /dev/null 2>&1 \
  && pm2 restart metabook \
  || pm2 start server/index.js --name metabook

pm2 save

echo ""
echo "✅ Deploy complete. Check logs with: pm2 logs metabook"
