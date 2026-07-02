# Civic Connect - Complete Setup Guide

This guide provides step-by-step instructions to set up and run the Civic Connect application locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [Running with Docker](#running-with-docker)
7. [Accessing the Application](#accessing-the-application)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **npm** or **bun** - Node package managers
- **Java** (JDK 11+) - [Download](https://adoptopenjdk.net/)
- **Maven** (3.6+) - [Download](https://maven.apache.org/)
- **PostgreSQL** (12+) - [Download](https://www.postgresql.org/)
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

### Verify Installations
```bash
node --version        # Should be v18+
npm --version         # Or: bun --version
java -version         # Should be 11+
mvn --version         # Should be 3.6+
psql --version        # Should be 12+
docker --version
docker-compose --version
```

## Environment Setup

### 1. Clone and Navigate to Project
```bash
# Navigate to your projects directory
cd "d:\full stack"

# Check the structure
cd civic-connect
ls -la
```

You should see:
```
backend/
frontend/
docs/
docker-compose.yml
README.md
```

### 2. Configure Environment Variables

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_connect
DB_USER=postgres
DB_PASSWORD=your_password

# Frontend
VITE_API_URL=http://localhost:8081/api

# Backend
JWT_SECRET=your-secret-key-change-this-in-production
SERVER_PORT=8081
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using bun
bun install
```

### 3. Run Development Server
```bash
npm run dev
# Frontend will be available at http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

### 5. Run Tests
```bash
npm run test
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Configure Database Connection

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 3. Build Backend
```bash
# Compile and package
mvn clean package

# Skip tests (optional)
mvn clean package -DskipTests
```

### 4. Run Backend
```bash
# Using Maven
mvn spring-boot:run

# Or using Java directly
java -jar target/civic-connect-api.jar
```

Backend will be available at `http://localhost:8081/api`

## Database Setup

### Option 1: Local PostgreSQL Installation

#### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# In psql prompt
CREATE DATABASE civic_connect;
```

#### 2. Initialize Schema and Users
```bash
# Connect to PostgreSQL and run the admin seed SQL from this guide
psql -U postgres -d civic_connect -h localhost
```

#### 3. Verify Installation
```bash
psql -U postgres -h localhost -d civic_connect

# In psql prompt
\dt                    # List tables
SELECT * FROM "user";  # View users
```

### Option 2: Using Docker (Recommended)

See [Running with Docker](#running-with-docker) section below.

## Running with Docker

### 1. Start All Services
```bash
# From project root directory
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend** on port 8081
- **Frontend** on port 8080

### 2. View Logs
```bash
docker-compose logs -f          # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only
docker-compose logs -f db       # Database only
```

### 3. Stop Services
```bash
docker-compose down
```

### 4. Rebuild Services
```bash
# Rebuild images
docker-compose build --no-cache

# Rebuild and start
docker-compose up --build -d
```

## Accessing the Application

### Frontend
- **URL**: http://localhost:8080 (Docker) or http://localhost:5173 (dev server)
- **Access**: Open in web browser

### Backend API
- **URL**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/api/swagger-ui.html (if enabled)

### Database
```bash
# Connect directly to PostgreSQL
psql -U postgres -h localhost -d civic_connect
```

## Default Credentials

The database seed creates these test users:

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Admin | admin@gmail.com | password | 1 |
| Worker | worker@demo.com | password | 2 |
| Citizen | citizen@demo.com | password | 3 |

**⚠️ Important**: Change these passwords in production!

## Project File Locations

### Key Configuration Files
```
backend/src/main/resources/
  ├── application.properties      # Database, JWT, CORS config
  └── application-dev.properties  # Development overrides

frontend/
  ├── vite.config.ts              # Build configuration
  ├── tsconfig.json               # TypeScript config
  ├── tailwind.config.ts          # CSS framework config
  └── .env.local                  # Local environment variables

backend/
  └── pom.xml                     # Maven dependencies
```

### Port Configuration

| Service | Port | Environment Variable |
|---------|------|----------------------|
| Frontend Dev | 5173 | - |
| Frontend Prod | 8080 | - |
| Backend API | 8081 | `server.port` |
| PostgreSQL | 5432 | `spring.datasource.url` |

## Troubleshooting

### Frontend Issues

**Port 5173 already in use**
```bash
# Windows - Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

**Dependencies not installing**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors**
```bash
# Clear build artifacts
rm -rf dist
npm run build
```

### Backend Issues

**Port 8081 already in use**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8081
kill -9 <PID>
```

**Database connection failed**
```bash
# Check PostgreSQL is running
# Windows
sc query PostgreSQL*

# macOS
brew services list | grep postgres

# Linux
sudo systemctl status postgresql
```

**Build fails with Maven**
```bash
# Clean build
mvn clean install

# Rebuild without tests
mvn clean package -DskipTests

# Update dependencies
mvn dependency:resolve
```

### Database Issues

**Cannot connect to PostgreSQL**
```bash
# Verify PostgreSQL service is running
# Test connection
psql -U postgres -h localhost -d postgres

# Check if database exists
psql -U postgres -h localhost -c "\l"
```

**Database migrations failed**
```bash
# Reset database (WARNING: Deletes all data)
psql -U postgres -h localhost -d civic_connect -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize by rerunning the seed SQL from this guide
```

### Docker Issues

**Cannot start containers**
```bash
# Check Docker daemon is running
docker --version

# Review logs
docker-compose logs

# Try rebuilding
docker-compose build --no-cache
docker-compose up -d
```

**Port conflicts**
```bash
# List all running containers
docker ps -a

# Stop conflicting containers
docker stop <container_id>

# Remove and restart
docker-compose down
docker-compose up -d
```

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
2. Check [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) for frontend development
3. Check [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) for backend development
4. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API endpoints

## Additional Resources

- [Frontend README](../frontend/README.md)
- [Backend README](../backend/BACKEND_SETUP.md)
- [React Documentation](https://react.dev/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
