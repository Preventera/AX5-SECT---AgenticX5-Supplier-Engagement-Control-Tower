'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, Plus, Search, RefreshCw, 
  MoreHorizontal, Edit, Trash2, Mail,
  MapPin, CheckCircle, XCircle, Clock
} from 'lucide-react';
import SupplierModal from '@/components/modals/SupplierModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useTranslation } from '@/contexts/TranslationContext';

interface Supplier {
  id?: number;
  name: string;
  email?: string;
  contact_email?: string;
  contact_name?: string;
  tier: number;
  country?: string;
  city?: string;
  industry?: string;
  status: string;
  created_at?: string;
}

export default function SuppliersPage() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((s: any) => ({
          ...s,
          contact_email: s.email || s.contact_email || '',
          tier: s.tier || s.supply_chain_level || 1,
          status: s.status || 'active'
        }));
        setSuppliers(mappedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSaveSupplier = async (supplier: Supplier) => {
    const method = supplier.id ? 'PUT' : 'POST';
    const res = await fetch('/api/suppliers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error saving');
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

      if (!res.ok) throw new Error('Error deleting');

      await fetchSuppliers();
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      active: { bg: 'bg-[#10b981]/15', text: 'text-[#10b981]', icon: CheckCircle },
      inactive: { bg: 'bg-[#71717a]/15', text: 'text-[#71717a]', icon: XCircle },
      pending: { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', icon: Clock },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {t(`status.${status}`)}
      </span>
    );
  };

  const getTierBadge = (tier: number) => {
    const colors: Record<number, string> = {
      1: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
      2: 'bg-[#06b6d4]/15 text-[#06b6d4]',
      3: 'bg-[#f59e0b]/15 text-[#f59e0b]',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[tier] || 'bg-[#71717a]/15 text-[#71717a]'}`}>
        Tier-{tier}
      </span>
    );
  };

  const filteredSuppliers = suppliers.filter(s => {
    const email = s.email || s.contact_email || '';
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !filterTier || s.tier === parseInt(filterTier);
    const matchesStatus = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const stats = {
    total: suppliers.length,
    tier1: suppliers.filter(s => s.tier === 1).length,
    tier2: suppliers.filter(s => s.tier === 2).length,
    active: suppliers.filter(s => s.status === 'active').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('suppliers.title')}</h1>
          <p className="text-[#71717a]">{t('suppliers.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSuppliers}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('suppliers.refresh')}
          </button>
          <button 
            onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('suppliers.add')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">{t('suppliers.total')}</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">Tier-1</p>
          <p className="text-3xl font-bold text-[#8b5cf6] mt-1">{stats.tier1}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">Tier-2</p>
          <p className="text-3xl font-bold text-[#06b6d4] mt-1">{stats.tier2}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">{t('suppliers.active')}</p>
          <p className="text-3xl font-bold text-[#10b981] mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder={t('suppliers.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark w-full pl-10"
          />
        </div>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
        >
          <option value="">{t('suppliers.all_tiers')}</option>
          <option value="1">Tier-1</option>
          <option value="2">Tier-2</option>
          <option value="3">Tier-3</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t('suppliers.all_status')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="inactive">{t('status.inactive')}</option>
          <option value="pending">{t('status.pending')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="table-dark">
          <thead>
            <tr>
              <th>{t('suppliers.name')}</th>
              <th>{t('suppliers.contact')}</th>
              <th>{t('suppliers.location')}</th>
              <th>{t('suppliers.tier')}</th>
              <th>{t('suppliers.status')}</th>
              <th>{t('suppliers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8b5cf6]" />
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Building2 className="w-10 h-10 mx-auto text-[#3f3f46] mb-3" />
                  <p className="text-[#71717a]">{t('suppliers.none_found')}</p>
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{supplier.name}</p>
                        {supplier.industry && (
                          <p className="text-xs text-[#71717a]">{supplier.industry}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {(supplier.email || supplier.contact_email) ? (
                      <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                        <Mail className="w-4 h-4 text-[#71717a]" />
                        {supplier.email || supplier.contact_email}
                      </div>
                    ) : (
                      <span className="text-[#3f3f46]">-</span>
                    )}
                  </td>
                  <td>
                    {supplier.city || supplier.country ? (
                      <div className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
                        <MapPin className="w-4 h-4 text-[#71717a]" />
                        {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                      </div>
                    ) : (
                      <span className="text-[#3f3f46]">-</span>
                    )}
                  </td>
                  <td>{getTierBadge(supplier.tier || 1)}</td>
                  <td>{getStatusBadge(supplier.status || 'pending')}</td>
                  <td>
                    <div className="action-menu relative">
                      <button
                        type="button"
                        onClick={() => toggleMenu(supplier.id || 0)}
                        className="p-2 hover:bg-[#1e1e2a] rounded-lg cursor-pointer text-[#71717a] hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === supplier.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-[#1a1a25] rounded-lg shadow-xl border border-[#27272a] py-1 z-50">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSupplier({
                                ...supplier,
                                contact_email: supplier.email || supplier.contact_email || ''
                              });
                              setIsModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            {t('suppliers.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSupplierToDelete(supplier);
                              setIsDeleteDialogOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('suppliers.delete')}
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

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSupplier(null); }}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSupplierToDelete(null); }}
        onConfirm={handleDeleteSupplier}
        title={t('suppliers.delete_confirm')}
        message={`${t('suppliers.delete_message')} "${supplierToDelete?.name}" ? ${t('suppliers.delete_warning')}`}
        confirmText={t('suppliers.delete')}
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
