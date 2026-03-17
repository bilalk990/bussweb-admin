import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Bus } from '../../types';

interface ActiveBusMapProps {
  buses: Bus[];
}

const ActiveBusMap: React.FC<ActiveBusMapProps> = ({ buses }) => {
  const activeBuses = buses.filter(bus => bus.status === 'active');

  return (
    <motion.div 
      className="data-card h-[300px] md:h-[400px] relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-medium text-white mb-4">Active Fleet Map</h3>
      
      {/* Simulated Map Background */}
      <div className="absolute inset-0 mt-12 z-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-75">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`v-${i}`} className="h-full w-px bg-gray-800/50" style={{ left: `${(i + 1) * (100 / 12)}%` }}></div>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`h-${i}`} className="w-full h-px bg-gray-800/50" style={{ top: `${(i + 1) * (100 / 12)}%` }}></div>
          ))}
        </div>
        
        {/* Routes Visualization */}
        <svg className="absolute inset-0 w-full h-full">
          <path 
            d="M50,50 C100,20 150,120 200,100 C250,80 300,150 350,150" 
            stroke="#4f46e5" 
            strokeWidth="2" 
            strokeDasharray="4,4" 
            fill="none" 
            className="opacity-40"
          />
          <path 
            d="M100,200 C150,180 200,240 250,220 C300,200 350,280 400,250" 
            stroke="#14b8a6" 
            strokeWidth="2" 
            strokeDasharray="4,4" 
            fill="none" 
            className="opacity-40"
          />
          <path 
            d="M50,300 C100,350 200,320 250,350 C300,380 350,300 400,320" 
            stroke="#9333ea" 
            strokeWidth="2" 
            strokeDasharray="4,4" 
            fill="none" 
            className="opacity-40"
          />
        </svg>
      </div>
      
      {/* Bus Markers */}
      <div className="absolute inset-0 mt-12">
        {activeBuses.map((bus, index) => {
          // Generate pseudo-random positions for demonstration
          const left = ((bus.id.charCodeAt(0) * 73) % 80) + 10;
          const top = ((bus.id.charCodeAt(0) * 47) % 80) + 10;
          
          return (
            <motion.div
              key={bus.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <motion.div
                className="relative cursor-pointer group"
                whileHover={{ scale: 1.1 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center neon-text animate-pulse-slow"></div>
                <MapPin size={24} className="absolute -top-2 -left-2 text-primary-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 glass-card p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                  <p className="font-medium text-white">{bus.number}</p>
                  <p className="text-gray-400">Route: {bus.route}</p>
                  <p className="text-gray-400">Passengers: {bus.currentPassengers}/{bus.capacity}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 glass-card p-2 text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-0.5 bg-primary-500 opacity-40 mr-2"></div>
          <span className="text-gray-400">Downtown Route</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-0.5 bg-secondary-500 opacity-40 mr-2"></div>
          <span className="text-gray-400">Airport Route</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-accent-500 opacity-40 mr-2"></div>
          <span className="text-gray-400">University Route</span>
        </div>
      </div>
      
      {activeBuses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center mt-12 z-10">
          <p className="text-gray-400">No active buses to display</p>
        </div>
      )}
      
      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-xs px-2 py-1 rounded text-gray-400">
        {activeBuses.length} buses active
      </div>
    </motion.div>
  );
};

export default ActiveBusMap;