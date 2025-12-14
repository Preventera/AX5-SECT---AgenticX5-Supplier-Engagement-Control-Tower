'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, Target, FileText, Leaf, 
  TrendingUp, TrendingDown, Activity,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface DashboardStats {
  suppliers: number;
  campaigns: number;
  imdsSubmissions: number;
  pcfCoverage: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    suppliers: 0,
    campaigns: 0,
    imdsSubmissions: 0,
    pcfCoverage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const suppliersRes = await fetch('/api/suppliers');
        if (suppliersRes.ok) {
          const suppliers = await suppliersRes.json();
          setStats(prev => ({ ...prev, suppliers: suppliers.length }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsCards = [
    { 
      label: t('dashboard.suppliers'), 
      value: stats.suppliers, 
      icon: Building2, 
      color: 'from-[#8b5cf6] to-[#6366f1]',
      change: '+12%',
      trend: 'up'
    },
    { 
      label: t('dashboard.campaigns'), 
      value: 2, 
      icon: Target, 
      color: 'from-[#06b6d4] to-[#0891b2]',
      change: '+5%',
      trend: 'up'
    },
    { 
      label: t('dashboard.imds_submissions'), 
      value: 5, 
      icon: FileText, 
      color: 'from-[#10b981] to-[#059669]',
      change: '+8%',
      trend: 'up'
    },
    { 
      label: t('dashboard.pcf_coverage'), 
      value: '33%', 
      icon: Leaf, 
      color: 'from-[#f59e0b] to-[#d97706]',
      change: '-2%',
      trend: 'down'
    },
  ];

  const recentActivity = [
    { action: 'Soumission IMDS validée', supplier: 'Marmen Inc.', time: 'Il y a 2h', status: 'success' },
    { action: 'Nouvelle déclaration PCF', supplier: 'Valeo SA', time: 'Il y a 3h', status: 'info' },
    { action: 'Rappel campagne envoyé', supplier: 'Continental AG', time: 'Il y a 5h', status: 'warning' },
    { action: 'Fournisseur ajouté', supplier: 'Plastic Omnium', time: 'Il y a 1j', status: 'info' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-[#71717a]">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card relative overflow-hidden group hover:border-[#3f3f46] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#71717a] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Glow effect */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#8b5cf6]" />
              Activité récente
            </h2>
            <button className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
              Voir tout
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, idx) => {
              const statusColors: Record<string, string> = {
                success: 'text-[#10b981] bg-[#10b981]/15',
                warning: 'text-[#f59e0b] bg-[#f59e0b]/15',
                info: 'text-[#06b6d4] bg-[#06b6d4]/15',
              };
              const StatusIcon = item.status === 'success' ? CheckCircle : item.status === 'warning' ? AlertCircle : Clock;
              
              return (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1e1e2a] transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[item.status]}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.action}</p>
                    <p className="text-xs text-[#71717a]">{item.supplier}</p>
                  </div>
                  <span className="text-xs text-[#71717a]">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Actions rapides</h2>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-xl bg-gradient-to-r from-[#8b5cf6]/20 to-[#06b6d4]/20 border border-[#8b5cf6]/30 text-left hover:border-[#8b5cf6]/50 transition-all group">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white">Ajouter un fournisseur</span>
              </div>
            </button>
            <button className="w-full p-4 rounded-xl bg-gradient-to-r from-[#06b6d4]/20 to-[#10b981]/20 border border-[#06b6d4]/30 text-left hover:border-[#06b6d4]/50 transition-all group">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#06b6d4] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white">Lancer une campagne</span>
              </div>
            </button>
            <button className="w-full p-4 rounded-xl bg-gradient-to-r from-[#10b981]/20 to-[#f59e0b]/20 border border-[#10b981]/30 text-left hover:border-[#10b981]/50 transition-all group">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-[#10b981] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white">Nouvelle déclaration PCF</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Progress */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">Campagnes en cours</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-[#1a1a25] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Campagne IMDS Q1 2025</h3>
              <span className="text-sm text-[#8b5cf6] font-semibold">60%</span>
            </div>
            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden mb-3">
              <div className="h-full w-[60%] bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-full"></div>
            </div>
            <p className="text-xs text-[#71717a]">8 fournisseurs • 5 réponses • 3 validées</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1a1a25] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">PCF Fournisseurs Critiques</h3>
              <span className="text-sm text-[#10b981] font-semibold">40%</span>
            </div>
            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden mb-3">
              <div className="h-full w-[40%] bg-gradient-to-r from-[#10b981] to-[#f59e0b] rounded-full"></div>
            </div>
            <p className="text-xs text-[#71717a]">5 fournisseurs • 2 réponses • 1 validée</p>
          </div>
        </div>
      </div>
    </div>
  );
}
