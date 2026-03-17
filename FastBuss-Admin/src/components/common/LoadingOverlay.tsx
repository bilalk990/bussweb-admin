import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl flex flex-col items-center gap-3 sm:gap-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="text-white text-xs sm:text-sm">Processing request...</p>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay; 