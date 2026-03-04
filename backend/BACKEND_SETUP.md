# Backend Setup Guide

## Prerequisites
- Java 17 or higher
- Maven 3.8.1 or higher
- PostgreSQL 12 or higher

## Database Setup

### 1. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE civic_connect;

-- Create user (optional, if you want a separate user)
CREATE USER civic_user WITH PASSWORD 'secure_password';
ALTER ROLE civic_user SET client_encoding TO 'utf8';
ALTER ROLE civic_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE civic_user SET default_transaction_deferrable TO on;
ALTER ROLE civic_user SET default_transaction_read_only TO off;
ALTER ROLE civic_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE civic_connect TO civic_user;
```

### 2. Update Database Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/civic_connect
spring.datasource.username=postgres
spring.datasource.password=postgres
```

Update with your PostgreSQL credentials.

## Building and Running

### 1. Build the Project

```bash
cd backend
mvn clean package
```

### 2. Run the Application

**Using Maven:**
```bash
mvn spring-boot:run
```

**Using Maven Plugin:**
```bash
mvn clean package
java -jar target/civic-connect-backend-1.0.0.jar
```

### 3. Verify the Application

The application will start on `http://localhost:8081`

Check if it's running:
```bash
curl http://localhost:8081/api/users
```

## API Endpoints

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/role/{role}` - Get users by role
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Complaint Endpoints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/{id}` - Get complaint by ID
- `GET /api/complaints/complaint-id/{complaintId}` - Get complaint by complaint ID (e.g., CMP-001)
- `GET /api/complaints/citizen/{citizenId}` - Get complaints by citizen
- `GET /api/complaints/worker/{workerId}` - Get complaints assigned to worker
- `GET /api/complaints/status/{status}` - Get complaints by status
- `GET /api/complaints/category/{category}` - Get complaints by category
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/{id}` - Update complaint
- `POST /api/complaints/{complaintId}/assign/{workerId}` - Assign worker to complaint
- `POST /api/complaints/{complaintId}/resolve` - Mark complaint as resolved
- `DELETE /api/complaints/{id}` - Delete complaint

## Project Structure

```
backend/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/civicconnect/
│   │   │   ├── CivicConnectApplication.java
│   │   │   ├── controller/
│   │   │   │   ├── UserController.java
│   │   │   │   └── ComplaintController.java
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   └── ComplaintService.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   └── Complaint.java
│   │   │   └── repository/
│   │   │       ├── UserRepository.java
│   │   │       └── ComplaintRepository.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── README.md
```

## Common Issues

### Issue: Connection refused
**Solution:** Make sure PostgreSQL is running on `localhost:5432`

### Issue: Port 8081 already in use
**Solution:** Change port in `application.properties`:
```properties
server.port=8082
```

### Issue: Database not found
**Solution:** Create the database using the SQL commands above

## Development Tips

1. **Hot Reload**: For development, use:
   ```bash
   mvn spring-boot:run
   ```

2. **Database Reset**: Drop and recreate tables by setting:
   ```properties
   spring.jpa.hibernate.ddl-auto=create-drop
   ```
   (Only for development!)

3. **Check Logs**: Monitor application logs at:
   ```
   DEBUG level for com.civicconnect
   TRACE level for Hibernate SQL
   ```

## Security Notes

- Change JWT secret in `application.properties` before production
- Use environment variables for sensitive data
- Update CORS origins for your production domain

## Next Steps

1. Implement authentication/authorization with Spring Security
2. Add file upload functionality for complaint photos
3. Add email notifications
4. Implement admin dashboard features
5. Add comprehensive unit and integration tests
