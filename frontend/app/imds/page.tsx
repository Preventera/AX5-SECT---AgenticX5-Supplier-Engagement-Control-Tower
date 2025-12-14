'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, Plus, Search, RefreshCw, 
  MoreHorizontal, Edit, Trash2, CheckCircle, Clock, XCircle
} from 'lucide-react';
import IMDSModal from '@/components/modals/IMDSModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

interface IMDSSubmission {
  id: number;
  supplier_id: number;
  supplier_name?: string;
  mds_id: string;
  part_number: string;
  part_name?: string;
  oem?: string;
  validation_status: string;
  submitted_at?: string;
  validated_at?: string;
  notes?: string;
}

interface Supplier {
  id: number;
  name: string;
}

export default function IMDSPage() {
  const [submissions, setSubmissions] = useState<IMDSSubmission[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<IMDSSubmission | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<IMDSSubmission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [imdsRes, suppliersRes] = await Promise.all([
        fetch('/api/imds'),
        fetch('/api/suppliers')
      ]);
      
      if (imdsRes.ok) {
        const data = await imdsRes.json();
        setSubmissions(data);
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

  const handleSaveSubmission = async (submission: any) => {
    const method = submission.id ? 'PUT' : 'POST';
    const res = await fetch('/api/imds', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    await fetchData();
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/imds?id=${submissionToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      await fetchData();
      setIsDeleteDialogOpen(false);
      setSubmissionToDelete(null);
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

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.mds_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || s.validation_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    validated: submissions.filter(s => s.validation_status === 'validated').length,
    pending: submissions.filter(s => s.validation_status === 'pending').length,
    rejected: submissions.filter(s => s.validation_status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soumissions IMDS</h1>
          <p className="text-gray-500">Gestion des Material Data Sheets</p>
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
            onClick={() => { setEditingSubmission(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle soumission
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Validées</p>
          <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rejetées</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par MDS ID, pièce, fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="validated">Validées</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MDS ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pièce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OEM</th>
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
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucune soumission trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-mono text-sm font-medium">{submission.mds_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{submission.supplier_name || '-'}</td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm">{submission.part_number}</p>
                      {submission.part_name && (
                        <p className="text-xs text-gray-500">{submission.part_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{submission.oem || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(submission.validation_status)}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === submission.id ? null : submission.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openMenuId === submission.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                setEditingSubmission(submission);
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
                                setSubmissionToDelete(submission);
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
      <IMDSModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSubmission(null); }}
        onSave={handleSaveSubmission}
        submission={editingSubmission}
        suppliers={suppliers}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSubmissionToDelete(null); }}
        onConfirm={handleDeleteSubmission}
        title="Supprimer la soumission"
        message={`Êtes-vous sûr de vouloir supprimer la soumission "${submissionToDelete?.mds_id}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
