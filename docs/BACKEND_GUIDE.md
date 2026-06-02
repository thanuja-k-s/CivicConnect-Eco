# Civic Connect - Backend Development Guide

## Overview

The Civic Connect backend is a Spring Boot REST API that handles authentication, complaint management, user management, and admin operations. It uses PostgreSQL for data persistence and JWT for stateless authentication.

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/civicconnect/
│   │   │   ├── CivicConnectApplication.java    # Spring Boot entry point
│   │   │   │
│   │   │   ├── controller/                     # API Controllers
│   │   │   │   ├── AuthController.java         # /api/auth endpoints
│   │   │   │   ├── ComplaintController.java    # /api/complaints endpoints
│   │   │   │   ├── AdminController.java        # /api/admin endpoints
│   │   │   │   └── UserController.java         # /api/users endpoints
│   │   │   │
│   │   │   ├── service/                        # Business Logic Services
│   │   │   │   ├── AuthService.java            # Authentication logic
│   │   │   │   ├── ComplaintService.java       # Complaint operations
│   │   │   │   ├── UserService.java            # User management
│   │   │   │   ├── AdminService.java           # Admin operations
│   │   │   │   └── NotificationService.java    # Notifications
│   │   │   │
│   │   │   ├── repository/                     # Data Access Layer (JPA)
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ComplaintRepository.java
│   │   │   │   ├── TrackingRepository.java
│   │   │   │   └── NotificationRepository.java
│   │   │   │
│   │   │   ├── entity/                         # JPA Entity Classes
│   │   │   │   ├── User.java                   # User entity
│   │   │   │   ├── Complaint.java              # Complaint entity
│   │   │   │   ├── Tracking.java               # Tracking entity
│   │   │   │   └── Notification.java           # Notification entity
│   │   │   │
│   │   │   ├── dto/                            # Data Transfer Objects
│   │   │   │   ├── UserDTO.java
│   │   │   │   ├── ComplaintDTO.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   └── ApiResponse.java
│   │   │   │
│   │   │   ├── security/                       # Security Configuration
│   │   │   │   ├── SecurityConfig.java         # Spring Security config
│   │   │   │   ├── JwtTokenProvider.java       # JWT token generation
│   │   │   │   ├── JwtAuthenticationFilter.java # JWT filter
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── exception/                      # Custom Exceptions
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── ValidationException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   ├── util/                           # Utility Classes
│   │   │   │   ├── PasswordEncoder.java
│   │   │   │   └── ValidationUtil.java
│   │   │   │
│   │   │   ├── config/                         # Application Configuration
│   │   │   │   ├── CorsConfig.java             # CORS configuration
│   │   │   │   └── SwaggerConfig.java          # Swagger/OpenAPI config
│   │   │   │
│   │   │   └── enums/                          # Enumerations
│   │   │       ├── Role.java                   # User roles
│   │   │       ├── ComplaintStatus.java        # Complaint statuses
│   │   │       ├── ComplaintPriority.java      # Complaint priorities
│   │   │       └── Category.java               # Complaint categories
│   │   │
│   │   └── resources/
│   │       ├── application.properties          # Main configuration
│   │       ├── application-dev.properties      # Dev overrides
│   │       ├── application-prod.properties     # Prod overrides
│   │       └── db/migration/                   # Flyway/Liquibase scripts
│   │
│   └── test/
│       └── java/com/civicconnect/
│           ├── controller/
│           ├── service/
│           └── repository/
│
├── pom.xml                     # Maven configuration
├── Dockerfile                  # Docker image definition
├── BACKEND_SETUP.md            # Setup instructions
└── init_users.sql              # Database initialization
```

## Getting Started

### 1. Prerequisites
- Java 11 or higher
- Maven 3.6+
- PostgreSQL 12+

### 2. Configure Database
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE civic_connect;
```

### 4. Build Backend
```bash
cd backend
mvn clean package
```

### 5. Run Backend
```bash
# Using Maven
mvn spring-boot:run

# Or run the JAR
java -jar target/civic-connect-api.jar
```

Backend will be available at `http://localhost:8081/api`

## Core Components

### 1. Controllers (API Endpoints)

