'use client';

import { useEffect, useState } from 'react';
import { 
  Leaf, Plus, Search, RefreshCw, TrendingDown,
  MoreHorizontal, Edit, Trash2, CheckCircle, Clock, XCircle, Factory
} from 'lucide-react';
import PCFModal from '@/components/modals/PCFModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

interface PCFDeclaration {
  id: number;
  supplier_id: number;
  supplier_name?: string;
  product_ref: string;
  product_name?: string;
  perimeter: string;
  reference_year: number;
  total_emissions_kgco2e: number;
  method: string;
  validation_status: string;
  notes?: string;
}

interface Supplier {
  id: number;
  name: string;
}

const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0.0';
  return Number(value).toFixed(decimals);
};

export default function PCFPage() {
  const [declarations, setDeclarations] = useState<PCFDeclaration[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPCF, setEditingPCF] = useState<PCFDeclaration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pcfToDelete, setPCFToDelete] = useState<PCFDeclaration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pcfRes, suppliersRes] = await Promise.all([
        fetch('/api/pcf'),
        fetch('/api/suppliers')
      ]);
      
      if (pcfRes.ok) {
        const data = await pcfRes.json();
        setDeclarations(data);
      }
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSavePCF = async (pcf: any) => {
    const method = pcf.id ? 'PUT' : 'POST';
    const res = await fetch('/api/pcf', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pcf)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    await fetchData();
  };

  const handleDeletePCF = async () => {
    if (!pcfToDelete) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/pcf?id=${pcfToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      await fetchData();
      setIsDeleteDialogOpen(false);
      setPCFToDelete(null);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      validated: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Validé' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejeté' },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const filteredDeclarations = declarations.filter(d => {
    const matchesSearch = 
      d.product_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || d.validation_status === filterStatus;
    const matchesMethod = !filterMethod || d.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalEmissions = declarations.reduce((sum, d) => sum + (Number(d.total_emissions_kgco2e) || 0), 0);
  const stats = {
    total: declarations.length,
    validated: declarations.filter(d => d.validation_status === 'validated').length,
    pending: declarations.filter(d => d.validation_status === 'pending').length,
    emissions: totalEmissions,
  };

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
          <button 
            onClick={() => { setEditingPCF(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle déclaration
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total PCF</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Validés</p>
              <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Émissions totales</p>
              <p className="text-xl font-bold text-blue-600">{safeToFixed(stats.emissions)} <span className="text-sm font-normal">kg CO₂e</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Bilan Carbone Fournisseurs Scope 3</h3>
            <p className="text-3xl font-bold mt-2">{safeToFixed(stats.emissions)} kg CO₂e</p>
            <p className="text-sm opacity-75 mt-1">Basé sur {stats.total} déclarations PCF</p>
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par produit, fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="validated">Validés</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetés</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">Toutes les méthodes</option>
          <option value="ISO 14067">ISO 14067</option>
          <option value="GHG Protocol">GHG Protocol</option>
          <option value="Catena-X">Catena-X</option>
          <option value="PEF">PEF</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Périmètre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Émissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : filteredDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Leaf className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucune déclaration PCF trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredDeclarations.map((pcf) => (
                  <tr key={pcf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Factory className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900">{pcf.supplier_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm">{pcf.product_ref}</p>
                      {pcf.product_name && (
                        <p className="text-xs text-gray-500">{pcf.product_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {pcf.perimeter}
                      </span>
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
                    <td className="px-6 py-4">{getStatusBadge(pcf.validation_status)}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === pcf.id ? null : pcf.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openMenuId === pcf.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                setEditingPCF(pcf);
                                setIsModalOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                setPCFToDelete(pcf);
                                setIsDeleteDialogOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <PCFModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPCF(null); }}
        onSave={handleSavePCF}
        pcf={editingPCF}
        suppliers={suppliers}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setPCFToDelete(null); }}
        onConfirm={handleDeletePCF}
        title="Supprimer la déclaration PCF"
        message={`Êtes-vous sûr de vouloir supprimer la déclaration "${pcfToDelete?.product_ref}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
