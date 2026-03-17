import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'active' | 'inactive' | 'pending';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  status,
  className = ''
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-16 h-16';
      default: return 'w-12 h-12';
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${getSize()} rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur-sm border border-primary-500/30 flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent" />
        <User className="w-1/2 h-1/2 text-primary-400" />
        <div className="absolute inset-0 flex items-center justify-center text-primary-400 font-semibold">
          {getInitials(name)}
        </div>
      </motion.div>
      {status && (
        <div
          className={`absolute bottom-0 right-0 ${getStatusSize()} rounded-full border-2 border-gray-900 ${
            status === 'active' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar; 