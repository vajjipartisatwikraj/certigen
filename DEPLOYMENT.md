# Complete Deployment Guide - Certigen Project

This guide walks you through deploying the Certigen application to production using Docker, DigitalOcean, Nginx, and GitHub Actions CI/CD.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Docker Setup](#local-docker-setup)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [GitHub Repository Setup](#github-repository-setup)
5. [DockerHub Setup](#dockerhub-setup)
6. [DigitalOcean Server Setup](#digitalocean-server-setup)
7. [Server Configuration](#server-configuration)
8. [Nginx Setup](#nginx-setup)
9. [GitHub Actions CI/CD](#github-actions-cicd)
10. [Domain & SSL Setup](#domain--ssl-setup-optional)
11. [Deployment Workflow](#deployment-workflow)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [x] GitHub account
- [x] DockerHub account (https://hub.docker.com)
- [x] DigitalOcean account (https://www.digitalocean.com)
- [x] MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- [x] Domain registrar account (Namecheap, etc.) - Optional

### Local Development Tools
- [x] Docker Desktop installed and running
- [x] Git installed
- [x] PowerShell/Terminal access
- [x] SSH client

---

## Local Docker Setup

### 1. Verify Docker Installation

```powershell
# Check Docker is running
docker --version
docker ps

# Check Docker Compose
docker-compose --version
```

### 2. Project Docker Files

Your project already has these files:
- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration
- `docker-compose.yml` - Local development setup
- `docker-compose.prod.yml` - Production setup

### 3. Test Locally

```powershell
# Build and run locally
docker-compose up --build

# Access locally
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## MongoDB Atlas Setup

### 1. Create Free Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a **New Project** (e.g., "Certigen")
4. Click **"Build a Database"**
5. Choose **FREE (M0)** tier
6. Select **Region** (choose closest to your server location)
7. Click **"Create Cluster"**

### 2. Configure Database Access

1. Click **"Database Access"** in left menu
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `certigen_user` (or your choice)
5. **Auto-generate Secure Password** (copy this!)
6. Set **Database User Privileges**: Read and write to any database
7. Click **"Add User"**

### 3. Configure Network Access

1. Click **"Network Access"** in left menu
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - *For production, restrict to your server IP later*
4. Click **"Confirm"**

### 4. Get Connection String

1. Click **"Database"** in left menu
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 4.1 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your username
7. Replace `<password>` with your password
8. **Save this connection string** - you'll need it later!

Example:
```
mongodb+srv://certigen_user:YOUR_PASSWORD@cluster0.bvijxcl.mongodb.net/?appName=Cluster0
```

---

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Repository name: `certigen`
4. Description: "Certificate Generation System"
5. Choose **Public** or **Private**
6. **Don't** initialize with README (you already have one)
7. Click **"Create repository"**

### 2. Push Local Code to GitHub

```powershell
# Navigate to your project
cd C:\Users\SATWIK\OneDrive\Desktop\certigen

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/certigen.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## DockerHub Setup

### 1. Create DockerHub Account

1. Go to https://hub.docker.com/signup
2. Sign up with email or GitHub
3. Verify your email

### 2. Create Access Token

1. Login to DockerHub
2. Click your **profile icon** → **Account Settings**
3. Click **"Security"** → **"Personal access tokens"**
4. Click **"Generate New Token"**
5. Token description: `github-actions-certigen`
6. Access permissions: **Read, Write, Delete**
7. Click **"Generate"**
8. **Copy the token** (you won't see it again!)

### 3. Login from Local Machine

```powershell
# Login to DockerHub
docker login
# Username: YOUR_DOCKERHUB_USERNAME
# Password: (paste your access token)
```

### 4. Build and Push Initial Images

```powershell
# Build backend image
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-backend:latest ./backend

# Build frontend image
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest ./frontend

# Push to DockerHub
docker push YOUR_DOCKERHUB_USERNAME/certigen-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest
```

Replace `YOUR_DOCKERHUB_USERNAME` with your DockerHub username (e.g., `satwikrajv`).

---

## DigitalOcean Server Setup

### 1. Create Droplet

1. Login to https://www.digitalocean.com
2. Click **"Create"** → **"Droplets"**
3. **Choose Region**: Bangalore (BLR1) or nearest to you
4. **Choose Image**: Ubuntu 22.04 (LTS) x64
5. **Choose Size**: 
   - Basic plan
   - Regular CPU
   - 2 GB RAM / 2 vCPUs / 80 GB SSD ($18/month)
   - Or 4 GB RAM for better performance
6. **Authentication**:
   - Choose **SSH Key** (recommended) or **Password**
   - If SSH: Add your public key or create new
7. **Hostname**: `certigen-server`
8. Click **"Create Droplet"**
9. **Wait 1-2 minutes** for creation
10. **Copy the IP address** (e.g., `68.183.93.107`)

### 2. Initial Server Access

```powershell
# SSH into server (Windows PowerShell)
ssh root@YOUR_SERVER_IP
# Enter password if prompted
```

Replace `YOUR_SERVER_IP` with your actual server IP.

---

## Server Configuration

### 1. Update System

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git
```

### 2. Create Non-Root User

```bash
# Create user
adduser certigen
# Set password and enter details

# Add to sudo group
usermod -aG sudo certigen

# Switch to new user
su - certigen
```

### 3. Configure Firewall

```bash
# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow backend port (optional, for direct access)
sudo ufw allow 5000/tcp

# Allow frontend port (optional)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
# Type 'y' and press Enter

# Check status
sudo ufw status
```

### 4. Install Docker

```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run installation
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker ${USER}

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
```

### 5. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 6. Set Up SSH Key for GitHub Actions

```bash
# Generate SSH key (press Enter for all prompts)
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Add public key to authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Display private key (copy entire output for GitHub secret)
cat ~/.ssh/id_rsa
```

**Important**: Copy the **entire private key** including:
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- All the middle content
- `-----END OPENSSH PRIVATE KEY-----`

You'll add this to GitHub Secrets later.

### 7. Create Project Directory

```bash
# Create directory
mkdir -p ~/certigen
cd ~/certigen

# Create subdirectories
mkdir -p uploads certificates logs
```

---

## Nginx Setup

### 1. Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
# Press 'q' to exit
```

### 2. Test Nginx

Open browser and visit: `http://YOUR_SERVER_IP`

You should see **"Welcome to nginx!"** page.

### 3. Configure Nginx for Application

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/certigen
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    # Increase upload size limit
    client_max_body_size 100M;

    # Increase timeouts for large uploads
    client_body_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_request_buffering off;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Serve generated certificates
    location /certificates {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Replace `YOUR_SERVER_IP` with your actual IP (e.g., `68.183.93.107`).

**Save**: Ctrl+O, Enter, Ctrl+X

### 4. Enable Site Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/certigen /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
# Should show "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx
```

---

## GitHub Actions CI/CD

### 1. Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** tab
2. Click **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these **5 secrets** one by one:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_USERNAME` | `YOUR_DOCKERHUB_USERNAME` | Your DockerHub username |
| `DOCKER_PASSWORD` | `YOUR_DOCKERHUB_TOKEN` | DockerHub access token (from earlier) |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `SERVER_HOST` | `YOUR_SERVER_IP` | Server IP address (e.g., 68.183.93.107) |
| `SERVER_USER` | `certigen` | SSH username on server |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH...` | Full SSH private key (from earlier) |

**Important**: 
- For `MONGODB_URI`, use the full connection string from MongoDB Atlas
- For `SSH_PRIVATE_KEY`, include the entire key with BEGIN/END lines

### 2. Verify Workflow File

Your project already has `.github/workflows/deploy.yml`. This workflow:
- Triggers on push to `main` branch
- Builds Docker images
- Pushes to DockerHub
- Deploys to server automatically

### 3. Test the Pipeline

```powershell
# Make a small change
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Monitor deployment:
1. Go to GitHub repository
2. Click **Actions** tab
3. Watch the workflow run
4. Both jobs should complete successfully ✅

---

## Domain & SSL Setup (Optional)

### 1. Purchase Domain (Namecheap)

1. Go to https://www.namecheap.com
2. Search and purchase domain (e.g., `certigen.com`)
3. Complete purchase

### 2. Configure DNS

1. Login to Namecheap
2. Go to **Domain List** → Click **Manage** on your domain
3. Click **Advanced DNS** tab
4. Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | YOUR_SERVER_IP | Automatic |
| A Record | www | YOUR_SERVER_IP | Automatic |

5. Click **Save**
6. **Wait 5-30 minutes** for DNS propagation

### 3. Verify DNS

```bash
# Check DNS propagation
nslookup yourdomain.com

# Should return your server IP
```

### 4. Install SSL Certificate (Let's Encrypt)

On your server:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts:
1. Enter email address
2. Agree to Terms of Service (Y)
3. Choose to redirect HTTP to HTTPS (option 2)

### 5. Update Nginx Configuration

Certbot automatically updates your Nginx config. Verify:

```bash
# Check updated config
sudo cat /etc/nginx/sites-available/certigen

# Should now have SSL configuration
```

### 6. Test Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Should show "Congratulations, all simulated renewals succeeded"
```

### 7. Access Your Site

Visit:
- `https://yourdomain.com` ✅
- Secure padlock icon should appear

---

## Deployment Workflow

### Development to Production Flow

```
┌─────────────────┐
│ Local Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ GitHub Actions Triggers │
└────────┬────────────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Build Images │   │ Run Tests    │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│ Push to Hub  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ SSH to Server    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Pull & Restart   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Live on Server ✅│
└──────────────────┘
```

### Making Changes

**Method 1: Automatic (Recommended)**

```powershell
# 1. Make your code changes
# Edit files in VS Code

# 2. Test locally
docker-compose up

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Wait for GitHub Actions to complete
# Visit: https://github.com/YOUR_USERNAME/certigen/actions

# 5. Verify on production
# Visit: http://YOUR_SERVER_IP or https://yourdomain.com
```

**Method 2: Manual (For quick testing)**

```powershell
# 1. Build images
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-backend:latest ./backend
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest ./frontend

# 2. Push to DockerHub
docker push YOUR_DOCKERHUB_USERNAME/certigen-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest
```

Then on server:
```bash
# 3. Pull and restart
cd ~/certigen
docker-compose pull
docker-compose up -d
```

---

## Troubleshooting

### Check Container Status

```bash
# View running containers
docker-compose ps

# View all containers
docker ps -a

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backend Not Connecting to MongoDB

```bash
# Check backend logs
docker-compose logs backend | grep MongoDB

# Should see: "✅ MongoDB connected successfully"
# If error, verify MONGODB_URI in docker-compose.yml
```

### Files Not Uploading

```bash
# Check file size limits
sudo nano /etc/nginx/sites-available/certigen
# Verify: client_max_body_size 100M;

# Restart Nginx
sudo systemctl reload nginx
```

### Containers Constantly Restarting

```bash
# Check why container failed
docker-compose logs backend --tail 50

# Common issues:
# - MongoDB connection failed
# - Missing environment variables
# - Port already in use
```

### 404 Errors on Uploads/Certificates

```bash
# Verify files exist
ls -la ~/certigen/uploads/
docker exec -it certigen-backend ls -la /app/uploads/

# Check Nginx proxy configuration
sudo nginx -t
sudo systemctl reload nginx
```

### GitHub Actions Failing

1. Check workflow run on GitHub Actions tab
2. Common issues:
   - Wrong GitHub Secrets
   - SSH key not configured correctly
   - DockerHub credentials invalid

```bash
# Test SSH connection manually
ssh certigen@YOUR_SERVER_IP

# Test Docker login
docker login
```

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :5000
sudo lsof -i :3000

# Stop conflicting service
docker-compose down

# Or kill process
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker-compose ps

# Check backend is accessible
curl http://localhost:5000/api/health

# Restart containers
docker-compose restart
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL config
sudo nginx -t
```

### Reset Everything

```bash
# Stop all containers
docker-compose down

# Remove all containers and images
docker system prune -a

# Remove volumes
docker volume prune

# Start fresh
docker-compose up -d
```

---

## Useful Commands Reference

### Docker Commands

```bash
# Container Management
docker-compose up -d          # Start containers in background
docker-compose down           # Stop and remove containers
docker-compose restart        # Restart all containers
docker-compose ps             # List running containers
docker-compose logs -f        # Follow logs
docker-compose pull           # Pull latest images

# Image Management
docker images                 # List images
docker rmi <image_id>         # Remove image
docker system prune -a        # Remove unused images

# Container Inspection
docker exec -it <container> bash   # Enter container shell
docker inspect <container>         # View container details
```

### Nginx Commands

```bash
sudo nginx -t                 # Test configuration
sudo systemctl start nginx    # Start Nginx
sudo systemctl stop nginx     # Stop Nginx
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl reload nginx   # Reload config (no downtime)
sudo systemctl status nginx   # Check status

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Server Management

```bash
# System
sudo reboot                   # Restart server
sudo shutdown -h now          # Shutdown server

# Firewall
sudo ufw status               # Check firewall status
sudo ufw allow 80/tcp         # Allow port
sudo ufw delete allow 80/tcp  # Remove rule

# Monitoring
top                           # CPU/Memory usage
df -h                         # Disk usage
free -m                       # Memory usage
netstat -tlnp                 # Open ports
```

---

## Production Checklist

Before going live, verify:

- [ ] MongoDB Atlas cluster is running
- [ ] All GitHub Secrets are configured correctly
- [ ] Docker images pushed to DockerHub
- [ ] Server firewall configured (ports 80, 443, 22 open)
- [ ] Nginx installed and configured
- [ ] SSL certificate installed (if using domain)
- [ ] Containers running: `docker-compose ps`
- [ ] Backend connected to MongoDB (check logs)
- [ ] Frontend accessible via browser
- [ ] API endpoints working
- [ ] File upload working
- [ ] Certificate generation working
- [ ] GitHub Actions workflow passing
- [ ] DNS configured (if using domain)

---

## Support & Maintenance

### Regular Maintenance

1. **Weekly**: Check logs for errors
   ```bash
   docker-compose logs --tail 100
   ```

2. **Monthly**: Update system packages
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Quarterly**: Review and renew SSL certificates
   ```bash
   sudo certbot renew
   ```

### Backup Strategy

```bash
# Backup MongoDB (from Atlas dashboard)
# Export data from MongoDB Atlas

# Backup uploaded files
cd ~
tar -czf certigen-backup-$(date +%Y%m%d).tar.gz certigen/uploads certigen/certificates

# Download backup to local
# Use SCP or SFTP
```

### Monitoring

Monitor your application:
- Server CPU/Memory usage (DigitalOcean dashboard)
- Container health: `docker-compose ps`
- Nginx access logs: `/var/log/nginx/access.log`
- Application errors in container logs

---

## Conclusion

You now have a fully automated deployment pipeline! 

**Simple deployment process:**
1. Make changes locally
2. `git push origin main`
3. Watch GitHub Actions deploy automatically
4. Visit your live site!

**Questions or issues?** Check the [Troubleshooting](#troubleshooting) section.

---

**Last Updated**: January 2026
**Project**: Certigen - Certificate Generation System
