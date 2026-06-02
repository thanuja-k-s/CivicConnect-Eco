# Civic Connect - Full Stack Application

A comprehensive full-stack application for citizens to report and track civic issues (road damage, garbage, water supply, drainage, streetlights, etc.) in real-time. Features include citizen reporting, worker assignment, and admin dashboard for oversight.

## 🎯 Overview

Civic Connect is built with modern web technologies:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Spring Boot 3.2 + Java 17 + PostgreSQL
- **Database:** PostgreSQL

## 📁 Project Structure

```
civic-connect-main/
├── src/                          # Frontend source (React + TypeScript)
│   ├── components/               # UI components
│   ├── pages/                    # Page components
│   ├── services/                 # API services
│   ├── context/                  # React Context
│   └── ...
├── backend/                      # Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/civicconnect/
│   │   │   ├── controller/       # REST API endpoints
│   │   │   ├── service/          # Business logic
│   │   │   ├── entity/           # JPA entities
│   │   │   └── repository/       # Data access
│   │   └── resources/
│   ├── pom.xml
│   └── BACKEND_SETUP.md
├── public/                       # Static assets
├── package.json
├── vite.config.ts
├── docker-compose.yml
└── PROJECT_STRUCTURE.md          # Detailed structure guide
```

## 🚀 Quick Start

### Option 1: Local Development

#### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8.1+
- PostgreSQL 12+

#### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

#### Backend Setup

```bash
cd backend

# Create PostgreSQL database
# psql -U postgres -c "CREATE DATABASE civic_connect;"

# Build and run (http://localhost:8081/api)
mvn clean package
mvn spring-boot:run
```

For detailed backend setup, see [backend/BACKEND_SETUP.md](backend/BACKEND_SETUP.md).

### Option 2: Docker Compose (Recommended)

```bash
# Start all services (frontend, backend, PostgreSQL)
docker-compose up -d

# Access the application:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8081/api
# Database: localhost:5432 (postgres/postgres)
```

## 📚 API Documentation

### Base URL
`http://localhost:8081/api`

### User Endpoints
```
GET    /users                  # Get all users
GET    /users/{id}             # Get user by ID
GET    /users/email/{email}    # Get user by email
POST   /users                  # Create user
PUT    /users/{id}             # Update user
DELETE /users/{id}             # Delete user
```

### Complaint Endpoints
```
GET    /complaints                              # Get all complaints
GET    /complaints/{id}                         # Get by ID
GET    /complaints/complaint-id/{complaintId}   # Track complaint
GET    /complaints/citizen/{citizenId}          # Citizen's complaints
GET    /complaints/worker/{workerId}            # Worker's assignments
GET    /complaints/status/{status}              # Filter by status
POST   /complaints                              # Create complaint
PUT    /complaints/{id}                         # Update complaint
POST   /complaints/{id}/assign/{workerId}       # Assign worker
POST   /complaints/{id}/resolve                 # Mark resolved
DELETE /complaints/{id}                         # Delete complaint
```

