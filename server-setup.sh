#!/bin/bash

# JOCH Bandpage - Server Setup Script
# Run this ONCE on a fresh server to set up the environment
# Usage: ssh root@94.130.185.204 'bash -s' < server-setup.sh

set -e

echo "🎸 JOCH Server Setup"
echo "===================="
echo ""

APP_DIR="/var/www/joch"
DOMAIN="joch.degidev.de"

# Update system
echo "📦 Updating system..."
apt-get update
apt-get upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Create app directory
echo "📁 Creating directories..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/backend/uploads/{images,audio,other}
chown -R www-data:www-data $APP_DIR/backend/uploads
chmod -R 755 $APP_DIR/backend/uploads

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

# Test nginx config
nginx -t

# Start/restart nginx
systemctl enable nginx
systemctl restart nginx

# Set up PM2 startup
pm2 startup systemd -u root --hp /root

# Create backend .env template
echo "⚙️  Creating .env template..."
mkdir -p $APP_DIR/backend
cat > $APP_DIR/backend/.env << 'EOF'
# Server
PORT=5000
NODE_ENV=production

# MongoDB - CHANGE THIS!
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/joch?retryWrites=true&w=majority

# JWT - CHANGE THIS TO A RANDOM STRING!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-random-string
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://joch.degidev.de

# Base URL for uploaded files
BASE_URL=https://joch.degidev.de
EOF

# Set permissions
chmod 600 $APP_DIR/backend/.env

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit ${APP_DIR}/backend/.env with your MongoDB credentials"
echo "2. Upload your app files using rsync or git"
echo "3. Run: cd ${APP_DIR} && npm install"
echo "4. Run: cd ${APP_DIR}/backend && pm2 start dist/server.js --name joch-backend"
echo "5. Set up SSL: certbot --nginx -d ${DOMAIN}"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status          - Check backend status"
echo "   pm2 logs            - View backend logs"
echo "   pm2 restart all     - Restart backend"
echo "   nginx -t            - Test nginx config"
echo "   systemctl reload nginx - Reload nginx"
