# Docker Deployment Guide

## Prerequisites

1. **DockerHub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **GitHub Repository**: Push your code to GitHub
3. **DockerHub Access Token**: Create a token in DockerHub settings

## Setup GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **DOCKERHUB_USERNAME**: Your DockerHub username
2. **DOCKERHUB_TOKEN**: Your DockerHub access token

### Creating DockerHub Access Token

1. Go to [DockerHub Account Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token and add it to GitHub secrets

## Workflow Triggers

The workflow automatically runs on:

- **Push to main/master**: Builds and pushes with `latest` tag
- **Push tags (v*.*.\*)**: Builds and pushes with version tags
- **Pull requests**: Builds only (doesn't push)
- **Manual trigger**: Via GitHub Actions UI

## Docker Image Tags

The workflow creates multiple tags:

- `latest` - Latest build from main/master branch
- `main` or `master` - Branch name
- `v1.2.3` - Semantic version (if tagged)
- `v1.2` - Major.minor version
- `v1` - Major version
- `main-abc1234` - Branch + commit SHA

## Multi-Architecture Support

Images are built for:

- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64/Apple Silicon)

## Running the Docker Image

### Pull from DockerHub

```bash
docker pull <your-dockerhub-username>/fitness-app:latest
```

### Run the container

```bash
docker run -d \
  -p 3000:3000 \
  -v fitness-db:/app/db \
  --name fitness-app \
  <your-dockerhub-username>/fitness-app:latest
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  fitness-app:
    image: <your-dockerhub-username>/fitness-app:latest
    ports:
      - "3000:3000"
    volumes:
      - fitness-db:/app/db
    environment:
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  fitness-db:
```

Run with:

```bash
docker-compose up -d
```

## Local Docker Build

Test the Docker build locally:

```bash
# Build
docker build -t fitness-app .

# Run
docker run -p 3000:3000 -v fitness-db:/app/db fitness-app
```

## Versioning

To create a new version:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the workflow and create version-tagged images.

## Troubleshooting

### Build fails with "better-sqlite3" error

- The Dockerfile includes build tools (python3, make, g++) to compile native modules

### Database not persisting

- Make sure to use a volume: `-v fitness-db:/app/db`

### Port already in use

- Change the host port: `-p 3001:3000`

## Environment Variables

You can customize the app with environment variables:

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -v fitness-db:/app/db \
  fitness-app
```

## Health Check

Check if the app is running:

```bash
curl http://localhost:3000
```

## Logs

View container logs:

```bash
docker logs fitness-app
docker logs -f fitness-app  # Follow logs
```

## Updating

Pull the latest image and restart:

```bash
docker pull <your-dockerhub-username>/fitness-app:latest
docker-compose down
docker-compose up -d
```
