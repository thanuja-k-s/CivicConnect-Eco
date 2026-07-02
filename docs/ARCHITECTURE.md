# CivicConnect Eco - Architecture Documentation

## System Overview

CivicConnect Eco is a full-stack web application designed to streamline citizen complaint management, eco event coordination, volunteer participation, and municipal issue tracking. It follows a modern layered architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER LAYER                                  │
│                   (Browser / Web Client)                             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                               │
│                    (Frontend - React/TypeScript)                    │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Components:                                              │       │
│  │ - Login/Register (Authentication)                       │       │
│  │ - Dashboard (Citizen/Admin/Worker)                      │       │
│  │ - Report Issue Form                                     │       │
│  │ - Complaint Tracking                                    │       │
│  │ - Status Management                                     │       │
│  └──────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ State Management:                                        │       │
│  │ - React Context API (AuthContext)                       │       │
│  │ - Local Component State                                 │       │
│  └──────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Services:                                                │       │
│  │ - authService.ts   (JWT auth, login/register)          │       │
│  │ - complaintService.ts (CRUD operations)                │       │
│  │ - adminService.ts    (Admin operations)                │       │
│  │ - workerService.ts   (Worker operations)               │       │
│  └──────────────────────────────────────────────────────────┘       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ JSON/REST (Port 8081)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Gateway)                             │
│              (Spring Boot - REST Endpoints)                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Controllers:                                             │       │
│  │ - AuthController (/api/auth)                            │       │
│  │ - ComplaintController (/api/complaints)                 │       │
│  │ - AdminController (/api/admin)                          │       │
│  │ - UserController (/api/users)                           │       │
│  └──────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Security:                                                │       │
│  │ - JWT Authentication                                    │       │
│  │ - Role-based Authorization (RBAC)                       │       │
│  │ - CORS Configuration                                    │       │
│  └──────────────────────────────────────────────────────────┘       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ SQL (JDBC)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                             │
│                      (Spring Services)                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Services:                                                │       │
│  │ - AuthService (Authentication & JWT)                    │       │
│  │ - ComplaintService (Complaint Management)              │       │
│  │ - UserService (User Management)                         │       │
│  │ - AdminService (Admin Operations)                       │       │
│  │ - NotificationService (Alerts & Updates)               │       │
│  └──────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Utilities:                                               │       │
│  │ - JWT Token Generation/Validation                       │       │
│  │ - Password Hashing (BCrypt)                             │       │
│  │ - Data Mapping & Conversion                             │       │
│  └──────────────────────────────────────────────────────────┘       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Repository)                         │
│                (Spring Data JPA / Hibernate)                         │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Repositories:                                            │       │
│  │ - UserRepository                                         │       │
│  │ - ComplaintRepository                                    │       │
│  │ - TrackingRepository                                     │       │
│  └──────────────────────────────────────────────────────────┘       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ PostgreSQL Protocol
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                                   │
│                  (PostgreSQL Database)                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Tables:                                                  │       │
│  │ - users          (User accounts & profiles)            │       │
│  │ - complaints     (Issue complaints)                    │       │
│  │ - tracking      (Complaint status updates)            │       │
│  │ - notifications (User notifications)                  │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Framework** | React 18+ |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **State Management** | React Context API |
| **HTTP Client** | Fetch API / Axios |
| **Testing** | Vitest |

### Backend
| Component | Technology |
|-----------|-----------|
| **Language** | Java |
| **Framework** | Spring Boot 3.x |
| **Build Tool** | Maven |
| **Database ORM** | Hibernate (JPA) |
| **Security** | Spring Security + JWT |
| **API Documentation** | Swagger/OpenAPI |
| **Testing** | JUnit 5, Mockito |

### Database
| Component | Technology |
|-----------|-----------|
| **DBMS** | PostgreSQL 12+ |
| **Connection Pool** | HikariCP |
| **Migration** | Hibernate DDL |

### DevOps
| Component | Technology |
|-----------|-----------|
| **Containerization** | Docker |
| **Orchestration** | Docker Compose |
| **Version Control** | Git |

## Design Patterns

### Frontend
- **Component-Based Architecture**: Modular, reusable React components
- **Context API Pattern**: Global state management for authentication
- **Service Layer Pattern**: Centralized API communication
- **Custom Hooks**: Reusable logic (use-mobile, use-toast)
- **Layout Pattern**: Consistent page structure via Layout component

### Backend
- **MVC Pattern**: Controllers → Services → Repositories
- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Dependency Injection**: Spring IoC container
- **DTO Pattern**: Data Transfer Objects for API payloads

## User Roles & Permissions

### 1. **Citizen**
- Register and create account
- Report new complaints/issues
- Track complaint status
- View personal complaint history
- Receive status updates

### 2. **Worker**
- View assigned complaints
- Update complaint status
- Add work notes/progress
- Escalate issues if needed
- View worker dashboard

