# CivicConnect Eco - Frontend Development Guide

## Overview

The CivicConnect Eco frontend is a React-based application built with TypeScript and Vite. It provides user interfaces for citizens, workers, administrators, and NGO partners to manage complaints, eco events, notifications, and environmental impact flows.

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Entry point
│   ├── App.css                 # Global styles
│   ├── index.css               # Base styles
│   ├── vite-env.d.ts           # Vite type definitions
│   │
│   ├── components/             # Reusable React components
│   │   ├── Layout.tsx          # App layout wrapper
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── NavLink.tsx         # Navigation link component
│   │   ├── Footer.tsx          # Footer component
│   │   ├── PrivateRoute.tsx    # Protected route component
│   │   ├── StatusBadge.tsx     # Status display component
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── pages/                  # Page-level components
│   │   ├── Index.tsx           # Home page
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── CitizenDashboard.tsx    # Citizen dashboard
│   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   ├── WorkerDashboard.tsx     # Worker dashboard
│   │   ├── ReportIssue.tsx         # Report complaint form
│   │   ├── TrackComplaint.tsx      # Track complaint
│   │   ├── ComplaintDetails.tsx    # View complaint details
│   │   ├── NotFound.tsx            # 404 page
│   │
│   ├── services/               # API service layer
│   │   ├── api.ts              # API configuration & base client
│   │   ├── authService.ts      # Authentication endpoints
│   │   ├── complaintService.ts # Complaint CRUD operations
│   │   ├── adminService.ts     # Admin operations
│   │   ├── workerService.ts    # Worker operations
│   │   └── mappingUtils.ts     # Data transformation utilities
│   │
│   ├── context/                # React Context for state management
│   │   └── AuthContext.tsx     # Authentication state & provider
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Mobile detection hook
│   │   └── use-toast.ts        # Toast notifications hook
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # All app types
│   │
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # Helper functions
│   │
│   ├── data/                   # Static data & constants
│   │   └── mockData.ts         # Mock data for development
│   │
│   ├── assets/                 # Static assets
│   │   └── images/             # Image files
│   │
│   └── test/                   # Test files
│       ├── setup.ts            # Vitest setup
│       └── example.test.ts     # Example test
│
├── public/                     # Static public files
│   └── robots.txt              # SEO robots file
│
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint rules
├── index.html                  # HTML entry point
└── Dockerfile.frontend         # Docker image definition
```

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
# or
bun install
```

### 2. Configure Environment
Create `.env.local`:
```env
VITE_API_URL=http://localhost:8081/api
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Key Components

### Layout Component
```tsx
// Layout wraps all pages with navbar and footer
import Layout from '@/components/Layout'

export default function Page() {
  return (
    <Layout>
      <div>Page content</div>
    </Layout>
  )
}
```

### PrivateRoute Component
```tsx
// Protects routes that require authentication
import PrivateRoute from '@/components/PrivateRoute'
import Dashboard from '@/pages/CitizenDashboard'

<PrivateRoute element={<Dashboard />} requiredRole="CITIZEN" />
```

### StatusBadge Component
```tsx
// Display complaint status with styling
<StatusBadge status="OPEN" />
<StatusBadge status="IN_PROGRESS" />
<StatusBadge status="RESOLVED" />
```

## State Management with Context API

### AuthContext Usage
```tsx
import { useAuth } from '@/context/AuthContext'

export default function Component() {
  const { user, token, login, logout, isAuthenticated } = useAuth()
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  )
}
```

## Services Layer

### Authentication Service
```tsx
import { authService } from '@/services/authService'

// Login
const response = await authService.login(email, password)
// { token: "jwt...", user: {...} }

// Register
await authService.register(userData)

// Logout
authService.logout()
```

### Complaint Service
```tsx
import { complaintService } from '@/services/complaintService'

// Get all complaints
const complaints = await complaintService.getComplaints()

// Create complaint
await complaintService.createComplaint(complaintData)

// Get complaint details
const complaint = await complaintService.getComplaintById(id)

// Update complaint
await complaintService.updateComplaint(id, updatedData)

// Delete complaint
await complaintService.deleteComplaint(id)
```

### Admin Service
```tsx
import { adminService } from '@/services/adminService'

// Get all users
const users = await adminService.getUsers()

