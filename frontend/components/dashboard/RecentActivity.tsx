'use client';

import { FileCheck, Leaf, Mail, AlertTriangle, Clock } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pcf_submission': return <Leaf className="w-4 h-4" />;
      case 'imds_submission': return <FileCheck className="w-4 h-4" />;
      case 'reminder_sent': return <Mail className="w-4 h-4" />;
      case 'deadline_warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string, status: string) => {
    if (status === 'validated') return 'bg-green-100 text-green-600';
    if (status === 'rejected') return 'bg-red-100 text-red-600';
    if (type === 'deadline_warning') return 'bg-yellow-100 text-yellow-600';
    if (type === 'reminder_sent') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days}j`;
    if (hours > 0) return `Il y a ${hours}h`;
    if (minutes > 0) return `Il y a ${minutes} min`;
    return 'À l\'instant';
  };

  if (activities.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>Aucune activité récente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(activity.type, activity.status)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
        Voir tout l'historique
      </button>
    </div>
  );
}
