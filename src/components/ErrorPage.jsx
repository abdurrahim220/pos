import React from 'react'
import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Oops! Page not found</h2>
        <p className="text-gray-500 mb-6">
          {error?.statusText || error?.message || "Sorry, the page you’re looking for doesn’t exist."}
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Go Back Home
        </Link>
      </div>

      <div className="mt-10">
        <svg
          className="w-72 h-72 mx-auto opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 500"
        >
          <path
            fill="#c7d2fe"
            d="M250 25C128 25 25 128 25 250s103 225 225 225 225-103 225-225S372 25 250 25zm0 410c-102 0-185-83-185-185S148 65 250 65s185 83 185 185-83 185-185 185z"
          />
          <circle cx="170" cy="220" r="20" fill="#6366f1" />
          <circle cx="330" cy="220" r="20" fill="#6366f1" />
          <path
            fill="#6366f1"
            d="M170 330c25-20 135-20 160 0s10 40-80 40-105-20-80-40z"
          />
        </svg>
      </div>
    </div>
  );
}