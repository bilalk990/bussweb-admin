import React from 'react';
import { motion } from 'framer-motion';
import { Driver } from '../../types';
import { Star, Clock, CheckCircle2, Phone } from 'lucide-react';

interface DriverListProps {
  drivers: Driver[];
}

const DriverList: React.FC<DriverListProps> = ({ drivers }) => {
  // Filter to show only on-duty or available drivers
  const activeDrivers = drivers.filter(d => d.status === 'on-duty' || d.status === 'available');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty':
        return 'bg-success-500';
      case 'available':
        return 'bg-primary-500';
      case 'off-duty':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-duty':
        return 'On Duty';
      case 'available':
        return 'Available';
      case 'off-duty':
        return 'Off Duty';
      default:
        return status;
    }
  };

  return (
    <motion.div 
      className="data-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-medium text-white">Active Drivers</h3>
        <span className="text-xs text-gray-400">{activeDrivers.length} drivers on duty</span>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {activeDrivers.length === 0 ? (
          <p className="text-gray-400 text-center py-4 sm:py-6 text-sm">No active drivers at the moment</p>
        ) : (
          activeDrivers.map((driver, index) => (
            <motion.div 
              key={driver.id}
              className="flex items-center p-2 sm:p-3 rounded-lg bg-gray-800/20 border border-gray-700/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ 
                backgroundColor: 'rgba(75, 85, 99, 0.2)', 
                borderColor: 'rgba(75, 85, 99, 0.4)',
              }}
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={driver.avatar} 
                    alt={driver.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-gray-800 ${getStatusColor(driver.status)}`}></span>
              </div>
              
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{driver.name}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-0.5 flex-wrap gap-1">
                      <div className={`px-1 sm:px-1.5 py-0.5 rounded text-xs ${
                        driver.status === 'on-duty' ? 'bg-success-900/30 text-success-400' : 
                        'bg-primary-900/30 text-primary-400'
                      }`}>
                        {getStatusText(driver.status)}
                      </div>
                      <div className="flex items-center">
                        <Star size={10} className="text-warning-400 mr-0.5 sm:mr-1" />
                        <span>{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-1 flex-shrink-0">
                    <button className="p-1 sm:p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300">
                      <Phone size={12} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                    {driver.status === 'available' ? (
                      <button className="p-1 sm:p-1.5 rounded-full bg-primary-900/50 hover:bg-primary-800/50 transition-colors text-primary-400">
                        <CheckCircle2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </button>
                    ) : (
                      <button className="p-1 sm:p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300">
                        <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="mt-3 sm:mt-4">
        <button className="w-full btn-secondary text-xs py-1.5">
          View All Drivers
        </button>
      </div>
    </motion.div>
  );
};

export default DriverList;