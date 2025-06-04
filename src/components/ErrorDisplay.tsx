import { motion } from 'framer-motion';
import { NounsIcon } from './icons/NounsIcon';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[50vh] p-8"
    >
      <div className="flex flex-col items-center max-w-md text-center gap-4">
        <div className="w-16 h-16 mb-2 text-gray-400">
          <NounsIcon />
        </div>
        <div className="flex items-center justify-center bg-red-100 rounded-full p-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Error</h2>
        <p className="text-gray-600">{message}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </motion.div>
  );
};