// Create user
await adminService.createUser(userData)

// Update user
await adminService.updateUser(userId, updatedData)

// Delete user
await adminService.deleteUser(userId)
```

## Type Definitions

All TypeScript types are in `src/types/index.ts`:

```tsx
// User type
interface User {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  role: 'CITIZEN' | 'WORKER' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

// Complaint type
interface Complaint {
  id: number
  title: string
  description: string
  location: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  citizenId: number
  assignedTo?: number
  createdAt: string
  updatedAt: string
}

// API Response type
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
```

## Custom Hooks

### useAuth Hook
```tsx
import { useAuth } from '@/context/AuthContext'

const Component = () => {
  const { user, token, login, logout, isAuthenticated } = useAuth()
  // Use auth state
}
```

### useMobile Hook
```tsx
import { useIsMobile } from '@/hooks/use-mobile'

const Component = () => {
  const isMobile = useIsMobile()
  return isMobile ? <MobileView /> : <DesktopView />
}
```

### useToast Hook
```tsx
import { useToast } from '@/hooks/use-toast'

const Component = () => {
  const { toast } = useToast()
  
  const handleClick = () => {
    toast({
      title: "Success!",
      description: "Operation completed",
    })
  }
}
```

## Page Components

### Login Page (`pages/Login.tsx`)
- Email and password input fields
- Login form submission
- Error handling
- Redirect to dashboard on success

### Register Page (`pages/Register.tsx`)
- Registration form with validation
- Email uniqueness check
- Password confirmation
- Role selection

### Citizen Dashboard (`pages/CitizenDashboard.tsx`)
- View personal complaints
- Quick stats
- Recent activity
- Links to report issue and track complaint

### Admin Dashboard (`pages/AdminDashboard.tsx`)
- User management
- System analytics
- All complaints overview
- User role assignment

### Worker Dashboard (`pages/WorkerDashboard.tsx`)
- Assigned complaints list
- Update complaint status
- Work notes
- Complaint prioritization

### Report Issue (`pages/ReportIssue.tsx`)
- Complaint form with validation
- Category selection
- Priority level selection
- Location information
- Photo/attachment support (optional)

### Track Complaint (`pages/TrackComplaint.tsx`)
- Search complaints by ID
- View status timeline
- Worker notes display
- Status history

## Styling

### Tailwind CSS
```tsx
// Use Tailwind classes for styling
<div className="bg-blue-500 p-4 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-white">Title</h1>
</div>
```

### CSS Modules (Optional)
```tsx
import styles from './Component.module.css'

export default function Component() {
  return <div className={styles.container}>Content</div>
}
```

### shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function Component() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  )
}
```

## Forms & Validation

### Form Example
```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
  })
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Submit form data
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## API Integration

### Basic API Call
```tsx
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/complaints`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
)
const data = await response.json()
```

### Service Method Pattern
```tsx
// services/complaintService.ts
export const complaintService = {
  async getComplaints() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/complaints`,
      {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }
    )
    return response.json()
  }
}
```

## Testing

### Run Tests
```bash
npm run test
```

### Example Test
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Component from '@/components/Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText(/text/i)).toBeInTheDocument()
  })
})
```

## Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Output in dist/ folder
```

### Preview Production Build
```bash
npm run preview
```

### Docker Build
```bash
docker build -f Dockerfile.frontend -t civic-connect-frontend .
```

## Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Check code with ESLint |

## Best Practices

1. **Component Organization**: Keep components small and focused
2. **Type Safety**: Use TypeScript for all components
3. **Error Handling**: Always handle API errors gracefully
4. **Loading States**: Show loading indicators during API calls
5. **Security**: Never store sensitive data in localStorage
6. **Performance**: Use React.memo for expensive renders
7. **Accessibility**: Use semantic HTML and ARIA labels
8. **Code Splitting**: Use lazy loading for routes

## Troubleshooting

### Port 5173 Already in Use
```bash
# Kill the process using port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### Dependencies Not Installing
```bash
rm -rf node_modules
npm install
```

### Build Errors
```bash
# Clear caches
rm -rf dist node_modules/.vite
npm run build
```

### TypeScript Errors
```bash
# Ensure tsconfig.json is correct
npm run build -- --force
```

## Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [shadcn/ui Documentation](https://ui.shadcn.com)
