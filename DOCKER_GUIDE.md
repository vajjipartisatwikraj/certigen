# Docker Setup Guide for Certigen

## Prerequisites
- Docker Desktop installed on Windows
- DockerHub account

## Quick Start

### 1. Build Images Locally
```powershell
# Build both images
docker-compose build

# Or build individually
docker build -t certigen-backend ./backend
docker build -t certigen-frontend ./frontend
```

### 2. Run Locally with Docker Compose
```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Build and Push to DockerHub
```powershell
# Use the PowerShell script
.\build-and-push.ps1 YOUR_DOCKERHUB_USERNAME

# Or manually:
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-backend:latest ./backend
docker build -t YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest ./frontend

docker login
docker push YOUR_DOCKERHUB_USERNAME/certigen-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/certigen-frontend:latest
```

## Docker Files Overview

- **backend/Dockerfile**: Backend Node.js app with PM2
- **backend/ecosystem.config.js**: PM2 process configuration
- **frontend/Dockerfile**: Multi-stage build with Nginx
- **frontend/nginx.conf**: Nginx server configuration
- **docker-compose.yml**: Local development composition
- **docker-compose.prod.yml**: Production composition (for server)
- **.dockerignore**: Files to exclude from Docker builds

## Useful Commands

### Container Management
```powershell
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop certigen-backend

# Remove container
docker rm certigen-backend

# View container logs
docker logs certigen-backend

# Execute command in container
docker exec -it certigen-backend sh

# View PM2 status inside container
docker exec -it certigen-backend pm2 list
```

### Image Management
```powershell
# List images
docker images

# Remove image
docker rmi certigen-backend

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

### Docker Compose Commands
```powershell
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend
```

## Testing the Setup

### 1. Test Backend
```powershell
# Check if backend is running
curl http://localhost:5000/api/health

# Or in browser
http://localhost:5000
```

### 2. Test Frontend
```powershell
# Check if frontend is running
curl http://localhost:3000

# Or in browser
http://localhost:3000
```

### 3. Check PM2 Status
```powershell
docker exec -it certigen-backend pm2 list
docker exec -it certigen-backend pm2 logs
```

## Production Deployment on Server

### 1. On Server
```bash
# Create project directory
mkdir -p ~/certigen
cd ~/certigen

# Create docker-compose.prod.yml
nano docker-compose.prod.yml
# Copy content from docker-compose.prod.yml

# Set your DockerHub username
export DOCKER_USERNAME=your_dockerhub_username

# Pull and run
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Update Deployment
```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.prod.yml up -d

# Remove old images
docker image prune -f
```

## Troubleshooting

### Container won't start
```powershell
# Check logs
docker-compose logs backend

# Check if port is in use
netstat -ano | findstr :5000
```

### Out of disk space
```powershell
# Clean up
docker system prune -a

# Remove volumes
docker volume prune
```

### Can't connect to backend from frontend
- Check if both containers are on same network
- Verify backend is healthy: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

## Environment Variables

Create `.env` file in root:
```env
DOCKER_USERNAME=your_dockerhub_username
NODE_ENV=production
PORT=5000
```

## Health Checks

Both services have health checks configured:
- **Backend**: PM2 ping command
- **Frontend**: HTTP health endpoint

Check status:
```powershell
docker-compose ps
```

## Next Steps

1. Test locally: `docker-compose up`
2. Push to DockerHub: `.\build-and-push.ps1 YOUR_USERNAME`
3. Set up CI/CD with GitHub Actions
4. Deploy to production server
