import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Bus, 
  Route, 
  Fuel, 
  TrendingUp, 
  Clock, 
  Star,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { analyticsData } from '../data/mockData';

const Analytics = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  
  // Calculate insights
  const totalPassengers = analyticsData.passengersByDay.reduce((sum, day) => sum + day.count, 0);
  const avgPassengersPerDay = Math.round(totalPassengers / analyticsData.passengersByDay.length);
  const mostPopularDay = analyticsData.passengersByDay.reduce((max, day) => 
    day.count > max.count ? day : max
  );
  const leastPopularDay = analyticsData.passengersByDay.reduce((min, day) => 
    day.count < min.count ? day : min
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-sm text-gray-400 mt-1">Data-driven insights for better decision making</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            Filter Data
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {['day', 'week', 'month', 'year'].map((timeframe) => (
          <button
            key={timeframe}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTimeframe === timeframe
                ? 'bg-primary-900 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTimeframe(timeframe)}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Main Analytics */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
          {/* Key Metrics */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Passengers</span>
                  <Users size={18} className="text-primary-400" />
                </div>
                <p className="text-2xl font-bold text-white">{totalPassengers.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {avgPassengersPerDay.toLocaleString()} avg. per day
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Bus Utilization</span>
                  <Bus size={18} className="text-success-400" />
                </div>
                <p className="text-2xl font-bold text-white">78%</p>
                <p className="text-sm text-gray-400 mt-1">+5% from last week</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Route Efficiency</span>
                  <Route size={18} className="text-warning-400" />
                </div>
                <p className="text-2xl font-bold text-white">92%</p>
                <p className="text-sm text-gray-400 mt-1">+2% from last week</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Fuel Efficiency</span>
                  <Fuel size={18} className="text-info-400" />
                </div>
                <p className="text-2xl font-bold text-white">8.5 km/L</p>
                <p className="text-sm text-gray-400 mt-1">+0.3 from last week</p>
              </div>
            </div>
          </div>

          {/* Passenger Trends */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Passenger Trends</h2>
            <div className="h-64 bg-gray-800/50 rounded-lg p-4">
              {/* Placeholder for chart */}
              <div className="flex items-center justify-center h-full text-gray-400">
                Passenger trend chart will be implemented here
              </div>
            </div>
          </div>

          {/* Route Performance */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Route Performance</h2>
            <div className="space-y-4">
              {analyticsData.routePerformance.map(route => (
                <div key={route.routeId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{route.routeName}</span>
                    <span className="text-sm text-gray-400">{route.efficiency}% efficiency</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${route.efficiency}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Punctuality: {route.punctuality}%</span>
                    <span>Satisfaction: {route.satisfaction}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-white mb-4">AI-Powered Insights</h2>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                onClick={() => setExpandedInsight(expandedInsight === 'peak' ? null : 'peak')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Peak Hours Analysis</h3>
                    <p className="text-sm text-gray-400">Identified optimal scheduling opportunities</p>
                  </div>
                  {expandedInsight === 'peak' ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </div>
                {expandedInsight === 'peak' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <p className="text-sm text-gray-400">
                      Peak hours are between 7:30 AM - 9:30 AM and 4:30 PM - 6:30 PM.
                      Consider adding more buses during these times to reduce passenger wait times.
                    </p>
                  </motion.div>
                )}
              </div>

              <div 
                className="p-4 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                onClick={() => setExpandedInsight(expandedInsight === 'route' ? null : 'route')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Route Optimization</h3>
                    <p className="text-sm text-gray-400">Potential route adjustments identified</p>
                  </div>
                  {expandedInsight === 'route' ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </div>
                {expandedInsight === 'route' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <p className="text-sm text-gray-400">
                      The Downtown Express route shows high demand during weekends.
                      Consider increasing frequency on Saturdays and Sundays.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Most Popular Day</span>
                <span className="text-white font-medium">{mostPopularDay.day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Least Popular Day</span>
                <span className="text-white font-medium">{leastPopularDay.day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Average Daily Passengers</span>
                <span className="text-white font-medium">{avgPassengersPerDay.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics; 