# Build and Push Docker Images to DockerHub
# Usage: .\build-and-push.ps1 <your-dockerhub-username>

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

Write-Host "Building Docker images for certigen..." -ForegroundColor Green

# Build backend image
Write-Host "`nBuilding backend image..." -ForegroundColor Cyan
docker build -t "${DockerUsername}/certigen-backend:latest" ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}

# Build frontend image
Write-Host "`nBuilding frontend image..." -ForegroundColor Cyan
docker build -t "${DockerUsername}/certigen-frontend:latest" ./frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuild completed successfully!" -ForegroundColor Green

# Ask for confirmation before pushing
$confirm = Read-Host "`nDo you want to push images to DockerHub? (y/n)"

if ($confirm -eq 'y') {
    Write-Host "`nLogging into DockerHub..." -ForegroundColor Cyan
    docker login

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker login failed!" -ForegroundColor Red
        exit 1
    }

    # Push backend image
    Write-Host "`nPushing backend image..." -ForegroundColor Cyan
    docker push "${DockerUsername}/certigen-backend:latest"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend push failed!" -ForegroundColor Red
        exit 1
    }

    # Push frontend image
    Write-Host "`nPushing frontend image..." -ForegroundColor Cyan
    docker push "${DockerUsername}/certigen-frontend:latest"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend push failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "`nAll images pushed successfully to DockerHub!" -ForegroundColor Green
    Write-Host "`nImages:" -ForegroundColor Yellow
    Write-Host "  - ${DockerUsername}/certigen-backend:latest"
    Write-Host "  - ${DockerUsername}/certigen-frontend:latest"
} else {
    Write-Host "`nSkipping push to DockerHub." -ForegroundColor Yellow
}
