import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
      >
        <Home size={18} /> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
