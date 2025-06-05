import React from 'react';
import { Printer } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center">
        <Printer size={48} className="text-blue-600 animate-pulse" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          Print Task Management
        </h1>
        <div className="mt-8 flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-3 w-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-3 w-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-4 text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;