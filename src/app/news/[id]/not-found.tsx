import React from 'react';
import Link from 'next/link';
import { ArrowLeftCircle, Newspaper } from 'lucide-react';

export default function NewsNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center transition-opacity duration-700 opacity-100">
        <div className="mb-6 animate-bounce">
          <Newspaper className="w-20 h-20 text-blue-500 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-blue-800 mb-2 text-center">
          News Article Not Found
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Sorry, the news article you are looking for does not exist or may have
          been removed.
          <br />
          Please check the URL or return to the news page.
        </p>
        <Link
          href="/news"
          className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <ArrowLeftCircle className="w-5 h-5 mr-2" />
          Back to News
        </Link>
      </div>
    </div>
  );
}
