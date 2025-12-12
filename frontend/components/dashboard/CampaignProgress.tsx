'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Internal mock data - will be replaced by API call later
const campaigns = [
  {
    id: 1,
    name: 'Campagne IMDS Q1 2025',
    type: 'IMDS',
    progress: 60,
    suppliers: { total: 8, responded: 5, validated: 3 },
    deadline: '31 mars 2025',
    status: 'active',
  },
  {
    id: 2,
    name: 'PCF Fournisseurs Critiques',
    type: 'PCF',
    progress: 40,
    suppliers: { total: 5, responded: 2, validated: 1 },
    deadline: '30 juin 2025',
    status: 'active',
  },
  {
    id: 3,
    name: 'Campagne Mixte Mauricie',
    type: 'MIXED',
    progress: 0,
    suppliers: { total: 4, responded: 0, validated: 0 },
    deadline: '30 sept 2025',
    status: 'draft',
  },
];

const typeColors: Record<string, string> = {
  PCF: 'bg-green-100 text-green-700',
  IMDS: 'bg-blue-100 text-blue-700',
  MIXED: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-green-100 text-green-700' },
  draft: { label: 'Brouillon', class: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Terminée', class: 'bg-blue-100 text-blue-700' },
  paused: { label: 'En pause', class: 'bg-yellow-100 text-yellow-700' },
};

export default function CampaignProgress() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="card-header mb-0">Campagnes en cours</h3>
        <Link 
          href="/campaigns" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div 
            key={campaign.id}
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={cn('badge', typeColors[campaign.type] || 'bg-gray-100 text-gray-700')}>
                  {campaign.type}
                </span>
                <span className={cn('badge', statusLabels[campaign.status]?.class || 'bg-gray-100 text-gray-700')}>
                  {statusLabels[campaign.status]?.label || campaign.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">Échéance: {campaign.deadline}</span>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{campaign.name}</h4>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-medium text-gray-900">{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      campaign.progress >= 70 ? 'bg-green-500' :
                      campaign.progress >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                    )}
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Fournisseurs:</span>
                <span className="font-medium text-gray-900 ml-1">{campaign.suppliers.total}</span>
              </div>
              <div>
                <span className="text-gray-500">Réponses:</span>
                <span className="font-medium text-blue-600 ml-1">{campaign.suppliers.responded}</span>
              </div>
              <div>
                <span className="text-gray-500">Validés:</span>
                <span className="font-medium text-green-600 ml-1">{campaign.suppliers.validated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
