'use client';

import { useState } from 'react';
import { 
  Plus, 
  Target, 
  Calendar, 
  Users, 
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle2,
  FileCheck,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

const campaigns = [
  {
    id: 1,
    name: 'Campagne PCF Q1 2025 - Tier 1',
    type: 'PCF',
    objective: 'Collecter les PCF des 10 principaux fournisseurs Tier-1',
    status: 'active',
    start_date: '2025-01-15',
    end_date: '2025-03-31',
    suppliers: { total: 10, responded: 7, validated: 5 },
    progress: 68,
  },
  {
    id: 2,
    name: 'IMDS Compliance 2025',
    type: 'IMDS',
    objective: 'Mise à jour IMDS 15.0 pour tous les fournisseurs',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    suppliers: { total: 12, responded: 6, validated: 4 },
    progress: 45,
  },
  {
    id: 3,
    name: 'Campagne Mixte Scope 3',
    type: 'MIXED',
    objective: 'Améliorer la couverture données Scope 3',
    status: 'draft',
    start_date: '2025-04-01',
    end_date: '2025-09-30',
    suppliers: { total: 8, responded: 0, validated: 0 },
    progress: 0,
  },
];

const typeConfig = {
  PCF: { icon: Leaf, color: 'bg-green-100 text-green-700', label: 'PCF' },
  IMDS: { icon: FileCheck, color: 'bg-blue-100 text-blue-700', label: 'IMDS' },
  MIXED: { icon: Target, color: 'bg-purple-100 text-purple-700', label: 'Mixte' },
};

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700', label: 'Active', icon: Play },
  draft: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon', icon: null },
  paused: { color: 'bg-yellow-100 text-yellow-700', label: 'En pause', icon: Pause },
  completed: { color: 'bg-blue-100 text-blue-700', label: 'Terminée', icon: CheckCircle2 },
};

export default function CampaignsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-500 mt-1">Gérez vos campagnes d'engagement fournisseurs</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle campagne
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="draft">Brouillons</option>
          <option value="paused">En pause</option>
          <option value="completed">Terminées</option>
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les types</option>
          <option value="PCF">PCF</option>
          <option value="IMDS">IMDS</option>
          <option value="MIXED">Mixte</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Actives</p>
          <p className="text-2xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Fournisseurs engagés</p>
          <p className="text-2xl font-bold text-blue-600">
            {campaigns.reduce((sum, c) => sum + c.suppliers.total, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Taux de réponse moyen</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(campaigns.reduce((sum, c) => sum + c.progress, 0) / campaigns.length)}%
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => {
          const typeInfo = typeConfig[campaign.type as keyof typeof typeConfig];
          const statusInfo = statusConfig[campaign.status as keyof typeof statusConfig];
          const TypeIcon = typeInfo.icon;
          
          return (
            <div 
              key={campaign.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 
                    campaign.type === 'PCF' ? 'bg-green-100' :
                    campaign.type === 'IMDS' ? 'bg-blue-100' : 'bg-purple-100'
                  )}>
                    <TypeIcon className={cn('w-6 h-6',
                      campaign.type === 'PCF' ? 'text-green-600' :
                      campaign.type === 'IMDS' ? 'text-blue-600' : 'text-purple-600'
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge text-xs', typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                      <span className={cn('badge text-xs', statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-1">{campaign.name}</h3>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{campaign.objective}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{campaign.suppliers.total} fournisseurs</span>
                </div>
              </div>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
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
              
              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Réponses:</span>
                    <span className="font-medium text-blue-600 ml-1">
                      {campaign.suppliers.responded}/{campaign.suppliers.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Validés:</span>
                    <span className="font-medium text-green-600 ml-1">
                      {campaign.suppliers.validated}
                    </span>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  Détails
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
