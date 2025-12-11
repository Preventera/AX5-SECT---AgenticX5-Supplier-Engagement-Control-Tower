'use client';

import { Target, Calendar, ChevronRight, FileText, Leaf } from 'lucide-react';
import Link from 'next/link';
import { Campaign, formatDate } from '@/lib/api';

interface CampaignProgressProps {
  campaigns: Campaign[];
}

export default function CampaignProgress({ campaigns }: CampaignProgressProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PCF': return <Leaf className="w-3 h-3" />;
      case 'IMDS': return <FileText className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PCF': return 'bg-green-100 text-green-700';
      case 'IMDS': return 'bg-blue-100 text-blue-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (campaigns.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campagnes en cours</h3>
        <div className="text-center py-8 text-gray-500">
          <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>Aucune campagne active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Campagnes en cours</h3>
        <Link href="/campaigns" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`badge flex items-center gap-1 text-xs ${getTypeColor(campaign.type)}`}>
                  {getTypeIcon(campaign.type)}
                  {campaign.type}
                </span>
                <span className="badge bg-green-100 text-green-700 text-xs">Active</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Échéance: {formatDate(campaign.end_date)}
              </div>
            </div>

            {/* Title */}
            <h4 className="font-medium text-gray-900 mb-3">{campaign.name}</h4>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium text-gray-900">{campaign.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(campaign.progress)} transition-all`}
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Fournisseurs: <span className="font-medium text-gray-900">{campaign.suppliers_total}</span></span>
              <span>Réponses: <span className="font-medium text-gray-900">{campaign.suppliers_responded}</span></span>
              <span>Validés: <span className="font-medium text-green-600">{campaign.suppliers_validated}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
