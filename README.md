# lasallian-me-api

This project was generated using the `create-lscs-api` scaffolder, based on the official La Salle Computer Society (LSCS) Backend Standards.

It is set up with the **Domain-Driven (Vertical Slicing)** architecture.

## Getting Started

All dependencies are installed during the project setup. To start the development server:

1. **Create your `.env` file** from the template:

   **macOS/Linux (bash)**

```bash
cp .env.example .env
```

**Windows (PowerShell)**

```powershell
Copy-Item .env.example .env
```

Then update at least your database connection string:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/database_name
```

2. **Run database migrations**:

   ```bash
   pnpm db:migrate
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

The server will start with hot-reloading, meaning it will automatically restart when you save a file.

## Available Scripts

- `pnpm dev`: Starts the development server with hot-reloading.
- `pnpm start`: Starts the production server (builds the project first).
- `pnpm build`: Compiles the TypeScript code to JavaScript.
- `pnpm lint`: Lints the codebase for potential errors.
- `pnpm lint:fix`: Lints and auto-fixes issues where possible.
- `pnpm format`: Formats the code using Prettier.
- `pnpm test`: Runs tests once.
- `pnpm test:watch`: Runs tests in watch mode.
- `pnpm test:coverage`: Runs tests with coverage.
- `pnpm db:generate`: Generates migration files from schema changes.
- `pnpm db:migrate`: Applies migrations to the database.
- `pnpm db:push`: Pushes schema changes directly to the database (dev only).
- `pnpm db:studio`: Opens Drizzle Studio for database management.
- `pnpm db:seed`: Seeds the database.

## Database Migrations

After modifying the schema in `src/shared/infrastructure/database/schema.ts`:

```bash
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Apply migrations to database
```

## API Documentation

Default development base URL: `http://localhost:8000`

### Swagger / OpenAPI

Interactive Swagger UI is available at:

```http
GET /api-docs
```

Raw OpenAPI JSON is available at:

```http
GET /api-docs/openapi.json
```

### Authentication

This API uses [Better Auth](https://www.better-auth.com/) for OAuth authentication with Google.

**Base URL**: `/api/auth`

#### Environment Variables

Add these to your `.env` file:

```env
BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TRUSTED_ORIGINS=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

#### Endpoints

**Sign In with Google**

```http
GET /api/auth/sign-in/google
```

Redirects to Google OAuth consent screen. After successful authentication, redirects back to your application with session cookies.

**Sign Out**

```http
POST /api/auth/sign-out
Cookie: <session_cookie>
```

**Get Session**

```http
GET /api/auth/session
Cookie: <session_cookie>
```

**Response Example**:

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/...",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2025-12-08T00:00:00.000Z"
  }
}
```

#### Authentication Usage Examples

**Next.js Client Setup**

**Refer to the better-auth usage branch for functioning example. Contact backend developer for assistance if difficulty persists.**

First, install the Better Auth client:

```bash
pnpm add better-auth
```

Create a client instance in your Next.js app:

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8000', // Your API URL
});
```

**Client-Side Sign In**

```typescript
import { authClient } from "@/lib/auth-client";

// In your component
export default function LoginButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard" // Where to redirect after sign in
    });
  };

  return (
    <button onClick={handleSignIn}>
      Sign in with Google
    </button>
  );
}
```

**Client-Side Sign Out**

```typescript
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/"; // Redirect after sign out
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

**Check User Session**

```typescript
import { authClient } from "@/lib/auth-client";

export default function UserProfile() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <img src={session.user.image} alt="Profile" />
    </div>
  );
}
```

**Alternative: Manual Fetch (Vanilla JS/React)**

If not using Next.js or Better Auth client:

```javascript
// Sign in - redirect to OAuth flow
window.location.href = 'http://localhost:8000/api/auth/sign-in/google';

// Sign out
await fetch('http://localhost:8000/api/auth/sign-out', {
  method: 'POST',
  credentials: 'include',
});

// Get session
const response = await fetch('http://localhost:8000/api/auth/session', {
  credentials: 'include',
});
const session = await response.json();
```

#### Protected Routes

To protect routes, use the auth middleware:

```typescript
import { auth } from '@/auth/auth.config.js';

router.get('/protected', async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ message: 'Protected data', user: session.user });
});
```

### Authors

**Base URL**: `/api/authors`

#### API Key (for protected endpoints)

Creating and deleting authors requires an API key via the `x-api-key` header.

Add this to your `.env` file:

```env
API_SECRET_KEY=your-api-key
```

**Protected endpoints require this header:**

```http
x-api-key: <API_SECRET_KEY>
```

#### Endpoints

**Get Author by Email**

```http
GET /api/authors/:email
```

**Response Example (200)**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "description": "A brief bio",
  "website": "https://example.com",
  "logo": "https://example.com/logo.png",
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

**Create Author** (requires API key)

```http
POST /api/authors
x-api-key: <API_SECRET_KEY>
Content-Type: application/json
```

**Request Body Example**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "description": "A brief bio",
  "website": "https://example.com",
  "logo": "https://example.com/logo.png"
}
```

Notes:

- `description`, `website`, and `logo` are optional.
- `website` must be a valid URL when provided.

**Delete Author by ID** (requires API key)

```http
DELETE /api/authors/:id
x-api-key: <API_SECRET_KEY>
```

Common error responses:

- `400` validation error (invalid `email`/`id` params or invalid request body)
- `401` unauthorized (missing/invalid `x-api-key`)
- `404` not found (no author matching the email/id)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Logger**: Winston
- **Linter**: ESLint
- **Formatter**: Prettier
- **Testing**: Vitest
- **Development Runner**: `tsx`
