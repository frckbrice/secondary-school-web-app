import React, { Suspense } from 'react';
import AuthPage from '../../components/pages/auth';

export default function Auth() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ""
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  );
}
