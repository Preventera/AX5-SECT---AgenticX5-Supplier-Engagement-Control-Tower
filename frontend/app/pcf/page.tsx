'use client';

import { useEffect, useState } from 'react';
import {
  Leaf, CheckCircle, Clock, TrendingDown,
  RefreshCw, Plus, Search, BarChart3,
  Globe, Factory
} from 'lucide-react';

interface PCFObject {
  id: number;
  supplier_name: string;
  product_ref: string;
  perimeter: string;
  reference_year: number;
  total_emissions_kgco2e: number;
  validation_status: string;
  method: string;
}

export default function PCFPage() {
  const [pcfObjects, setPCFObjects] = useState<PCFObject[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      setPCFObjects([
        { id: 1, supplier_name: 'Marmen Inc.', product_ref: 'STRUCT-001', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 125.5, validation_status: 'validated', method: 'ISO 14067' },
        { id: 2, supplier_name: 'AGT Robotique', product_ref: 'ROB-AUTO-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 89.2, validation_status: 'validated', method: 'GHG Protocol' },
        { id: 3, supplier_name: 'Faurecia', product_ref: 'INT-SEAT-01', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 234.8, validation_status: 'pending', method: 'Catena-X' },
        { id: 4, supplier_name: 'Plastic Omnium', product_ref: 'EXT-BUMP-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 156.3, validation_status: 'validated', method: 'ISO 14067' },
        { id: 5, supplier_name: 'Aisin Seiki', product_ref: 'DRV-COMP-01', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 198.7, validation_status: 'pending', method: 'GHG Protocol' },
        { id: 6, supplier_name: 'Magna International', product_ref: 'BODY-PNL-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 312.4, validation_status: 'validated', method: 'Catena-X' },
      ]);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      validated: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      validated: 'Validé',
      pending: 'En attente',
      rejected: 'Rejeté',
    };
    return (
      <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const totalEmissions = pcfObjects.reduce((sum, obj) => sum + obj.total_emissions_kgco2e, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PCF / Carbone</h1>
          <p className="text-gray-500">Product Carbon Footprint - Empreinte carbone produits</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau PCF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm text-emerald-600">Total PCF</p>
              <p className="text-3xl font-bold text-emerald-900">{stats?.pcf?.total || 25}</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-green-600">Validés</p>
              <p className="text-3xl font-bold text-green-900">{stats?.pcf?.validated || 10}</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-blue-600">Couverture</p>
              <p className="text-3xl font-bold text-blue-900">{stats?.pcf?.coverage || 50}%</p>
            </div>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-purple-600">Émissions totales</p>
              <p className="text-2xl font-bold text-purple-900">
                {(stats?.emissions?.total_tco2e || 6.5).toFixed(1)} tCO₂e
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-emerald-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Bilan Carbone Fournisseurs</h3>
            <p className="text-emerald-100">Scope 3 - Émissions amont de la chaîne d'approvisionnement</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{totalEmissions.toFixed(1)} kg CO₂e</p>
            <p className="text-emerald-100 flex items-center justify-end gap-1">
              <TrendingDown className="w-4 h-4" />
              -5.2% vs année précédente
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par produit, fournisseur..."
            className="input pl-10 w-full"
          />
        </div>
        <select className="input w-48">
          <option value="">Tous les statuts</option>
          <option value="validated">Validés</option>
          <option value="pending">En attente</option>
        </select>
        <select className="input w-48">
          <option value="">Toutes les méthodes</option>
          <option value="ISO 14067">ISO 14067</option>
          <option value="GHG Protocol">GHG Protocol</option>
          <option value="Catena-X">Catena-X</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Périmètre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Année</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Émissions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Méthode</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : (
                pcfObjects.map((pcf) => (
                  <tr key={pcf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Factory className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900">{pcf.supplier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      {pcf.product_ref}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-gray-100 text-gray-700">
                        {pcf.perimeter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pcf.reference_year}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {pcf.total_emissions_kgco2e.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">kg CO₂e</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-blue-100 text-blue-700">
                        {pcf.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pcf.validation_status)}
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
