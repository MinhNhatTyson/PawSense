# PawSense - Authentication & Account Management

This document describes the Authentication & Account Management feature for PawSense, including setup instructions and API documentation.

## Features

- **User Registration & Login** - Support for two user types: Veterinarians (VET) and Pet Owners (CUSTOMER)
- **Profile Management** - Extended profile fields including name, phone, clinic name, address, and specialization (for vets)
- **Password Management** - Secure password hashing with bcrypt, change password functionality
- **Role-Based Access Control** - Different permissions for VET and CUSTOMER roles

## Architecture

The feature is implemented across three main components:

### 1. Backend API (`apps/api/`)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with 7-day expiration
- **Password Hashing**: bcryptjs

### 2. Desktop App (`apps/desktop/`)
- **Framework**: React + Vite + Electron
- **State Management**: Context API with AuthProvider
- **Styling**: CSS modules
- **Navigation**: React Router for protected routes

### 3. Mobile App (`apps/mobile/`)
- **Framework**: React Native + Expo
- **State Management**: Context API with AuthProvider
- **Navigation**: React Navigation (Native Stack)
- **Secure Storage**: AsyncStorage for token persistence

## Setup Instructions

### Prerequisites

- Node.js 16+ and pnpm
- PostgreSQL 12+
- For mobile development: Expo CLI

### API Setup

1. **Navigate to the API directory**:
```bash
cd apps/api
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string and JWT secret:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/pawsense
JWT_SECRET=your-secret-key-change-this-in-production
```

4. **Run Prisma migrations**:
```bash
pnpm prisma migrate dev --name init
```

5. **Start the API server**:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

### Desktop App Setup

1. **Navigate to the desktop directory**:
```bash
cd apps/desktop
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure environment variables** (optional):
```bash
cp .env.example .env.local
```

4. **Start development**:
```bash
pnpm dev
```

The app will open at `http://localhost:5173`

### Mobile App Setup

1. **Navigate to the mobile directory**:
```bash
cd apps/mobile
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Start Expo**:
```bash
pnpm start
```

4. **Run on device/emulator**:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "CUSTOMER", // or "VET"
  "fullName": "John Doe",
  "phone": "+1 (555) 000-0000",
  "clinicName": "My Clinic", // VET only
  "address": "123 Main St",
  "specialization": "Feline Medicine" // VET only
}

Response: 201 Created
{
  "token": "jwt-token",
  "role": "CUSTOMER",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "profile": { ... }
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "jwt-token",
  "role": "CUSTOMER",
  "user": { ... }
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "profile": {
      "id": "profile-id",
      "fullName": "John Doe",
      "phone": "+1 (555) 000-0000",
      "address": "123 Main St",
      "clinicName": null,
      "specialization": null,
      "avatar": null
    }
  }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "phone": "+1 (555) 111-1111",
  "address": "456 Oak Ave"
}

Response: 200 OK
{
  "profile": { ... }
}
```

#### Change Password
```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

## Database Schema

### User Model
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (Enum: VET | CUSTOMER)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `profile` (One-to-One relation to Profile)

### Profile Model
- `id` (UUID, PK)
- `userId` (UUID, FK to User, unique)
- `fullName` (String, nullable)
- `phone` (String, nullable)
- `clinicName` (String, nullable)
- `address` (String, nullable)
- `specialization` (String, nullable)
- `avatar` (String, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request` - Missing or invalid parameters
- `401 Unauthorized` - Invalid credentials or missing token
- `403 Forbidden` - User does not have permission
- `409 Conflict` - Resource already exists (e.g., email taken)
- `500 Internal Server Error` - Server error

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds = 10
2. **JWT Tokens**: Tokens expire after 7 days and must be renewed via login
3. **HTTPS**: Use HTTPS in production
4. **Environment Variables**: Never commit `.env` files; use `.env.example` templates
5. **CORS**: API is configured to accept requests from frontend apps
6. **Token Storage**: 
   - Desktop: localStorage (protected by Electron's secure context)
   - Mobile: AsyncStorage (use Expo SecureStore for production)

## Development Notes

### Testing the Flow

1. **Register** a new account at `/register`
2. **Login** with your credentials at `/login`
3. **View Profile** at `/profile`
4. **Edit Profile** at `/profile/edit`
5. **Change Password** at `/change-password`

### Database Reset (Development)

To reset the database:
```bash
cd apps/api
pnpm prisma migrate reset
```

This will drop the database, recreate it, and run all migrations.

### Debugging

**API Debugging**:
```bash
cd apps/api
DEBUG=* pnpm dev
```

**Desktop Debugging**:
Open DevTools: Press F12 or right-click → Inspect

**Mobile Debugging**:
Use Expo DevTools or connect to remote debugger

## Common Issues

### "Invalid token" error
- Token may have expired (7-day expiration)
- Re-login to get a new token

### "Email already in use" error
- The email is already registered
- Use a different email or login

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify credentials and database exists

### Mobile app can't reach API
- Check API_URL in mobile app's AuthContext
- Ensure API server is running
- For emulators, use `http://10.0.2.2:3000` (Android) or `http://localhost:3000` (iOS)

## Future Enhancements

- Two-factor authentication (2FA)
- Social login (Google, GitHub)
- Email verification on registration
- Password reset via email
- Profile picture upload
- Session management (logout from all devices)
- Audit logging

## Support

For issues or questions, please refer to the main PawSense documentation.
