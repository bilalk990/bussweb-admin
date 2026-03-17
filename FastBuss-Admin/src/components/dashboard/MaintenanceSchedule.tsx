import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Calendar, AlertCircle } from 'lucide-react';
import { MaintenanceRecord } from '../../types';

interface MaintenanceScheduleProps {
  records: MaintenanceRecord[];
}

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ records }) => {
  // Sort records: in-progress first, then scheduled, then completed
  const sortedRecords = [...records].sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'scheduled': 1, 'completed': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <motion.div 
      className="data-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Maintenance Schedule</h3>
        <button className="btn-secondary text-xs">
          <Calendar size={14} />
          <span>View All</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {sortedRecords.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No maintenance records to display</p>
        ) : (
          sortedRecords.map((record, index) => (
            <motion.div 
              key={record.id}
              className={`flex items-start p-3 rounded-lg ${
                record.status === 'in-progress' ? 'bg-warning-900/20 border border-warning-800/30' :
                record.status === 'scheduled' ? 'bg-gray-800/20 border border-gray-700/30' :
                'bg-success-900/10 border border-success-900/20'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className={`p-2 rounded-md ${
                record.status === 'in-progress' ? 'bg-warning-900/50 text-warning-500' :
                record.status === 'scheduled' ? 'bg-primary-900/50 text-primary-400' :
                'bg-success-900/50 text-success-500'
              }`}>
                <Wrench size={18} />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Bus {record.busNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{record.description}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                    record.status === 'in-progress' ? 'bg-warning-900/30 text-warning-400' :
                    record.status === 'scheduled' ? 'bg-primary-900/30 text-primary-400' :
                    'bg-success-900/30 text-success-400'
                  }`}>
                    {record.status === 'in-progress' ? 'In Progress' :
                     record.status === 'scheduled' ? 'Scheduled' :
                     'Completed'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <Calendar size={14} className="text-gray-500 mr-1.5" />
                    <span className="text-xs text-gray-400">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <span className="text-xs font-medium">
                    ${record.cost.toLocaleString()}
                  </span>
                </div>
                
                {record.status === 'in-progress' && (
                  <div className="flex items-center mt-2 text-xs text-warning-400">
                    <AlertCircle size={12} className="mr-1" />
                    <span>Estimated completion today</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MaintenanceSchedule;