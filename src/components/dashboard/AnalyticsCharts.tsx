import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { VisitRecord } from '../../types';

interface AnalyticsChartsProps {
  visits: VisitRecord[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ visits }) => {
  // OS Data
  const osData = visits.reduce((acc, v) => {
    const os = v.os || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const osChartData = Object.entries(osData).map(([name, value]) => ({ name, value }));

  // Network Medium Data
  const netData = visits.reduce((acc, v) => {
    const net = v.networkMedium || 'unknown';
    acc[net] = (acc[net] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const netChartData = Object.entries(netData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Operating Systems</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={osChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Network Medium</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={netChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {netChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
