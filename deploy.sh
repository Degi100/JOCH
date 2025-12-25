#!/bin/bash

# JOCH Bandpage - Deployment Script
# Server: 94.130.185.204
# Domain: joch.degidev.de (später: joch-bremen.de)

set -e  # Exit on error

# Configuration
SERVER_IP="94.130.185.204"
SERVER_USER="root"
DOMAIN="joch.degidev.de"
APP_DIR="/var/www/joch"
REPO_URL="https://github.com/YOUR_USERNAME/JOCH.git"  # TODO: Update with your repo URL

echo "🎸 JOCH Bandpage Deployment Script"
echo "=================================="
echo ""

# Check if we should run locally or deploy to server
if [[ "$1" == "--local" ]]; then
    echo "📦 Building locally..."
    npm run build
    echo "✅ Local build complete!"
    exit 0
fi

# SSH into server and run deployment
echo "🚀 Deploying to $SERVER_IP..."
echo ""

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'

set -e

APP_DIR="/var/www/joch"
DOMAIN="joch.degidev.de"

echo "📁 Setting up directories..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads/{images,audio,other}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

cd $APP_DIR

# Clone or pull repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    # If no git repo, we'll upload files manually
    echo "⚠️  No git repository found. Please upload files manually or set up git."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared package first
echo "🔨 Building shared package..."
npm run build --workspace=shared

# Build backend
echo "🔨 Building backend..."
npm run build --workspace=backend

# Build frontend
echo "🔨 Building frontend..."
npm run build --workspace=frontend

# Create/update .env file for backend
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend .env file..."
    cat > backend/.env << 'EOF'
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/joch?retryWrites=true&w=majority

# JWT
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://joch.degidev.de

# Base URL for uploaded files
BASE_URL=https://joch.degidev.de
EOF
    echo "⚠️  IMPORTANT: Edit backend/.env with your MongoDB credentials and JWT secret!"
fi

# Set proper permissions for uploads
echo "🔐 Setting permissions..."
chown -R www-data:www-data $APP_DIR/uploads
chmod -R 755 $APP_DIR/uploads

# Configure PM2
echo "🔄 Configuring PM2..."
cd backend

# Stop existing process if running
pm2 stop joch-backend 2>/dev/null || true
pm2 delete joch-backend 2>/dev/null || true

# Start with PM2
pm2 start dist/server.js --name joch-backend
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

cd ..

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/joch << 'NGINXCONF'
server {
    listen 80;
    server_name joch.degidev.de;

    # Frontend (React build)
    location / {
        root /var/www/joch/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        alias /var/www/joch/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File upload size limit
    client_max_body_size 50M;
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/joch /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test and reload nginx
nginx -t
systemctl reload nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your MongoDB credentials"
echo "2. Set up SSL with: certbot --nginx -d joch.degidev.de"
echo "3. Check status with: pm2 status"
echo ""
echo "🎸 JOCH Backend läuft auf https://joch.degidev.de"

ENDSSH

echo ""
echo "🎉 Deployment finished!"
