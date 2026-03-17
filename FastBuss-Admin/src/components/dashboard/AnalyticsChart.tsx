import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '../../types';

interface AnalyticsChartProps {
  data: AnalyticsData;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  return (
    <motion.div 
      className="data-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-medium text-white mb-4">Weekly Passenger Count</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.passengersByDay}>
            <defs>
              <linearGradient id="passengerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              width={40}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#e5e7eb',
                fontSize: '0.75rem'
              }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [`${value} passengers`, 'Total']}
              labelStyle={{ color: '#e5e7eb', fontWeight: 500 }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#passengerGradient)" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div>
          Total Weekly: <span className="text-white font-medium">
            {data.passengersByDay.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </span>
        </div>
        <div>
          Daily Average: <span className="text-white font-medium">
            {Math.round(data.passengersByDay.reduce((sum, item) => sum + item.count, 0) / data.passengersByDay.length).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsChart;