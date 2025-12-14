'use client';

import { useEffect, useState } from 'react';
import { 
  Building, Plus, Search, RefreshCw, 
  MoreHorizontal, Edit, Trash2, Mail,
  Globe, MapPin, CheckCircle, XCircle, Clock
} from 'lucide-react';
import SupplierModal from '@/components/modals/SupplierModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

interface Supplier {
  id: number;
  name: string;
  email?: string;           // from database
  contact_email?: string;   // for form compatibility
  contact_name?: string;
  tier: number;
  country?: string;
  city?: string;
  industry?: string;
  status: string;
  created_at?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        // Map email to contact_email for frontend compatibility
        const mappedData = data.map((s: any) => ({
          ...s,
          contact_email: s.email || s.contact_email,
          tier: s.tier || s.supply_chain_level || 1,
          status: s.status || 'active'
        }));
        setSuppliers(mappedData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSaveSupplier = async (supplier: any) => {
    const method = supplier.id ? 'PUT' : 'POST';
    const res = await fetch('/api/suppliers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    await fetchSuppliers();
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/suppliers?id=${supplierToDelete.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchSuppliers();
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (supplier: Supplier) => {
    // Ensure contact_email is set for the form
    const supplierForEdit = {
      ...supplier,
      contact_email: supplier.email || supplier.contact_email
    };
    setEditingSupplier(supplierForEdit);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Actif' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Inactif' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
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

  const getTierBadge = (tier: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-purple-100 text-purple-700',
      3: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tier] || 'bg-gray-100 text-gray-700'}`}>
        Tier-{tier}
      </span>
    );
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const email = s.email || s.contact_email || '';
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !filterTier || s.tier === parseInt(filterTier);
    const matchesStatus = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Stats
  const stats = {
    total: suppliers.length,
    tier1: suppliers.filter(s => s.tier === 1).length,
    tier2: suppliers.filter(s => s.tier === 2).length,
    active: suppliers.filter(s => s.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500">Gestion des fournisseurs et contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSuppliers}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button 
            onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tier-1</p>
          <p className="text-2xl font-bold text-blue-600">{stats.tier1}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tier-2</p>
          <p className="text-2xl font-bold text-purple-600">{stats.tier2}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">Tous les tiers</option>
          <option value="1">Tier-1</option>
          <option value="2">Tier-2</option>
          <option value="3">Tier-3</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Building className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucun fournisseur trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{supplier.name}</p>
                          {supplier.industry && (
                            <p className="text-xs text-gray-500">{supplier.industry}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(supplier.email || supplier.contact_email) ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {supplier.email || supplier.contact_email}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                      {supplier.contact_name && (
                        <p className="text-xs text-gray-500 mt-1">{supplier.contact_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {supplier.city || supplier.country ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getTierBadge(supplier.tier || 1)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(supplier.status || 'pending')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === supplier.id ? null : supplier.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openMenuId === supplier.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              onClick={() => openDeleteDialog(supplier)}
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
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSupplier(null); }}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSupplierToDelete(null); }}
        onConfirm={handleDeleteSupplier}
        title="Supprimer le fournisseur"
        message={`Êtes-vous sûr de vouloir supprimer "${supplierToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
