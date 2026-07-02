# CivicConnect Eco - API Documentation

Complete documentation for all REST API endpoints in CivicConnect Eco.

## Base URL

```
http://localhost:8081/api
```

## Authentication

All endpoints (except login/register) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

---

## Authentication Endpoints

### Register User
Create a new user account.

```
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "password": "SecurePassword123",
  "role": "CITIZEN"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "role": "CITIZEN",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `400`: Invalid email format or weak password
- `409`: Email already exists

---

### Login User
Authenticate and get JWT token.

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "CITIZEN",
      "isActive": true
    }
  }
}
```

**Possible Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### Logout User
Invalidate current session.

```
POST /auth/logout
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### Refresh Token
Get a new JWT token using current token.

```
POST /auth/refresh
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Complaint Endpoints

### Get All Complaints
Retrieve list of complaints based on user role.

```
GET /complaints
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `page` (optional, default: 0): Page number
- `size` (optional, default: 10): Page size

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaints retrieved",
  "data": [
    {
      "id": 1,
      "title": "Broken Street Light",
      "description": "Street light near market is not working",
      "location": "Main Market, Street 5",
      "category": "Infrastructure",
      "priority": "HIGH",
      "status": "OPEN",
      "citizenId": 2,
      "assignedTo": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Notes:**
- Citizens see their own complaints
- Workers see complaints assigned to them
- Admins see all complaints

---

### Create Complaint
File a new complaint.

```
POST /complaints
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Broken Street Light",
  "description": "Street light near market is not working for 2 weeks",
  "location": "Main Market, Street 5",
  "category": "Infrastructure",
  "priority": "HIGH"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {
    "id": 1,
    "title": "Broken Street Light",
    "description": "Street light near market is not working for 2 weeks",
    "location": "Main Market, Street 5",
    "category": "Infrastructure",
    "priority": "HIGH",
    "status": "OPEN",
    "citizenId": 2,
    "assignedTo": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `400`: Invalid input (missing required fields)
- `401`: Not authenticated

---

### Get Complaint Details
Retrieve specific complaint information.

```
GET /complaints/{complaintId}
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint retrieved",
  "data": {
    "id": 1,
    "title": "Broken Street Light",
    "description": "Street light near market is not working",
    "location": "Main Market, Street 5",
    "category": "Infrastructure",
    "priority": "HIGH",
    "status": "OPEN",
    "citizenId": 2,
    "citizen": {
      "id": 2,
      "fullName": "Jane Citizen",
      "email": "citizen@example.com"
    },
    "assignedTo": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `404`: Complaint not found
- `403`: Access denied (citizen cannot view others' complaints)

---

### Update Complaint
Modify complaint details or status.

```
PUT /complaints/{complaintId}
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "assignedTo": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "data": {
    "id": 1,
    "title": "Broken Street Light",
    "description": "Street light near market is not working",
    "location": "Main Market, Street 5",
    "category": "Infrastructure",
    "priority": "MEDIUM",
    "status": "IN_PROGRESS",
    "citizenId": 2,
    "assignedTo": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

**Allowed Updates by Role:**
- **Citizen**: Cannot update status or assignment
- **Worker**: Can update status and add notes
- **Admin**: Can update any field

---

### Delete Complaint
Remove a complaint.

```
DELETE /complaints/{complaintId}
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint deleted successfully",
  "data": null
}
```

**Possible Errors:**
- `404`: Complaint not found
- `403`: Only citizen or admin can delete

---

### Get Complaint Tracking
View status history of a complaint.

```
GET /complaints/{complaintId}/tracking
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tracking history retrieved",
  "data": [
    {
      "id": 1,
      "complaintId": 1,
      "oldStatus": null,
      "newStatus": "OPEN",
      "updatedBy": {
        "id": 2,
        "fullName": "Jane Citizen"
      },
      "notes": "Complaint filed",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "complaintId": 1,
      "oldStatus": "OPEN",
      "newStatus": "IN_PROGRESS",
      "updatedBy": {
        "id": 3,
        "fullName": "John Worker"
      },
      "notes": "Assigned to maintenance team",
      "updatedAt": "2024-01-15T11:45:00Z"
    }
  ]
}
```

---

## User Endpoints

### Get Current User
Retrieve authenticated user's profile.

```
GET /users/me
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": 2,
    "fullName": "Jane Citizen",
    "email": "citizen@example.com",
    "phoneNumber": "9876543210",
    "role": "CITIZEN",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

---

### Update User Profile
Modify user information.

```
PUT /users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Jane Updated",
  "phoneNumber": "9876543211"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile updated",
  "data": {
    "id": 2,
    "fullName": "Jane Updated",
    "email": "citizen@example.com",
    "phoneNumber": "9876543211",
    "role": "CITIZEN",
    "isActive": true
  }
}
```

---

## Admin Endpoints

### Get All Users
List all users in the system. (**Admin only**)

```
GET /admin/users
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `role` (optional): Filter by role (CITIZEN, WORKER, ADMIN)
- `isActive` (optional): Filter by active status (true/false)
- `page` (optional, default: 0): Page number
- `size` (optional, default: 10): Page size

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": 1,
      "fullName": "Admin User",
      "email": "admin@example.com",
      "phoneNumber": "9876543210",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "fullName": "Jane Citizen",
      "email": "citizen@example.com",
      "phoneNumber": "9876543211",
      "role": "CITIZEN",
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

---

### Create User (Admin)
Create a new user account. (**Admin only**)

```
POST /admin/users
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "New Worker",
  "email": "worker@example.com",
  "phoneNumber": "9876543212",
  "password": "SecurePassword123",
  "role": "WORKER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 4,
    "fullName": "New Worker",
    "email": "worker@example.com",
    "phoneNumber": "9876543212",
    "role": "WORKER",
    "isActive": true,
    "createdAt": "2024-01-20T14:00:00Z"
  }
}
```

---

### Update User (Admin)
Modify user information. (**Admin only**)

```
PUT /admin/users/{userId}
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Worker",
  "role": "ADMIN",
  "isActive": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 4,
    "fullName": "Updated Worker",
    "email": "worker@example.com",
    "phoneNumber": "9876543212",
    "role": "ADMIN",
    "isActive": false
  }
}
```

---

### Delete User (Admin)
Remove user from system. (**Admin only**)

```
DELETE /admin/users/{userId}
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### Get System Analytics
Retrieve system-wide statistics. (**Admin only**)

```
GET /admin/analytics
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Analytics retrieved",
  "data": {
    "totalUsers": 10,
    "totalComplaints": 45,
    "resolvedComplaints": 30,
    "pendingComplaints": 15,
    "usersByRole": {
      "CITIZEN": 7,
      "WORKER": 2,
      "ADMIN": 1
    },
    "complaintsByStatus": {
      "OPEN": 5,
      "IN_PROGRESS": 10,
      "RESOLVED": 30,
      "CLOSED": 0
    },
    "complaintsByPriority": {
      "LOW": 10,
      "MEDIUM": 20,
      "HIGH": 12,
      "URGENT": 3
    }
  }
}
```

---

## Error Handling Examples

### Invalid Email Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": {
    "email": "This email is already in use"
  }
}
```

