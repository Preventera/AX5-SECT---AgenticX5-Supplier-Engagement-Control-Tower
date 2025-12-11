'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EmissionsChartProps {
  data: Array<{ month: string; collected: number; validated: number }>;
}

export default function EmissionsChart({ data }: EmissionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Émissions collectées (6 derniers mois)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Émissions collectées (6 derniers mois)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} kg CO₂e`, '']}
            />
            <Legend
              formatter={(value) => value === 'collected' ? 'Collectées' : 'Validées'}
            />
            <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="collected" />
            <Bar dataKey="validated" fill="#22c55e" radius={[4, 4, 0, 0]} name="validated" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
