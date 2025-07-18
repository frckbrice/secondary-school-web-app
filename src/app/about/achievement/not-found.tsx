import React from 'react';
import Link from 'next/link';

export default function AchievementNotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex mb-4 gap-2">
          <div className="h-8 w-8 text-red-500">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Achievement Not Found
          </h1>
        </div>

        <p className="mt-4 text-sm text-gray-600 mb-6">
          The achievement you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/about"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ← Back to About
        </Link>
      </div>
    </div>
  );
}
