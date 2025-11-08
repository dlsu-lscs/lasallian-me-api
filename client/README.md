# Better Auth Test Client

A Next.js client application for testing the better-auth authentication API.

## Features

- 🔐 Sign Up / Sign In pages
- 👤 Protected dashboard with session information
- 🎨 Beautiful UI with Tailwind CSS
- 🌙 Dark mode support
- 📱 Responsive design

## Setup

### Prerequisites

Make sure your API server is running on `http://localhost:3000` (or update the `NEXT_PUBLIC_API_URL` in `.env.local`).

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure the API URL:
   The `.env.local` file is already configured with:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Update this if your API is running on a different port.

### Running the Client

```bash
npm run dev
```

The client will start on `http://localhost:3001` (or the next available port).

## Pages

### Home (`/`)

Landing page with navigation to all auth pages and API configuration display.

### Sign Up (`/signup`)

Create a new user account with:

- Full name
- Email address
- Password (minimum 8 characters)

### Sign In (`/signin`)

Sign in to an existing account with:

- Email address
- Password

### Dashboard (`/dashboard`)

Protected route that displays:

- User session information (ID, email, name)
- Full session data in JSON format
- Sign out functionality

**Note:** This page automatically redirects to `/signin` if the user is not authenticated.

## Testing the Authentication Flow

### 1. Create an Account

1. Navigate to http://localhost:3001/signup
2. Fill in your details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"
4. You should be redirected to the dashboard

### 2. Sign Out and Sign In

1. Click "Sign Out" on the dashboard
2. Navigate to http://localhost:3001/signin
3. Enter your credentials
4. Click "Sign In"
5. You should be redirected back to the dashboard

### 3. Test Protected Routes

1. Sign out if you're currently signed in
2. Try to access http://localhost:3001/dashboard directly
3. You should be automatically redirected to `/signin`

## API Endpoints Used

The client interacts with the following better-auth endpoints on your API:

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Sign out current session
- `GET /api/auth/session` - Get current session data

## Project Structure

```
client/
├── app/
│   ├── page.tsx          # Home page
│   ├── signin/
│   │   └── page.tsx      # Sign in page
│   ├── signup/
│   │   └── page.tsx      # Sign up page
│   ├── dashboard/
│   │   └── page.tsx      # Protected dashboard
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   └── auth-client.ts    # Better-auth client configuration
├── .env.local            # Environment variables
└── package.json
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console, make sure your API has CORS properly configured to allow requests from `http://localhost:3001`.

### Connection Refused

If you see "Connection refused" errors:

1. Make sure your API server is running
2. Verify the `NEXT_PUBLIC_API_URL` in `.env.local` matches your API's URL
3. Restart the Next.js dev server after changing environment variables

### Session Not Persisting

Better-auth uses cookies for session management. Make sure:

1. Your API is setting cookies correctly
2. The cookies have the correct `sameSite` and `secure` attributes for your environment
3. Your browser is not blocking third-party cookies

## Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [better-auth](https://better-auth.com/) - Authentication library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Notes

- This is a test client for development purposes
- In production, you would add proper error handling, loading states, and form validation
- Consider adding email verification, password reset, and other auth features as needed

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
