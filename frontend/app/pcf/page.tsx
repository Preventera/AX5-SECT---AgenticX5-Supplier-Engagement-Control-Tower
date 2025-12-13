'use client';

import { useEffect, useState } from 'react';
import { 
  Leaf, CheckCircle, Clock, TrendingDown,
  RefreshCw, Plus, Search, BarChart3,
  Globe, Factory, MoreHorizontal
} from 'lucide-react';

interface PCFObject {
  id: number;
  supplier_name: string;
  product_ref: string;
  perimeter: string;
  reference_year: number;
  total_emissions_kgco2e: number | null;
  validation_status: string;
  method: string;
}

// Helper function to safely format numbers
const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.0';
  }
  return Number(value).toFixed(decimals);
};

export default function PCFPage() {
  const [pcfObjects, setPCFObjects] = useState<PCFObject[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Try to fetch PCF data from API
      const pcfRes = await fetch('/api/pcf');
      if (pcfRes.ok) {
        const pcfData = await pcfRes.json();
        if (pcfData && Array.isArray(pcfData)) {
          setPCFObjects(pcfData);
        } else {
          // Fallback to mock data
          setMockData();
        }
      } else {
        // Fallback to mock data
        setMockData();
      }
    } catch (err) {
      console.error('Erreur:', err);
      // Fallback to mock data on error
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setPCFObjects([
      { id: 1, supplier_name: 'Marmen Inc.', product_ref: 'STRUCT-001', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 125.5, validation_status: 'validated', method: 'ISO 14067' },
      { id: 2, supplier_name: 'AGT Robotique', product_ref: 'ROB-AUTO-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 89.2, validation_status: 'validated', method: 'GHG Protocol' },
      { id: 3, supplier_name: 'Faurecia Interiors', product_ref: 'INT-SEAT-01', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 234.8, validation_status: 'pending', method: 'Catena-X' },
      { id: 4, supplier_name: 'Plastic Omnium', product_ref: 'EXT-BUMP-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 156.3, validation_status: 'validated', method: 'ISO 14067' },
      { id: 5, supplier_name: 'Continental AG', product_ref: 'ELEC-MOD-01', perimeter: 'cradle-to-gate', reference_year: 2024, total_emissions_kgco2e: 198.7, validation_status: 'pending', method: 'GHG Protocol' },
      { id: 6, supplier_name: 'Ambiance Bois Structures', product_ref: 'WOOD-PNL-01', perimeter: 'A1-A3', reference_year: 2024, total_emissions_kgco2e: 45.2, validation_status: 'validated', method: 'Catena-X' },
    ]);
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Safely calculate total emissions
  const totalEmissions = pcfObjects.reduce((sum, obj) => {
    const value = Number(obj.total_emissions_kgco2e) || 0;
    return sum + value;
  }, 0);

  const validatedCount = pcfObjects.filter(p => p.validation_status === 'validated').length;
  const pendingCount = pcfObjects.filter(p => p.validation_status === 'pending').length;

  // Filter PCF objects based on search
  const filteredPCF = pcfObjects.filter(pcf => 
    pcf.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pcf.product_ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PCF / Carbone</h1>
          <p className="text-gray-500">Product Carbon Footprint - Empreinte carbone produits</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle déclaration
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total PCF</p>
              <p className="text-2xl font-bold text-gray-900">{pcfObjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Validés</p>
              <p className="text-2xl font-bold text-green-600">{validatedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Émissions totales</p>
              <p className="text-2xl font-bold text-blue-600">{safeToFixed(totalEmissions, 1)} <span className="text-sm font-normal">kg CO₂e</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Bilan Carbone Fournisseurs Scope 3</h3>
            <p className="text-3xl font-bold mt-2">{safeToFixed(totalEmissions, 1)} kg CO₂e</p>
            <p className="text-sm opacity-75 mt-1">Basé sur {pcfObjects.length} déclarations PCF</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">-5.2%</span>
            </div>
            <p className="text-sm opacity-75 mt-2">vs année précédente</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par fournisseur, produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
          <option value="">Tous les statuts</option>
          <option value="validated">Validés</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetés</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
          <option value="">Toutes les méthodes</option>
          <option value="ISO 14067">ISO 14067</option>
          <option value="GHG Protocol">GHG Protocol</option>
          <option value="Catena-X">Catena-X</option>
        </select>
      </div>

      {/* PCF Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périmètre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Émissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : filteredPCF.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Leaf className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-gray-500 mt-2">Aucune déclaration PCF trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredPCF.map((pcf) => (
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {pcf.perimeter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pcf.reference_year}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {safeToFixed(pcf.total_emissions_kgco2e)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">kg CO₂e</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {pcf.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pcf.validation_status)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
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
