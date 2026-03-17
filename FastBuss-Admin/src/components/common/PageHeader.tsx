import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader; 