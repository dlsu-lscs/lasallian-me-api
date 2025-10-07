# lasallian-me-api

This project is a **TypeScript-based Express.js API** scaffold designed for modular, scalable, and maintainable backend development.

---

## 1. 🚀 Development Setup

- Modular folder structure under `src/`
- Prettier + ESLint for clean, consistent code style
- Vitest configured for unit testing
- Environment variables managed via `.env`

### Scripts

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start development server with live reload |
| `npm run build` | Compile TypeScript into JavaScript        |
| `npm run start` | Run compiled production server            |
| `npm run lint`  | Run ESLint for static code analysis       |
| `npm run test`  | Run Vitest unit tests                     |

---

## 2. ⚡ Folder Structure

We follow a **Layered Architecture File Structure** for backend development, separating app logic into organized folders.

```
src/
├── app.ts                # Express app setup
├── server.ts             # Server entry point
│
├── config/               # App configurations (env, db, etc.)
│   └── .gitkeep
│
├── controllers/          # Request handlers
│   └── .gitkeep
│
├── middlewares/          # Express middlewares (auth, logging, etc.)
│   └── .gitkeep
│
├── models/               # Mongoose or ORM models
│   └── .gitkeep
│
├── routes/               # Route definitions
│   └── .gitkeep
│
├── services/             # Business logic
│   └── .gitkeep
│
├── lib/                  # Utilities and helpers
│   └── .gitkeep
│
└── types/                # Global TypeScript types/interfaces
    └── .gitkeep
```

---

## 3. 🧪 Testing Setup

This scaffold includes **Vitest** for lightweight, fast unit testing.

### Example

```bash
npm run test
```

Create tests under:

```
test/
├── example.test.ts
```

---

## 4. 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)
- **Environment Management**: [dotenv](https://github.com/motdotla/dotenv)

Optional for production apps:

- **Database**: [MongoDB + Mongoose](https://mongoosejs.com/) or [PostgreSQL + Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [Passport.js](http://www.passportjs.org/) or [Lucia](https://lucia-auth.com/)

---

## 5. 🏗️ Architecture Overview

We apply a **layered architecture** to keep code clean and maintainable:

| Layer           | Responsibility                                      |
| --------------- | --------------------------------------------------- |
| **Routes**      | Define endpoints and link to controllers            |
| **Controllers** | Handle requests and responses                       |
| **Services**    | Contain business logic                              |
| **Models**      | Represent data schema and database logic            |
| **Middlewares** | Intercept and handle request validation, auth, etc. |
| **Lib**         | Contain reusable utilities or external integrations |

---

## 6. 📝 Coding Standards

- Write **modular, reusable functions**
- Use **async/await** for asynchronous logic
- **Type everything** with TypeScript
- Keep controllers **thin**, delegate logic to services
- Use **Prettier + ESLint** for style and consistency
- Use **try/catch** in async handlers to avoid crashes
- Include **comments** explaining “why,” not “what”

---

## 7. 🤝 Contribution Guide

### Branch Model

- `main` → production-ready code
- `dev` → active development branch

### Workflow

1. Create a branch:  
   `feature/<desc>` or `fix/<desc>`
2. Use **Conventional Commits**:
   - `feat(routes): add user registration endpoint`
   - `fix(controller): correct missing response`
3. Submit a PR → target `dev`
4. Require **1 approval** before merging
5. Use **Squash and Merge**

### Commit Types

| Type     | Description       |
| -------- | ----------------- |
| feat     | New feature       |
| fix      | Bug fix           |
| docs     | Documentation     |
| style    | Formatting change |
| refactor | Code restructure  |
| test     | Testing updates   |
| chore    | Maintenance       |

---

✅ Following this guide ensures **clean, scalable, and maintainable backend development** for the Lasallian Me API.
