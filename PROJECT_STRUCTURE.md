# CivicConnect Eco - Complete Setup Guide

## Project Structure

```
civic-connect-main/
├── frontend/                 # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── Index.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ReportIssue.tsx
│   │   │   ├── TrackComplaint.tsx
│   │   │   └── ...
│   │   ├── services/        # API services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── complaintService.ts
│   │   │   └── ...
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   ├── data/            # Mock data
│   │   ├── lib/             # Utility functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── README.md
│   └── ...
│
├── backend/                  # Spring Boot + PostgreSQL backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/civicconnect/
│   │   │   │   ├── CivicConnectApplication.java  # Main app class
│   │   │   │   ├── controller/                    # REST controllers
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── ComplaintController.java
│   │   │   │   ├── service/                       # Business logic
│   │   │   │   │   ├── UserService.java
│   │   │   │   │   └── ComplaintService.java
│   │   │   │   ├── entity/                        # JPA entities
│   │   │   │   │   ├── User.java
│   │   │   │   │   └── Complaint.java
│   │   │   │   └── repository/                    # Data access
│   │   │   │       ├── UserRepository.java
│   │   │   │       └── ComplaintRepository.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── BACKEND_SETUP.md
│   ├── .gitignore
│   └── ...
│
├── README.md                 # This file
├── package.json
├── package-lock.json
├── bun.lockb
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.js
├── postcss.config.js
├── components.json
└── ...
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/bun
- Java 17+
- Maven 3.8.1+
- PostgreSQL 12+

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

**Frontend runs on:** `http://localhost:5173`

### 2. Backend Setup

Follow the detailed guide in [backend/BACKEND_SETUP.md](backend/BACKEND_SETUP.md)

Quick start:
```bash
cd backend

# Build the project
mvn clean package

# Run the application (runs on port 8081)
mvn spring-boot:run
```

**Backend runs on:** `http://localhost:8081/api`

### 3. Database Setup

PostgreSQL configuration:
```bash
# Create database
createdb civic_connect

# (Optional) Create user
psql -U postgres -d civic_connect -f setup_db.sql
```

## API Endpoints

### User Management
```
GET  /api/users              # Get all users
GET  /api/users/{id}         # Get user by ID
GET  /api/users/email/{email}
POST /api/users              # Create user
PUT  /api/users/{id}         # Update user
DELETE /api/users/{id}       # Delete user
```

### Complaints
```
GET  /api/complaints                          # Get all complaints
GET  /api/complaints/{id}                     # Get by ID
GET  /api/complaints/complaint-id/{complaintId}
GET  /api/complaints/citizen/{citizenId}
GET  /api/complaints/worker/{workerId}
GET  /api/complaints/status/{status}
POST /api/complaints                          # Create complaint
PUT  /api/complaints/{id}                     # Update complaint
POST /api/complaints/{id}/assign/{workerId}   # Assign worker
POST /api/complaints/{id}/resolve             # Mark resolved
DELETE /api/complaints/{id}
```

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **State Management:** React Context + React Query

### Backend
- **Framework:** Spring Boot 3.2
- **Language:** Java 17
- **Database:** PostgreSQL
- **ORM:** JPA/Hibernate
- **Build:** Maven
- **Security:** Spring Security + JWT
- **API Documentation:** Swagger/OpenAPI (optional)

## Development Workflow

### Frontend Development
```bash
# Development server with hot reload
npm run dev

# Run linter
npm run lint

# Type checking (included in IDE)
```

### Backend Development
```bash
# Run with hot reload
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=create-drop"

# Run tests
mvn test

# Check code quality
mvn clean verify
```

## Features

### Citizen Features
- Register/Login
- Report civic issues with photos
- Track complaint status in real-time
- View complaint history
- Filter by category/status

### Worker Features
- Accept assigned complaints
- Update complaint status
- Add resolution notes
- View assigned complaints dashboard

### Admin Features
- Dashboard with statistics
- Manage all complaints
- Assign workers to complaints
- View user management
- Monitor complaint resolution rate

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8081/api
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=your-secret-key
```

## Common Issues & Solutions

### Backend won't start
- Ensure PostgreSQL is running
- Check if port 8081 is available
- Verify database exists

### CORS errors
- Check backend CORS configuration in `CivicConnectApplication.java`
- Ensure frontend URL is in allowed origins

### Database connection error
- Verify PostgreSQL credentials
- Check database name: `civic_connect`
- Ensure PostgreSQL service is running

## File Upload Setup (Optional)

To enable complaint photo uploads, add multipart configuration:

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

## Testing

### Frontend Tests
```bash
npm run test
npm run test:watch
```

### Backend Tests
```bash
mvn test
```

## Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to any static hosting
```

### Backend
```bash
mvn clean package
java -jar target/civic-connect-backend-1.0.0.jar
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Open Pull Request

## License

This project is developed for civic engagement and open for contributions.

## Support

For issues and questions, check respective README files:
- Frontend: See project documentation
- Backend: See [backend/BACKEND_SETUP.md](backend/BACKEND_SETUP.md)
