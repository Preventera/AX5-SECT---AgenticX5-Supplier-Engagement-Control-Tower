'use client';

import { CheckCircle2, Clock, AlertCircle, Leaf, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

// Internal data - will be replaced by API call later
const activities = [
  {
    id: 1,
    type: 'pcf_submitted',
    title: 'PCF soumis',
    description: 'Marmen Inc. a soumis son PCF',
    time: 'Il y a 5 min',
    icon: Leaf,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 2,
    type: 'imds_validated',
    title: 'IMDS validé',
    description: 'AGT Robotique - MDS-2025-001',
    time: 'Il y a 15 min',
    icon: CheckCircle2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 3,
    type: 'reminder_sent',
    title: 'Relance envoyée',
    description: '3 fournisseurs relancés',
    time: 'Il y a 1 heure',
    icon: Mail,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 4,
    type: 'deadline_warning',
    title: 'Échéance proche',
    description: 'Kruger Wayagamack - PCF attendu dans 3 jours',
    time: 'Il y a 2 heures',
    icon: AlertCircle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    id: 5,
    type: 'imds_pending',
    title: 'IMDS en attente',
    description: 'Ambiance Bois - révision demandée',
    time: 'Il y a 3 heures',
    icon: Clock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

export default function RecentActivity() {
  return (
    <div className="card h-full">
      <h3 className="card-header">Activité récente</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className={cn(
              'flex items-start gap-3 pb-4',
              index < activities.length - 1 && 'border-b border-gray-100'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', activity.iconBg)}>
              <activity.icon className={cn('w-4 h-4', activity.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        Voir tout l&apos;historique
      </button>
    </div>
  );
}
