'use client';

import { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Building2,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IMDSSubmission {
  id: number;
  supplier_id: number;
  supplier_name: string;
  campaign_id: number;
  campaign_name: string;
  internal_ref: string;
  mds_id: string;
  part_number: string;
  oem: string;
  submitted_at: string;
  status: string;
  rejection_reason: string | null;
  iteration_count: number;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; class: string; bgClass: string }> = {
  validated: { 
    label: 'Validé', 
    icon: CheckCircle2, 
    class: 'text-green-700',
    bgClass: 'bg-green-100'
  },
  submitted: { 
    label: 'Soumis', 
    icon: Clock, 
    class: 'text-blue-700',
    bgClass: 'bg-blue-100'
  },
  pending: { 
    label: 'En attente', 
    icon: Clock, 
    class: 'text-yellow-700',
    bgClass: 'bg-yellow-100'
  },
  draft: { 
    label: 'Brouillon', 
    icon: FileText, 
    class: 'text-gray-700',
    bgClass: 'bg-gray-100'
  },
  rejected: { 
    label: 'Rejeté', 
    icon: XCircle, 
    class: 'text-red-700',
    bgClass: 'bg-red-100'
  },
};

export default function IMDSPage() {
  const [submissions, setSubmissions] = useState<IMDSSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/imds');
      if (!response.ok) throw new Error('Failed to fetch IMDS submissions');
      const data = await response.json();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des soumissions IMDS');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.mds_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.part_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    validated: submissions.filter(s => s.status === 'validated').length,
    pending: submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soumissions IMDS</h1>
          <p className="text-gray-500 mt-1">Gestion des Material Data Sheets</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSubmissions}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Nouvelle soumission
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
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
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejetés</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats.rejected}</p>
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
            placeholder="Rechercher par MDS ID, fournisseur, pièce..."
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
          <option value="submitted">Soumis</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetés</option>
          <option value="draft">Brouillons</option>
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
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">MDS ID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">FOURNISSEUR</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">PIÈCE</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">OEM</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">STATUT</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">DATE</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Chargement...
                </td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Aucune soumission trouvée
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => {
                const status = statusConfig[submission.status] || statusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {submission.mds_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{submission.supplier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{submission.part_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{submission.oem}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        status.bgClass,
                        status.class
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {submission.submitted_at 
                          ? new Date(submission.submitted_at).toLocaleDateString('fr-CA')
                          : '-'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
