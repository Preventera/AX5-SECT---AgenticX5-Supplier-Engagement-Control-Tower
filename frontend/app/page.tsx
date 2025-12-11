'use client';

import { useEffect, useState } from 'react';
import {
  Search, Filter, Building2, ChevronDown,
  MoreHorizontal, RefreshCw, Plus
} from 'lucide-react';
import {
  getSuppliers,
  getSuppliersStats,
  Supplier,
  SupplierStats,
  getCountryFlag,
  getSupplierLevelLabel
} from '@/lib/api';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersData, statsData] = await Promise.all([
        getSuppliers({
          search: searchTerm || undefined,
          supply_chain_level: levelFilter || undefined
        }),
        getSuppliersStats(),
      ]);
      setSuppliers(suppliersData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [levelFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchData();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500">Gestion de la base fournisseurs IMDS & PCF</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-600">Total Fournisseurs</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="card bg-green-50 border-green-200">
            <p className="text-sm text-green-600">Tier 1</p>
            <p className="text-3xl font-bold text-green-900">{stats.by_level.tier1}</p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-600">Tier 2</p>
            <p className="text-3xl font-bold text-purple-900">{stats.by_level.tier2}</p>
          </div>
          <div className="card bg-emerald-50 border-emerald-200">
            <p className="text-sm text-emerald-600">PCF Intermédiaire+</p>
            <p className="text-3xl font-bold text-emerald-900">
              {stats.pcf_maturity.intermediate + stats.pcf_maturity.advanced}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous les niveaux</option>
            <option value="tier1">Tier 1</option>
            <option value="tier2">Tier 2</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Familles de pièces
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun fournisseur trouvé
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{supplier.name}</p>
                          <p className="text-sm text-gray-500">{supplier.external_id || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        supplier.supply_chain_level === 'tier1'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getSupplierLevelLabel(supplier.supply_chain_level)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{getCountryFlag(supplier.country_code)}</span>
                        <span className="text-gray-900">{supplier.region || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {supplier.supplier_type || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {supplier.main_part_families?.slice(0, 2).map((family, i) => (
                          <span key={i} className="badge bg-gray-100 text-gray-700 text-xs">
                            {family}
                          </span>
                        ))}
                        {supplier.main_part_families && supplier.main_part_families.length > 2 && (
                          <span className="badge bg-gray-100 text-gray-700 text-xs">
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
      </div>
    </div>
  );
}
