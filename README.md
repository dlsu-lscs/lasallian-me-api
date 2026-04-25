# lasallian-me-api

This project was generated using the `create-lscs-api` scaffolder, based on the official La Salle Computer Society (LSCS) Backend Standards.

It is set up with the **Domain-Driven (Vertical Slicing)** architecture.

## Getting Started

To start the development server:

1. **Create your `.env` file** from the template:

   **macOS/Linux (bash)**

```bash
cp .env.example .env
```

   Windows (PowerShell)

```powershell
Copy-Item .env.example .env
```

Then update at least your database connection string:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/database_name
```

1. **Run database migrations**:

   ```bash
   pnpm db:migrate
   ```

1. **Start the development server**:

   ```bash
   pnpm dev
   ```

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

## API Documentation

Default development base URL: `http://localhost:8000`

### Swagger / OpenAPI

Interactive Swagger UI and the OpenAPI JSON are available under `/api-docs`.

### Authentication

Better Auth is configured with the OpenAPI plugin.

Routes (mounted under `/api/auth`):

- Better Auth OpenAPI reference UI: `/api/auth/reference`
- Better Auth OpenAPI schema JSON: `/api/auth/open-api/generate-schema`

#### Testing Protected Endpoints In Swagger (Temporary solution)

1. Go to `/api/auth/reference`
2. Press Test Request
3. Overwrite json body type with {"provider": "google"} 
4. Press Send
5. Copy URL
6. Paste into address bar
7. Sign in with DLSU email
8. Return to http://localhost:8000/api-docs/
9. Make your user account admin through pnpm db:studio
10. Test admin protected routes

If you are not signed in (or the cookie is missing), those endpoints will return `401 Unauthorized`.

### Authentication Notes

Protected endpoints use the Better Auth session cookie. Sign in first, then call the API from the same browser session or provide the session cookie in your client.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Logger**: Winston
- **Linter**: ESLint
- **Formatter**: Prettier
- **Testing**: Vitest
- **Development Runner**: `tsx`
