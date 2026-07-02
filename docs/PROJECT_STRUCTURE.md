# Civic Connect - Project Structure

## Directory Overview

```
civic-connect/
├── frontend/                          # React + TypeScript frontend application
│   ├── src/
│   │   ├── components/                # Reusable React components
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API service calls
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── context/                   # React Context for state management
│   │   ├── types/                     # TypeScript type definitions
│   │   ├── lib/                       # Utility functions
│   │   ├── data/                      # Mock data
│   │   ├── assets/                    # Static assets
│   │   ├── App.tsx                    # Main App component
│   │   └── main.tsx                   # Entry point
│   ├── public/                        # Static public files
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── Dockerfile.frontend            # Docker image for frontend
│   └── README.md                      # Frontend-specific setup
│
├── backend/                           # Spring Boot Java backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/                  # Java source code
│   │   │   └── resources/             # Configuration files, application.properties
│   │   └── test/                      # Test files
│   ├── pom.xml                        # Maven configuration
│   ├── Dockerfile                     # Docker image for backend
│   ├── BACKEND_SETUP.md               # Backend setup instructions
│   └── SQL seed instructions          # Database initialization script
│
├── docs/                              # Documentation
│   ├── PROJECT_STRUCTURE.md           # This file
│   ├── SETUP_GUIDE.md                 # How to set up the entire project
│   ├── ARCHITECTURE.md                # Architecture overview and diagrams
│   ├── API_DOCUMENTATION.md           # API endpoints and usage
│   ├── FRONTEND_GUIDE.md              # Frontend development guide
│   └── BACKEND_GUIDE.md               # Backend development guide
│
├── docker-compose.yml                 # Multi-container Docker configuration
├── .github/                           # GitHub workflows
├── .env.example                       # Environment variables template
├── README.md                          # Main project README (entry point)
├── .gitignore                         # Git ignore rules
└── package.json                       # Root package.json (if needed for monorepo)
```

## Key Directories Explained

### Frontend (`frontend/`)
- **React + TypeScript** application built with Vite
- **Component-based** UI structure using shadcn/ui components
- **State management** via React Context API
- **Styling** with Tailwind CSS
- **API integration** with backend services

### Backend (`backend/`)
- **Spring Boot** microservice for API
- **PostgreSQL** database integration via JPA/Hibernate
- **JWT authentication** for security
- **RESTful API** endpoints
- **Maven** for dependency management

### Database
- **PostgreSQL** running in Docker
- Initialized with the SQL seed instructions documented in `docs/SETUP_GUIDE.md`
- Configured in `docker-compose.yml`

### Configuration Files
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates frontend, backend, and database services |
| `.env.example` | Template for environment variables |
| `frontend/vite.config.ts` | Frontend build configuration |
| `backend/pom.xml` | Backend Maven dependencies |
| `backend/src/main/resources/application.properties` | Backend Spring Boot configuration |

## How They Work Together

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                      │
└────────────────────┬────────────────────────────────┘
                     │
         HTTP/HTTPS  │ Port 8080 (Frontend)
                     ▼
┌─────────────────────────────────────────────────────┐
│            Frontend (React + TypeScript)             │
│  - src/pages/                                       │
│  - src/components/                                  │
│  - src/services/ (API calls)                        │
└────────────────────┬────────────────────────────────┘
                     │
         JSON/REST   │ Port 8081 (/api)
                     ▼
┌─────────────────────────────────────────────────────┐
│           Backend (Spring Boot Java)                 │
│  - REST API endpoints                               │
│  - Authentication & Authorization                   │
│  - Business logic                                   │
└────────────────────┬────────────────────────────────┘
                     │
        JDBC/SQL     │ Port 5432
                     ▼
┌─────────────────────────────────────────────────────┐
│          Database (PostgreSQL)                       │
│  - civic_connect database                           │
│  - Users, Complaints, Tracking data                │
└─────────────────────────────────────────────────────┘
```

## Related Files by Purpose

### User Authentication
- `frontend/src/services/authService.ts` - Frontend auth logic
- `frontend/src/context/AuthContext.tsx` - Auth state management
- `frontend/src/pages/Login.tsx` - Login page
- `backend/src/main/java/.../AuthController.java` - Backend auth endpoints

### Complaint Management
- `frontend/src/pages/ReportIssue.tsx` - Report complaint UI
- `frontend/src/services/complaintService.ts` - API calls
- `frontend/src/pages/ComplaintDetails.tsx` - View complaint details
- `backend/src/main/java/.../ComplaintService.java` - Business logic

### Dashboard Views
- `frontend/src/pages/CitizenDashboard.tsx` - Citizen view
- `frontend/src/pages/AdminDashboard.tsx` - Admin view
- `frontend/src/pages/WorkerDashboard.tsx` - Worker view

---

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

**For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)**
