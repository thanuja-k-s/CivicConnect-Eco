# CivicConnect Eco

A modern full-stack web application for managing citizen complaints, eco events, volunteer participation, notifications, and municipal civic issues. Built with React, TypeScript, Spring Boot, and PostgreSQL.

## 🎯 Overview

CivicConnect Eco streamlines civic and environmental engagement by providing:
- **Citizens**: Easy-to-use interface to report issues and track their status
- **Workers**: Dashboard to manage and resolve assigned complaints
- **Admins**: System-wide oversight, user management, and analytics
- **NGOs and eco clubs**: Tools to register organizations, create events, and engage volunteers

## 🏗️ Project Structure

```
civic-connect/
├── frontend/                  # React + TypeScript frontend application
├── backend/                   # Spring Boot REST API
├── docs/                      # Comprehensive documentation
├── docker-compose.yml         # Multi-container orchestration
├── .env.example               # Environment template
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ & npm/bun
- **Java** 11+ & Maven 3.6+
- **PostgreSQL** 12+
- **Docker & Docker Compose** (optional)

### Option 1: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

### Option 2: Local Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

#### Backend
```bash
cd backend
# Configure database in application.properties
mvn spring-boot:run
# Access at http://localhost:8081/api
```

#### Database
```bash
# Create database
psql -U postgres -h localhost
CREATE DATABASE civic_connect;

# Initialize default users using the SQL block in docs/SETUP_GUIDE.md
```

## � API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Complaints
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/{id}` - Get complaint details
- `PUT /api/complaints/{id}` - Update complaint
- `DELETE /api/complaints/{id}` - Delete complaint

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/analytics` - System analytics

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete endpoint documentation.

## 🚢 Deployment

### Docker Containers
```bash
# Build backend
docker build -f backend/Dockerfile -t civic-connect-backend .

# Build frontend
docker build -f frontend/Dockerfile.frontend -t civic-connect-frontend .

# Run with docker-compose
docker-compose up -d
```

### Ports
- Frontend: http://localhost:8080 (Docker) or http://localhost:5173 (dev)
- Backend API: http://localhost:8081/api
- Database: localhost:5432

### Environment Variables
Copy and configure `.env.example`:
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
JWT_SECRET=your-secret-key-change-this
SERVER_PORT=8081
```

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: BCrypt for secure password storage
- **CORS Configuration**: Restricted cross-origin access
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Server-side validation on all endpoints
- **HTTPS Ready**: Configure SSL/TLS in production

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
mvn test
```

## 📈 Project Statistics

- **Frontend**: ~2000 lines of TypeScript/React
- **Backend**: ~3000 lines of Java/Spring Boot
- **Database**: PostgreSQL with 4 main tables
- **API Endpoints**: 15+ REST endpoints
- **Test Coverage**: Component and unit tests

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check connection string in `application.properties`
- Verify database exists

**Dependencies Won't Install**
```bash
rm -rf node_modules package-lock.json
npm install
```

For more troubleshooting, see [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md#troubleshooting).

## 📞 User Roles

### Citizen
- Register and create account
- Report new complaints
- Track complaint status
- View personal history
- Receive updates

### Worker
- View assigned complaints
- Update status
- Add work notes
- Escalate if needed
- View dashboard

### Admin
- Manage all users
- Assign complaints
- View analytics
- Monitor system
- Manage roles

## 🔄 Development Workflow

1. Clone the repository
2. Configure environment variables
3. Run `docker-compose up` or follow local setup
4. Make changes in `frontend/` or `backend/`
5. Test changes
6. Commit to version control

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Spring Boot, Java, Maven |
| **Database** | PostgreSQL, Hibernate ORM |
| **Authentication** | JWT, Spring Security |
| **DevOps** | Docker, Docker Compose |
| **Testing** | Vitest, JUnit 5, Mockito |

## 🤝 Contributing

1. Follow the coding standards outlined in respective guides
2. Write tests for new features
3. Ensure all tests pass
4. Create detailed commit messages
5. Submit pull requests with documentation

## 📄 License

This project is provided as-is for educational and commercial use.

## 📞 Support

For detailed information on specific components:
- **Frontend issues**: See [FRONTEND_GUIDE.md](./docs/FRONTEND_GUIDE.md)
- **Backend issues**: See [BACKEND_GUIDE.md](./docs/BACKEND_GUIDE.md)
- **Setup problems**: See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
- **API questions**: See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Docker Documentation](https://docs.docker.com/)

---

**Last Updated**: January 2024  
**Version**: 1.0.0

For the complete setup process, start with [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md).

## 🎨 Frontend

**Technology Stack:**
- React 18+ with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- shadcn/ui for components
- Vitest for testing

**Key Features:**
- User authentication with JWT
- Role-based dashboards (Citizen, Worker, Admin)
- Complaint reporting and tracking
- Real-time status updates
- Responsive mobile-friendly design

**Development:**
```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code
```

## 🔧 Backend

**Technology Stack:**
- Spring Boot 3.x
- Java 11+
- PostgreSQL
- Spring Security with JWT
- Hibernate ORM

**Key Features:**
- RESTful API with comprehensive endpoints
- JWT-based authentication
- Role-based access control
- Complaint management system
- Admin analytics
- CORS-enabled API

**Development:**
```bash
cd backend
mvn clean package    # Build project
mvn spring-boot:run  # Run application
mvn test             # Run tests
```

## 📊 Default Credentials

Test with these credentials in the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password |
| Worker | worker@demo.com | password |
| Citizen | citizen@demo.com | password |

⚠️ **Change these in production!**
