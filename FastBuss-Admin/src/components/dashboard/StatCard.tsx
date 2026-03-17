import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  metric?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  metric 
}) => {
  return (
    <motion.div 
      className="data-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm text-gray-400 mb-1">{title}</h3>
          <div className="flex items-end flex-wrap">
            <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white truncate mr-1">
              {value}
            </span>
            {metric && (
              <span className="text-xs sm:text-sm text-gray-400">{metric}</span>
            )}
          </div>
          
          {change && (
            <div className="flex items-center mt-1 sm:mt-2">
              <span className={`text-xs font-medium ${change.isPositive ? 'text-success-400' : 'text-error-400'}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-2 sm:p-3 rounded-lg ${iconBgColor} flex-shrink-0 ml-2`}>
          <Icon size={16} className={`${iconColor} sm:w-5 sm:h-5 md:w-6 md:h-6`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;