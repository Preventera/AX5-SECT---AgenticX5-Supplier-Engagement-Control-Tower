'use client';

import { useState, useEffect } from 'react';
import { 
  Leaf, 
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Calendar,
  MoreHorizontal,
  TrendingDown,
  Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PCFObject {
  id: number;
  supplier_id: number;
  supplier_name: string;
  campaign_id: number;
  campaign_name: string;
  product_ref: string;
  perimeter: string;
  reference_year: number;
  total_emissions_kgco2e: number;
  method: string;
  frameworks: string[];
  validation_status: string;
  validation_notes: string | null;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; class: string; bgClass: string }> = {
  validated: { 
    label: 'Validé', 
    icon: CheckCircle2, 
    class: 'text-green-700',
    bgClass: 'bg-green-100'
  },
  pending: { 
    label: 'En révision', 
    icon: Clock, 
    class: 'text-yellow-700',
    bgClass: 'bg-yellow-100'
  },
  rejected: { 
    label: 'Rejeté', 
    icon: XCircle, 
    class: 'text-red-700',
    bgClass: 'bg-red-100'
  },
};

export default function PCFPage() {
  const [pcfObjects, setPcfObjects] = useState<PCFObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchPCF = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pcf');
      if (!response.ok) throw new Error('Failed to fetch PCF data');
      const data = await response.json();
      setPcfObjects(data);
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des données PCF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPCF();
  }, []);

  const filteredPCF = pcfObjects.filter(pcf => {
    const matchesSearch = 
      pcf.product_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pcf.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pcf.validation_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pcfObjects.length,
    validated: pcfObjects.filter(p => p.validation_status === 'validated').length,
    pending: pcfObjects.filter(p => p.validation_status === 'pending').length,
    totalEmissions: pcfObjects.reduce((sum, p) => sum + (p.total_emissions_kgco2e || 0), 0),
  };

  const formatEmissions = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}t`;
    }
    return `${value.toFixed(0)} kg`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PCF / Carbone</h1>
          <p className="text-gray-500 mt-1">Product Carbon Footprint - Empreinte carbone produits</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPCF}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Nouvelle collecte PCF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total PCF</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Validés</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.validated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En révision</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Émissions totales</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? '...' : formatEmissions(stats.totalEmissions)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par référence produit, fournisseur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="validated">Validés</option>
          <option value="pending">En révision</option>
          <option value="rejected">Rejetés</option>
        </select>
        
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Plus de filtres
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredPCF.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun PCF trouvé
          </div>
        ) : (
          filteredPCF.map((pcf) => {
            const status = statusConfig[pcf.validation_status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div 
                key={pcf.id} 
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Factory className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{pcf.product_ref}</p>
                      <p className="text-sm text-gray-500">{pcf.supplier_name}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    status.bgClass,
                    status.class
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                {/* Emissions */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Émissions CO₂e</span>
                    <span className="text-lg font-bold text-gray-900">
                      {pcf.total_emissions_kgco2e?.toLocaleString()} kg
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Périmètre</span>
                    <span className="font-medium text-gray-700">{pcf.perimeter}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Année de référence</span>
                    <span className="font-medium text-gray-700">{pcf.reference_year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Méthode</span>
                    <span className="font-medium text-gray-700">{pcf.method}</span>
                  </div>
                </div>

                {/* Frameworks */}
                {pcf.frameworks && pcf.frameworks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {pcf.frameworks.map((fw, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Voir détails →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
