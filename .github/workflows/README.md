# GitHub Actions CI/CD Setup

This workflow automatically builds and deploys your application when you push to the `main` branch.

## Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### 1. DOCKER_USERNAME
- **Value**: `satwikrajv`
- Your DockerHub username

### 2. DOCKER_PASSWORD
- **Value**: Your DockerHub password or access token
- Go to DockerHub → Account Settings → Security → New Access Token

### 3. SERVER_HOST
- **Value**: Your server IP address (e.g., `123.456.789.10`)
- The IP of your production server

### 4. SERVER_USER
- **Value**: Your server username (e.g., `certigen` or `ubuntu`)
- The user you created on your server

### 5. SSH_PRIVATE_KEY
- **Value**: Your SSH private key
- Generate on your server with:
  ```bash
  ssh-keygen -t rsa -b 4096 -C "github-actions"
  cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
  cat ~/.ssh/id_rsa  # Copy this entire output
  ```

## How It Works

1. **Trigger**: Pushes to `main` branch
2. **Build**: Creates Docker images for backend and frontend
3. **Push**: Uploads images to DockerHub
4. **Deploy**: SSH into server, pulls images, restarts containers

## Manual Trigger

You can also trigger the workflow manually:
1. Go to **Actions** tab in GitHub
2. Select "Build and Deploy to Production"
3. Click "Run workflow"

## Monitoring

- View workflow runs: Repository → **Actions** tab
- Check deployment logs in the workflow execution
- View server logs: `docker-compose logs -f`

## First Time Setup on Server

Before the workflow can deploy, ensure your server has:

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project directory
mkdir -p ~/certigen
cd ~/certigen

# Create required directories
mkdir -p uploads certificates logs
```

## Testing

After setting up secrets, push a commit to test:

```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Watch the **Actions** tab to see the workflow run!
