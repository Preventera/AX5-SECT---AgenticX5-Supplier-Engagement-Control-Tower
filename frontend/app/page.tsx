'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  FileCheck, 
  Leaf,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import CampaignProgress from '@/components/dashboard/CampaignProgress';
import RecentActivity from '@/components/dashboard/RecentActivity';
import EmissionsChart from '@/components/dashboard/EmissionsChart';

export default function Dashboard() {
  const [stats, setStats] = useState({
    suppliers: { total: 12, tier1: 10, tier2: 2 },
    campaigns: { total: 3, active: 2 },
    imds: { total: 15, validated: 12, pending: 3 },
    pcf: { total: 25, validated: 18, coverage: 72 },
    emissions: { total: 12500.5, trend: -5.2 },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de l'engagement fournisseurs</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Dernière mise à jour: il y a 5 min</span>
          <button className="btn-primary flex items-center gap-2">
            <Target className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Fournisseurs"
          value={stats.suppliers.total}
          subtitle={`${stats.suppliers.tier1} Tier-1 • ${stats.suppliers.tier2} Tier-2`}
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Campagnes actives"
          value={stats.campaigns.active}
          subtitle={`${stats.campaigns.total} au total`}
          icon={Target}
          color="purple"
        />
        <StatsCard
          title="Soumissions IMDS"
          value={stats.imds.total}
          subtitle={`${stats.imds.validated} validées • ${stats.imds.pending} en attente`}
          icon={FileCheck}
          color="green"
        />
        <StatsCard
          title="Données PCF"
          value={`${stats.pcf.coverage}%`}
          subtitle={`${stats.pcf.validated}/${stats.pcf.total} fournisseurs couverts`}
          icon={Leaf}
          color="emerald"
          trend={stats.emissions.trend}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Progress */}
        <div className="lg:col-span-2">
          <CampaignProgress />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Emissions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionsChart />
        
        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-header">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Lancer une collecte IMDS</p>
                <p className="text-sm text-gray-500">Envoyer des demandes aux fournisseurs</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Campagne PCF</p>
                <p className="text-sm text-gray-500">Collecter les empreintes carbone</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Relancer les retardataires</p>
                <p className="text-sm text-gray-500">3 fournisseurs en attente</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">IMDS Status</h3>
            <span className="badge badge-green">Opérationnel</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Validés</span>
              <span className="font-medium text-green-600">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">En attente</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rejetés</span>
              <span className="font-medium text-red-600">0</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">PCF Coverage</h3>
            <span className="badge badge-blue">72%</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tier-1 couverts</span>
              <span className="font-medium">8/10</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Données primaires</span>
              <span className="font-medium">65%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Qualité moyenne</span>
              <span className="font-medium text-green-600">Bonne</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Émissions Scope 3</h3>
            <span className="badge badge-green flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              -5.2%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total collecté</span>
              <span className="font-medium">12.5 t CO₂e</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Objectif SBTi</span>
              <span className="font-medium">-30% d'ici 2030</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-green-600">Sur la bonne voie</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
