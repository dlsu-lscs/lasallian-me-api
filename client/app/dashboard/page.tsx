"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to your protected dashboard!
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Session Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                <p className="text-gray-900 dark:text-white font-mono text-sm mt-1">
                  {session.user?.id || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {session.user?.email || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {session.user?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Full Session Data
            </h3>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-auto text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
