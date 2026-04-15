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

### Authors

#### API Key (for protected endpoints)

Creating and deleting authors requires an API key via the `x-api-key` header.

Add this to your `.env` file:

```env
API_SECRET_KEY=your-api-key
```

```http
x-api-key: <API_SECRET_KEY>
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Logger**: Winston
- **Linter**: ESLint
- **Formatter**: Prettier
- **Testing**: Vitest
- **Development Runner**: `tsx`
