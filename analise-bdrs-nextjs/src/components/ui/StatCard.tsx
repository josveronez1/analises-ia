import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    icon: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    icon: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    icon: 'text-purple-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    icon: 'text-indigo-600',
  },
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  className = '' 
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center">
        {icon && (
          <div className={`p-3 rounded-full ${colors.bg}`}>
            <div className={`h-6 w-6 ${colors.icon}`}>
              {icon}
            </div>
          </div>
        )}
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' :
                change.type === 'decrease' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                {Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

