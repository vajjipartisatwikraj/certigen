# Production Deployment Setup Guide

## Environment Variables Required for Production

After the recent changes (DigitalOcean Spaces integration, email service), you need to configure these GitHub Secrets for successful deployment:

### Existing Secrets (Verify these are set)
1. **DOCKER_USERNAME** - Your DockerHub username: `satwikrajv`
2. **DOCKER_PASSWORD** - Your DockerHub password/access token
3. **SERVER_HOST** - Your server IP: `68.183.93.107`
4. **SERVER_USER** - SSH user on server: `certigen-deploy`
5. **SSH_PRIVATE_KEY** - Private SSH key for deployment

### Database Secret
6. **MONGODB_URI** - MongoDB Atlas connection string:
   ```
   mongodb+srv://satwikrajv_db_user:miQZsywAaJt7sVNg@cluster0.bvijxcl.mongodb.net/?appName=Cluster0
   ```

### DigitalOcean Spaces Secrets (NEW - REQUIRED)
7. **SPACES_ENDPOINT** - `sfo3.digitaloceanspaces.com`
11. **SPACES_REGION** - `sfo3`
12. **SPACES_BUCKET** - `certigen-certificates`
13. **SPACES_ACCESS_KEY** - `DO00C77BRCRLYA6X7MR2`
14. **SPACES_SECRET_KEY** - `XvEcAjmiP67ep+rJqAAjkD5EpFtBjZKvio5qkGzOq5o`
15. **SPACES_CDN_URL** - `https://certigen-certificates.sfo3.cdn.digitaloceanspaces.com`

### CORS Configuration Secret (NEW - REQUIRED)
16. **ALLOWED_ORIGINS** - Frontend URL for CORS (e.g., `http://68.183.93.107`)

---

## How to Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret one by one using the names and values above

---

## Manual Deployment Steps (If needed)

If you need to deploy manually or update the server directly:

### 1. SSH into Server
```bash
ssh certigen-deploy@68.183.93.107
```

### 2. Navigate to Project Directory
```bash
cd ~/certigen
```

### 3. Create/Update .env File
```bash
nano .env
```

Add all environment variables:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://satwikrajv_db_user:miQZsywAaJt7sVNg@cluster0.bvijxcl.mongodb.net/?appName=Cluster0
SPACES_ENDPOINT=sfo3.digitaloceanspaces.com
SPACES_REGION=sfo3
SPACES_BUCKET=certigen-certificates
SPACES_ACCESS_KEY=DO00C77BRCRLYA6X7MR2
SPACES_SECRET_KEY=XvEcAjmiP67ep+rJqAAjkD5EpFtBjZKvio5qkGzOq5o
SPACES_CDN_URL=https://certigen-certificates.sfo3.cdn.digitaloceanspaces.com
ALLOWED_ORIGINS=http://68.183.93.107
```

### 4. Pull Latest Images
```bash
docker-compose pull
```

### 5. Restart Containers
```bash
docker-compose down
docker-compose up -d
```

### 6. Verify Deployment
```bash
docker-compose ps
docker-compose logs -f backend
```

---

## AWS SDK Installation

The backend Dockerfile already includes all necessary dependencies. The `aws-sdk` package is installed via npm:

```dockerfile
RUN npm install --production
```

This will automatically install `aws-sdk` from package.json dependencies.

---

## Nginx Configuration Update

Your Nginx configuration should already support the backend API. Verify it includes:

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts for long-running operations
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
    
    # Upload size
    client_max_body_size 100M;
}
```

---

## Testing After Deployment

### 1. Test Backend Health
```bash
curl http://68.183.93.107:5000/api/health
```

### 2. Test Spaces Connection
```bash
# SSH into server
ssh certigen-deploy@68.183.93.107

# Run test script
cd ~/certigen
docker exec certigen-backend node test-spaces.js
```

### 3. Test Certificate Generation
- Upload a template via the UI
- Generate a certificate
- Verify it uploads to DigitalOcean Spaces
- Check the CDN URL works

### 4. Test Email Sending
- Generate and send a certificate
- Verify email is received
- Check that PDF is attached from Spaces CDN

### 5. Test Manage Recipients
- Navigate to a template
- Click "Manage Recipients"
- Verify certificates list loads
- Test deleting a certificate (should remove from Spaces)

---

## Troubleshooting

### Container Won't Start
```bash
docker-compose logs backend
```

### Environment Variables Not Loading
```bash
docker exec certigen-backend env | grep SPACES
docker exec certigen-backend env | grep EMAIL
```

### Spaces Upload Failing
```bash
docker exec certigen-backend node -e "console.log(require('aws-sdk'))"
```

### Email Not Sending
```bash
docker exec certigen-backend node test-email.js
```

---

## Automated Deployment Workflow

After adding all GitHub Secrets, the deployment is fully automated:

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Update deployment configuration"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Build Docker images
   - Push to DockerHub
   - SSH into server
   - Create docker-compose.yml with all secrets
   - Pull latest images
   - Restart containers
   - Clean up old images

3. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Click on the running workflow
   - Watch build and deploy logs

---

## Post-Deployment Verification Checklist

- [ ] Containers are running: `docker-compose ps`
- [ ] Backend responds: `curl http://68.183.93.107:5000/api/health`
- [ ] Frontend loads: Visit `http://68.183.93.107`
- [ ] MongoDB connected: Check backend logs
- [ ] Spaces configured: Test certificate generation
- [ ] Email working: Send test certificate
- [ ] Manage Recipients: Delete functionality works
- [ ] Nginx proxying: API calls work from frontend

---

## Important Notes

1. **No Local Storage**: Certificates are now stored only in DigitalOcean Spaces, not on the server disk
2. **CDN URLs**: All certificate URLs are now permanent CDN links
3. **Email Attachments**: Emails now reference Spaces URLs, not local files
4. **MongoDB Atlas**: Using cloud database, no local MongoDB needed
5. **Environment-Specific**: Make sure ALLOWED_ORIGINS matches your frontend URL

---

## Quick Commands Reference

```bash
# View running containers
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Restart backend only
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend

# Clean everything
docker-compose down -v
docker system prune -a

# SSH to server
ssh certigen-deploy@68.183.93.107

# Test Spaces connection
docker exec certigen-backend node test-spaces.js

# Test email config
docker exec certigen-backend node test-email.js
```