#### AuthController
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    // User registration logic
  }
  
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // User login logic
  }
  
  @PostMapping("/logout")
  public ResponseEntity<?> logout() {
    // Logout logic
  }
}
```

#### ComplaintController
```java
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
  
  @GetMapping
  public ResponseEntity<?> getComplaints() {
    // Get all complaints
  }
  
  @PostMapping
  public ResponseEntity<?> createComplaint(@RequestBody ComplaintDTO dto) {
    // Create new complaint
  }
  
  @GetMapping("/{id}")
  public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
    // Get specific complaint
  }
  
  @PutMapping("/{id}")
  public ResponseEntity<?> updateComplaint(
    @PathVariable Long id,
    @RequestBody ComplaintDTO dto
  ) {
    // Update complaint
  }
  
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
    // Delete complaint
  }
}
```

#### AdminController
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
  
  @GetMapping("/users")
  public ResponseEntity<?> getUsers() {
    // List all users
  }
  
  @PostMapping("/users")
  public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {
    // Create new user
  }
  
  @PutMapping("/users/{id}")
  public ResponseEntity<?> updateUser(
    @PathVariable Long id,
    @RequestBody UserDTO dto
  ) {
    // Update user
  }
  
  @DeleteMapping("/users/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    // Delete user
  }
}
```

### 2. Services (Business Logic)

#### AuthService
```java
@Service
public class AuthService {
  
  public AuthResponse register(RegisterRequest request) {
    // Validate input
    // Hash password with BCrypt
    // Create user entity
    // Save to database
    // Return response
  }
  
  public AuthResponse login(LoginRequest request) {
    // Find user by email
    // Verify password
    // Generate JWT token
    // Return token and user info
  }
  
  public void logout(String token) {
    // Invalidate token (if using token blacklist)
  }
}
```

#### ComplaintService
```java
@Service
public class ComplaintService {
  
  public List<ComplaintDTO> getComplaints(Long userId, String role) {
    // Get complaints based on user role
    // Citizen: own complaints
    // Worker: assigned complaints
    // Admin: all complaints
  }
  
  public ComplaintDTO createComplaint(Long citizenId, ComplaintDTO dto) {
    // Create complaint entity
    // Save to database
    // Return DTO
  }
  
  public ComplaintDTO updateComplaint(Long id, ComplaintDTO dto) {
    // Update complaint status, assignee, etc.
    // Create tracking record
    // Save changes
  }
  
  public void deleteComplaint(Long id) {
    // Delete complaint and related data
  }
}
```

### 3. Entities (Data Models)

#### User Entity
```java
@Entity
@Table(name = "user")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  private String fullName;
  
  @Column(unique = true)
  private String email;
  
  private String phoneNumber;
  
  @Column(name = "password")
  private String passwordHash;
  
  @Enumerated(EnumType.STRING)
  private Role role;
  
  private Boolean isActive;
  
  @CreationTimestamp
  private LocalDateTime createdAt;
}
```

#### Complaint Entity
```java
@Entity
@Table(name = "complaint")
public class Complaint {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  private String title;
  
  private String description;
  
  private String location;
  
  private String category;
  
  @Enumerated(EnumType.STRING)
  private ComplaintPriority priority;
  
  @Enumerated(EnumType.STRING)
  private ComplaintStatus status;
  
  @ManyToOne
  @JoinColumn(name = "citizen_id")
  private User citizen;
  
  @ManyToOne
  @JoinColumn(name = "assigned_to")
  private User assignedWorker;
  
  @CreationTimestamp
  private LocalDateTime createdAt;
  
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
```