### Unauthorized Access
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "auth": "Invalid or missing JWT token"
  }
}
```

### Resource Not Found
```json
{
  "success": false,
  "message": "Complaint not found",
  "errors": {
    "complaint": "Complaint with ID 999 does not exist"
  }
}
```

---

## Pagination

Endpoints that support pagination include `page` and `size` parameters:

```
GET /complaints?page=0&size=10
```

**Response:**
```json
{
  "success": true,
  "message": "Complaints retrieved",
  "data": [
    { /* complaint 1 */ },
    { /* complaint 2 */ }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5
  }
}
```

---

## Rate Limiting

API is not rate limited in development. In production, implement rate limiting per IP/token.

---

## CORS Headers

Allowed origins (configured in backend):
- `http://localhost:5173` (dev frontend)
- `http://localhost:8080` (production frontend)

---

## Testing API with cURL

### Register User
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "9876543210",
    "password": "TestPassword123",
    "role": "CITIZEN"
  }'
```

### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Create Complaint (with token)
```bash
curl -X POST http://localhost:8081/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "title": "Test Complaint",
    "description": "This is a test",
    "location": "Test Location",
    "category": "Test",
    "priority": "HIGH"
  }'
```

---

## Versioning

Current API version: **v1**

Future versions will be available at `/api/v2`, `/api/v3`, etc.

---

For more details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
