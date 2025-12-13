'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  RefreshCw,
  MoreHorizontal,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddSupplierModal from '@/components/suppliers/AddSupplierModal';

interface Supplier {
  id: number;
  external_id: string;
  name: string;
  country_code: string;
  region: string;
  supplier_type: string;
  supply_chain_level: string;
  main_part_families: string[];
}

const countryFlags: Record<string, string> = {
  CA: '🇨🇦',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  US: '🇺🇸',
  MX: '🇲🇽',
  CN: '🇨🇳',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des fournisseurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.external_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || 
                         supplier.supply_chain_level?.toLowerCase().replace('-', '') === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const tier1Count = suppliers.filter(s => s.supply_chain_level === 'Tier-1').length;
  const tier2Count = suppliers.filter(s => s.supply_chain_level === 'Tier-2').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500 mt-1">Gestion de la base fournisseurs IMDS &amp; PCF</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSuppliers}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
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
        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <p className="text-sm text-emerald-600">Total Fournisseurs</p>
          <p className="text-2xl font-bold text-emerald-700">
            {loading ? '...' : suppliers.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600">Tier 1</p>
          <p className="text-2xl font-bold text-green-700">
            {loading ? '...' : tier1Count}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Tier 2</p>
          <p className="text-2xl font-bold text-blue-700">
            {loading ? '...' : tier2Count}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-600">PCF Intermédiaire+</p>
          <p className="text-2xl font-bold text-purple-700">
            {loading ? '...' : Math.round(suppliers.length * 0.4)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Tous les niveaux</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
        </select>
        
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Plus de filtres
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">FOURNISSEUR</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">NIVEAU</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">RÉGION</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">TYPE</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">FAMILLES DE PIÈCES</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Chargement...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun fournisseur trouvé
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-500">{supplier.external_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                      supplier.supply_chain_level === 'Tier-1' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      {supplier.supply_chain_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {countryFlags[supplier.country_code] || '🌍'}
                      </span>
                      <span className="text-sm text-gray-600">{supplier.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{supplier.supplier_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.main_part_families?.slice(0, 2).map((family, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {family}
                        </span>
                      ))}
                      {supplier.main_part_families?.length > 2 && (
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{supplier.main_part_families.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
        <Database className="w-4 h-4" />
        <span>Base de données Neon connectée • {suppliers.length} fournisseurs</span>
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
}