## 🔧 Environment Configuration

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8081/api
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=postgres
server.port=8081
jwt.secret=your-secret-key-here
```

## ✨ Features

### 👤 Citizen Features
- User registration and authentication
- Submit civic issue reports with:
  - Issue category (Road, Garbage, Water, etc.)
  - Description and location
  - Photo attachment
  - Real-time status tracking
- View complaint history
- Track complaint progress

### 🔧 Worker Features
- View assigned complaints
- Update complaint status
- Add resolution notes
- Dashboard with assigned tasks
- Mark complaints as resolved

### 👨‍💼 Admin Features
- Complete dashboard with statistics
- Manage all complaints
- Assign workers to complaints
- User management
- View complaint resolution trends
- System-wide monitoring

## 🏗️ Architecture

### Frontend Architecture
- Component-based UI with React
- Form handling with React Hook Form + Zod
- State management with React Context
- HTTP client with Axios
- Styling with Tailwind CSS + shadcn/ui

### Backend Architecture
- Spring Boot REST API
- JPA/Hibernate ORM
- Spring Data Repositories
- Service layer for business logic
- Controller layer for HTTP handling
- PostgreSQL database

## 🔐 Security Features
- JWT token-based authentication
- Password hashing with Spring Security
- CORS configuration
- Input validation
- SQL injection prevention with parameterized queries

## 📦 Dependencies

### Frontend
- react: 18.3.1
- react-router-dom: 6.30.1
- axios: 1.13.5
- tailwindcss: 3.4.17
- shadcn/ui: Latest
- react-hook-form: 7.61.1
- zod: 3.25.76

### Backend
- Spring Boot: 3.2.0
- Spring Data JPA
- PostgreSQL: 42.7.2
- Lombok
- JWT: 0.12.3

## 🧪 Testing

### Frontend
```bash
npm run test              # Run tests once
npm run test:watch       # Run tests in watch mode
```

### Backend
```bash
cd backend
mvn test                 # Run unit tests
mvn integration-test     # Run integration tests
```

## 📝 Development Guide

### Adding New Features

1. **Frontend:**
   - Add component in `src/components/`
   - Create new page in `src/pages/`
   - Add service in `src/services/`
   - Create types in `src/types/`

2. **Backend:**
   - Create entity in `entity/`
   - Create repository in `repository/`
   - Create service in `service/`
   - Create controller in `controller/`

### Code Style
- Frontend: ESLint configuration in `eslint.config.js`
- Backend: Google Java Style Guide
- Consistent naming conventions across both

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties (backend) or vite.config.ts (frontend)
```

### Database Connection Error
```bash
# Ensure PostgreSQL is running
# Check credentials in application.properties
psql -U postgres -d civic_connect
```

### CORS Issues
- Verify frontend URL is in backend CORS config
- Check `CivicConnectApplication.java` allowed origins

### Build Errors
```bash
# Frontend
npm install --force

# Backend
mvn clean install -DskipTests
```

## 📖 Documentation

- [Full Project Structure](PROJECT_STRUCTURE.md)
- [Backend Setup Guide](backend/BACKEND_SETUP.md)
- [API Reference](PROJECT_STRUCTURE.md#api-endpoints)

## 📄 Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- password
- fullName
- phoneNumber
- role (CITIZEN, WORKER, ADMIN)
- address
- isActive
- createdAt, updatedAt

### Complaints Table
- id (Primary Key)
- complaintId (Unique, e.g., CMP-001)
- citizenId (Foreign Key)
- title
- description
- category
- status
- address
- latitude, longitude
- photoUrl
- assignedWorkerId (Foreign Key)
- resolutionNotes
- createdAt, updatedAt

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
```

### Backend
```bash
cd backend
mvn clean package
java -jar target/civic-connect-backend-1.0.0.jar
```

### Using Docker
```bash
docker-compose up -d --build
```

## 📄 License

This project is open source and available under MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Reference [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for setup help

---

**Started:** February 2026  
**Version:** 1.0.0  
**Status:** Active Development

The `backend/` folder is empty and ready for Java Spring Boot development with PostgreSQL database integration.

**To be implemented:**
- Spring Boot REST API
- PostgreSQL database
- Authentication & Authorization
- Complaint management endpoints
- Worker management endpoints

## Key Features

- **Report Issues**: Citizens can report civic issues with photos, location, and category
- **Track Complaints**: Real-time tracking of complaint status
- **Admin Dashboard**: Manage complaints and assign workers
- **Worker Dashboard**: View and update assigned complaints
- **Status Badges**: Visual status indicators (Pending, In Progress, Resolved)
- **Category Support**: Road, Garbage, Water, Drainage, Streetlight, Illegal Dumping

## Environment Variables

Create a `.env` file in the frontend folder with:
```
VITE_API_URL=http://localhost:8080/api
```

## Deployment

Build the frontend for production:
```sh
npm run build
```

The build output will be in the `dist/` folder.

---

For more information, check the `setup/` folder for additional configuration documentation.