### 4. Repositories (Data Access)

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  List<User> findByRole(Role role);
}

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
  List<Complaint> findByCitizen(User citizen);
  List<Complaint> findByAssignedWorker(User worker);
  List<Complaint> findByStatus(ComplaintStatus status);
}
```

## Security

### JWT Authentication Flow

1. User login with credentials
2. Backend validates and generates JWT token
3. Token sent to frontend
4. Frontend includes token in Authorization header
5. Backend validates token on each request

### JWT Token Structure
```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### JWT Configuration
```properties
# application.properties
jwt.secret=your-secret-key-change-this-in-production-environment-12345678901234567890
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Role-Based Access Control (RBAC)
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { }

@PreAuthorize("hasRole('CITIZEN')")
public void reportComplaint(ComplaintDTO dto) { }

@PreAuthorize("hasRole('WORKER') or hasRole('ADMIN')")
public void updateComplaintStatus(Long id, String status) { }
```

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
POST   /api/auth/refresh        - Refresh JWT token
```

### Complaints
```
GET    /api/complaints          - Get complaints (filtered by role)
POST   /api/complaints          - Create complaint
GET    /api/complaints/{id}     - Get complaint details
PUT    /api/complaints/{id}     - Update complaint
DELETE /api/complaints/{id}     - Delete complaint
GET    /api/complaints/{id}/tracking  - Get complaint history
```

### Admin
```
GET    /api/admin/users         - List all users
POST   /api/admin/users         - Create user
GET    /api/admin/users/{id}    - Get user details
PUT    /api/admin/users/{id}    - Update user
DELETE /api/admin/users/{id}    - Delete user
GET    /api/admin/analytics     - System statistics
```

## Data Transfer Objects (DTOs)

### LoginRequest
```java
public class LoginRequest {
  private String email;
  private String password;
}
```

### RegisterRequest
```java
public class RegisterRequest {
  private String fullName;
  private String email;
  private String phoneNumber;
  private String password;
  private String role;  // CITIZEN, WORKER, ADMIN
}
```

### ComplaintDTO
```java
public class ComplaintDTO {
  private Long id;
  private String title;
  private String description;
  private String location;
  private String category;
  private String priority;
  private String status;
  private Long citizenId;
  private Long assignedTo;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
```

### ApiResponse
```java
public class ApiResponse<T> {
  private boolean success;
  private String message;
  private T data;
  private Map<String, String> errors;
}
```

## Configuration

### CORS Configuration
```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:5173", "http://localhost:8080")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .maxAge(3600);
      }
    };
  }
}
```

### Application Properties
```properties
# Server
server.port=8081
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=thanuja
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Logging
logging.level.root=INFO
logging.level.com.civicconnect=DEBUG

# JWT
jwt.secret=your-secret-key-change-this-in-production
jwt.expiration=86400000
```

## Exception Handling

### Custom Exception Classes
```java
public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String message) {
    super(message);
  }
}

public class ValidationException extends RuntimeException {
  public ValidationException(String message) {
    super(message);
  }
}
```

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(404)
      .body(new ApiResponse<>(false, ex.getMessage(), null));
  }
  
  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<?> handleValidation(ValidationException ex) {
    return ResponseEntity.status(400)
      .body(new ApiResponse<>(false, ex.getMessage(), null));
  }
}
```

## Testing

### Unit Tests
```java
@SpringBootTest
public class AuthServiceTest {
  
  @Autowired
  private AuthService authService;
  
  @MockBean
  private UserRepository userRepository;
  
  @Test
  public void testUserRegistration() {
    RegisterRequest request = new RegisterRequest();
    request.setEmail("test@example.com");
    
    // Execute and assert
    assertNotNull(authService.register(request));
  }
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {
  
  @Autowired
  private MockMvc mockMvc;
  
  @Test
  public void testLoginEndpoint() throws Exception {
    mockMvc.perform(post("/api/auth/login")
      .contentType(MediaType.APPLICATION_JSON)
      .content("{\"email\":\"test@example.com\",\"password\":\"password\"}"))
      .andExpect(status().isOk());
  }
}
```

## Build & Deployment

### Build Backend
```bash
mvn clean package
```

### Run Tests
```bash
mvn test
```

### Build Docker Image
```bash
docker build -t civic-connect-backend .
```

### Run Docker Container
```bash
docker run -p 8081:8081 civic-connect-backend
```

## Common Tasks

### Add New Endpoint
1. Create Controller method
2. Create Service method
3. Add Repository query if needed
4. Add DTOs for request/response
5. Write tests
6. Update API documentation

### Add New Database Entity
1. Create Entity class with JPA annotations
2. Create Repository interface
3. Create Service for business logic
4. Create DTO for API
5. Add migrations if using Flyway
6. Update tests

### Fix Database Issues
```bash
# Reset database
psql -U postgres -h localhost -d civic_connect -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize
psql -U postgres -d civic_connect -h localhost -f backend/init_users.sql
```

## Useful Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JPA/Hibernate Documentation](https://hibernate.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Maven Documentation](https://maven.apache.org/guides/)
