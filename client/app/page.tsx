import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          Better Auth Test Client
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Test your authentication API
        </p>
        
        <div className="space-y-4">
          <Link
            href="/signin"
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            href="/signup"
            className="block w-full text-center bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-4 rounded-lg border-2 border-indigo-600 transition-colors"
          >
            Sign Up
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Dashboard (Protected)
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
          </p>
        </div>
      </div>
    </div>
  );
}
