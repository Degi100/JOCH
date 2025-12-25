#!/bin/bash

# JOCH Bandpage - Upload Script
# Uploads built files to Hetzner server via rsync

set -e

SERVER_IP="94.130.185.204"
SERVER_USER="root"
APP_DIR="/var/www/joch"

echo "🎸 JOCH Bandpage Upload Script"
echo "==============================="
echo ""

# Build locally first
echo "📦 Building project locally..."
npm run build --workspace=shared
npm run build --workspace=backend
npm run build --workspace=frontend

echo ""
echo "📤 Uploading to server..."

# Create remote directories
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${APP_DIR}/{backend,frontend,shared}"

# Upload package files
echo "  → package.json files..."
rsync -avz --progress package.json ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/
rsync -avz --progress package-lock.json ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/ 2>/dev/null || true

# Upload shared
echo "  → shared/"
rsync -avz --progress \
    --exclude 'node_modules' \
    shared/ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/shared/

# Upload backend
echo "  → backend/"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'uploads' \
    --exclude '.env' \
    backend/ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/backend/

# Upload frontend dist only (already built)
echo "  → frontend/dist/"
rsync -avz --progress \
    frontend/dist/ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/frontend/dist/

# Upload frontend package.json for reference
rsync -avz --progress \
    frontend/package.json ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/frontend/

echo ""
echo "✅ Upload complete!"
echo ""
echo "🔧 Now run on server:"
echo "   ssh ${SERVER_USER}@${SERVER_IP}"
echo "   cd ${APP_DIR}"
echo "   npm install --production"
echo "   cd backend && npm install --production"
echo "   pm2 restart joch-backend"
