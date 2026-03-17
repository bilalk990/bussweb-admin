import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, Route as RouteIcon, Fuel, AlertCircle } from 'lucide-react';
import { 
  buses, 
  drivers,
  routes,
  analyticsData
} from '../data/mockData';

// Components
import StatCard from '../components/dashboard/StatCard';
import BusStatusCard from '../components/dashboard/BusStatusCard';
import ActiveBusMap from '../components/dashboard/ActiveBusMap';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import DriverList from '../components/dashboard/DriverList';

const Dashboard = () => {
  // Calculate statistics
  const activeBuses = buses.filter(bus => bus.status === 'active').length;
  const activeDrivers = drivers.filter(driver => driver.status === 'on-duty').length;
  const activeRoutes = routes.filter(route => route.status === 'active').length;
  
  // Calculate total passengers currently being served
  const totalCurrentPassengers = buses.reduce((sum, bus) => sum + bus.currentPassengers, 0);
  
  // Calculate average fuel level of active buses
  const activeBusesData = buses.filter(bus => bus.status === 'active');
  const avgFuelLevel = activeBusesData.length > 0 
    ? Math.round(activeBusesData.reduce((sum, bus) => sum + bus.fuelLevel, 0) / activeBusesData.length) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col gap-4 sm:gap-6 pb-12 sm:pb-16"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-400">
          <span className="font-medium text-white">Today:</span> {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Main Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Buses"
          value={activeBuses}
          change={{ value: 5, isPositive: true }}
          icon={Bus}
          iconColor="text-primary-400"
          iconBgColor="bg-primary-900/60"
          metric={`of ${buses.length}`}
        />
        
        <StatCard
          title="Active Drivers"
          value={activeDrivers}
          change={{ value: 2, isPositive: true }}
          icon={Users}
          iconColor="text-secondary-400"
          iconBgColor="bg-secondary-900/60"
          metric={`of ${drivers.length}`}
        />
        
        <StatCard
          title="Active Routes"
          value={activeRoutes}
          change={{ value: 0, isPositive: true }}
          icon={RouteIcon}
          iconColor="text-accent-400"
          iconBgColor="bg-accent-900/60"
          metric={`of ${routes.length}`}
        />

        <StatCard
          title="Total Passengers"
          value={totalCurrentPassengers}
          change={{ value: 8, isPositive: true }}
          icon={Users}
          iconColor="text-success-400"
          iconBgColor="bg-success-900/60"
          metric="passengers"
        />
      </div>

      {/* Map and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ActiveBusMap buses={buses} />
        </div>
        <div className="mb-8 sm:mb-12">
          <AnalyticsChart data={analyticsData} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;