'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  FileCheck, 
  Leaf,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import CampaignProgress from '@/components/dashboard/CampaignProgress';
import RecentActivity from '@/components/dashboard/RecentActivity';
import EmissionsChart from '@/components/dashboard/EmissionsChart';

interface DashboardStats {
  totalSuppliers: number;
  tier1: number;
  tier2: number;
  activeCampaigns: number;
  totalImds: number;
  totalPcf: number;
  pcfIntermediatePlus: number;
  imdsStats: Record<string, number>;
  pcfStats: Record<string, number>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    tier1: 0,
    tier2: 0,
    activeCampaigns: 0,
    totalImds: 0,
    totalPcf: 0,
    pcfIntermediatePlus: 0,
    imdsStats: {},
    pcfStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const imdsValidated = stats.imdsStats?.validated || 0;
  const imdsPending = stats.imdsStats?.pending || 0;
  const pcfValidated = stats.pcfStats?.validated || 0;
  const pcfPending = stats.pcfStats?.pending || 0;
  const pcfCoverage = stats.totalSuppliers > 0 
    ? Math.round((stats.pcfIntermediatePlus / stats.totalSuppliers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d&apos;ensemble de l&apos;engagement fournisseurs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Target className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Fournisseurs"
          value={loading ? '...' : stats.totalSuppliers}
          subtitle={`${stats.tier1} Tier-1 • ${stats.tier2} Tier-2`}
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Campagnes actives"
          value={loading ? '...' : stats.activeCampaigns}
          subtitle="campagnes en cours"
          icon={Target}
          color="purple"
        />
        <StatsCard
          title="Soumissions IMDS"
          value={loading ? '...' : stats.totalImds}
          subtitle={`${imdsValidated} validées • ${imdsPending} en attente`}
          icon={FileCheck}
          color="green"
        />
        <StatsCard
          title="Données PCF"
          value={loading ? '...' : `${pcfCoverage}%`}
          subtitle={`${stats.pcfIntermediatePlus}/${stats.totalSuppliers} fournisseurs couverts`}
          icon={Leaf}
          color="emerald"
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
                <p className="text-sm text-gray-500">{imdsPending + pcfPending} fournisseurs en attente</p>
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
              <span className="font-medium text-green-600">{imdsValidated}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">En attente</span>
              <span className="font-medium text-yellow-600">{imdsPending}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rejetés</span>
              <span className="font-medium text-red-600">{stats.imdsStats?.rejected || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">PCF Coverage</h3>
            <span className="badge badge-blue">{pcfCoverage}%</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tier-1 couverts</span>
              <span className="font-medium">{stats.pcfIntermediatePlus}/{stats.tier1}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">PCF validés</span>
              <span className="font-medium">{pcfValidated}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">En attente</span>
              <span className="font-medium text-yellow-600">{pcfPending}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Émissions Scope 3</h3>
            <span className="badge badge-green flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              En cours
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total PCF</span>
              <span className="font-medium">{stats.totalPcf} objets</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Objectif SBTi</span>
              <span className="font-medium">-30% d&apos;ici 2030</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Base de données</span>
              <span className="font-medium text-green-600">Connectée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
