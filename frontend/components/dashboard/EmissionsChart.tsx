'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Internal data - will be replaced by API call later
const data = [
  { name: 'Jan', collected: 1200, validated: 1000 },
  { name: 'Fév', collected: 1400, validated: 1200 },
  { name: 'Mar', collected: 1800, validated: 1500 },
  { name: 'Avr', collected: 2200, validated: 1900 },
  { name: 'Mai', collected: 2600, validated: 2300 },
  { name: 'Juin', collected: 3100, validated: 2800 },
];

export default function EmissionsChart() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Émissions collectées (kg CO₂e)</h3>
          <p className="text-sm text-gray-500 mt-1">Évolution sur les 6 derniers mois</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
            <span className="text-sm text-gray-600">Collectées</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">Validées</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} kg`, '']}
            />
            <Bar 
              dataKey="collected" 
              fill="#3b82f6" 
              name="Collectées"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="validated" 
              fill="#22c55e" 
              name="Validées"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