### 3. **Admin**
- Manage all users (create, edit, delete)
- Assign complaints to workers
- View system-wide analytics
- Monitor all complaints
- Manage user roles
- Access admin dashboard

## Data Models

### User Table
```
user {
  id: SERIAL PRIMARY KEY
  full_name: VARCHAR(255)
  email: VARCHAR(255) UNIQUE
  phone_number: VARCHAR(20)
  password: VARCHAR(255)
  role: ENUM('CITIZEN', 'WORKER', 'ADMIN')
  is_active: BOOLEAN
  created_at: TIMESTAMP
}
```

### Complaint Table
```
complaint {
  id: SERIAL PRIMARY KEY
  citizen_id: FOREIGN KEY -> user.id
  title: VARCHAR(255)
  description: TEXT
  location: VARCHAR(255)
  category: VARCHAR(100)
  priority: ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
  status: ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
  assigned_to: FOREIGN KEY -> user.id (worker)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Tracking Table
```
tracking {
  id: SERIAL PRIMARY KEY
  complaint_id: FOREIGN KEY -> complaint.id
  old_status: VARCHAR(50)
  new_status: VARCHAR(50)
  updated_by: FOREIGN KEY -> user.id
  notes: TEXT
  updated_at: TIMESTAMP
}
```

## API Endpoints Structure

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
POST   /api/auth/refresh      - Refresh JWT token
```

### Complaints
```
GET    /api/complaints        - List complaints
POST   /api/complaints        - Create complaint
GET    /api/complaints/{id}   - Get complaint details
PUT    /api/complaints/{id}   - Update complaint
DELETE /api/complaints/{id}   - Delete complaint
```

### Admin
```
GET    /api/admin/users       - List all users
POST   /api/admin/users       - Create user
PUT    /api/admin/users/{id}  - Update user
DELETE /api/admin/users/{id}  - Delete user
GET    /api/admin/analytics   - System analytics
```

## Authentication & Security

### JWT Token Flow
```
1. User submits login credentials
2. Backend validates credentials against bcrypt hash
3. Backend generates JWT token (header.payload.signature)
4. Frontend stores token in localStorage/sessionStorage
5. Frontend includes token in Authorization header for subsequent requests
6. Backend validates token signature on each request
7. Token expires after configured duration (24 hours default)
```

### Security Features
- **Password Hashing**: BCrypt for password storage
- **JWT Tokens**: Stateless authentication
- **CORS Configuration**: Restricted cross-origin requests
- **Role-Based Access Control (RBAC)**: Method-level authorization
- **Input Validation**: Server-side validation on all endpoints

## Error Handling

### HTTP Status Codes
| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email |
| 500 | Server Error | Internal error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific error message"
  }
}
```

## Scalability Considerations

### Current Architecture
- Monolithic backend (single Spring Boot application)
- Session-less authentication (stateless design)
- Horizontal scaling via Docker replicas

### Future Enhancements
- Microservices decomposition (Auth, Complaints, Admin services)
- Caching layer (Redis) for frequently accessed data
- Message queue (RabbitMQ/Kafka) for async notifications
- Load balancing (Nginx) for traffic distribution
- Database replication for high availability
- CDN for static frontend assets

## Deployment Architecture

### Development
- Frontend: `npm run dev` (Vite dev server)
- Backend: `mvn spring-boot:run` (Maven)
- Database: Docker PostgreSQL or local installation

### Production (Docker Compose)
- Frontend: Static build served via Nginx
- Backend: Docker container with Spring Boot
- Database: Docker PostgreSQL with persistent volume
- All services managed by docker-compose.yml

## Performance Optimization

### Frontend
- **Code Splitting**: Route-based lazy loading
- **Bundling**: Vite optimizes during build
- **Image Optimization**: Lazy loading images
- **CSS Framework**: Tailwind purges unused styles
- **Component Memoization**: React.memo for expensive renders

### Backend
- **Connection Pooling**: HikariCP with 10 connections
- **Batch Processing**: JDBC batch inserts/updates
- **Query Optimization**: Indexed database fields
- **Caching**: Spring Cache annotations (future)
- **Lazy Loading**: Hibernate relationships

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (npm, mvn)
3. Configure environment variables
4. Start backend: `mvn spring-boot:run`
5. Start frontend: `npm run dev`
6. Access: http://localhost:5173

### Docker Development
1. Clone repository
2. Configure `.env`
3. Run: `docker-compose up`
4. Access: http://localhost:8080

## Monitoring & Logging

### Frontend
- Browser console for errors
- Network tab for API calls
- React DevTools for component state

### Backend
- Application logs (INFO, DEBUG levels)
- Hibernate SQL logging
- HTTP request/response logging
- Custom metrics in logs

### Database
- PostgreSQL logs
- Connection pool monitoring
- Query performance analysis

---

For more details on specific components, see:
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
