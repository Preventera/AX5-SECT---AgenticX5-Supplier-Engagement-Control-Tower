'use client';

import { useEffect, useState } from 'react';
import {
  Target, FileText, Leaf, Calendar, Users,
  ChevronRight, Plus, RefreshCw, Filter
} from 'lucide-react';
import {
  getCampaigns,
  getCampaignsStats,
  Campaign,
  CampaignStats,
  formatDate,
  getStatusColor
} from '@/lib/api';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsData, statsData] = await Promise.all([
        getCampaigns({
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        }),
        getCampaignsStats(),
      ]);
      setCampaigns(campaignsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PCF': return <Leaf className="w-4 h-4" />;
      case 'IMDS': return <FileText className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PCF': return 'bg-green-100 text-green-800';
      case 'IMDS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-500">Suivi des campagnes IMDS et PCF</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-600">Total Campagnes</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="card bg-green-50 border-green-200">
            <p className="text-sm text-green-600">Actives</p>
            <p className="text-3xl font-bold text-green-900">{stats.active}</p>
          </div>
          <div className="card bg-gray-50 border-gray-200">
            <p className="text-sm text-gray-600">Brouillons</p>
            <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-600">Fournisseurs engagés</p>
            <p className="text-3xl font-bold text-purple-900">{stats.total_suppliers_engaged}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="draft">Brouillons</option>
          <option value="paused">En pause</option>
          <option value="completed">Terminées</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input"
        >
          <option value="">Tous les types</option>
          <option value="PCF">PCF</option>
          <option value="IMDS">IMDS</option>
          <option value="MIXED">Mixte</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune campagne trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`badge flex items-center gap-1 ${getTypeColor(campaign.type)}`}>
                    {getTypeIcon(campaign.type)}
                    {campaign.type}
                  </span>
                  <span className={`badge ${getStatusColor(campaign.status)}`}>
                    {campaign.status === 'active' ? 'Active' :
                     campaign.status === 'draft' ? 'Brouillon' :
                     campaign.status === 'paused' ? 'En pause' : 'Terminée'}
                  </span>
                </div>
              </div>

              {/* Title & Objective */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {campaign.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {campaign.objective || 'Pas d\'objectif défini'}
              </p>

              {/* Dates */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{campaign.suppliers_total} fournisseurs</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">
                    Réponses: <span className="font-medium text-gray-900">{campaign.suppliers_responded}</span>
                  </span>
                  <span className="text-gray-500">
                    Validés: <span className="font-medium text-green-600">{campaign.suppliers_validated}</span>
                  </span>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  Détails
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
