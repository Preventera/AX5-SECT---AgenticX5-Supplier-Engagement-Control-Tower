'use client';

import { useEffect, useState } from 'react';
import {
  FileText, CheckCircle, Clock, XCircle,
  RefreshCw, Plus, Search, AlertTriangle
} from 'lucide-react';

interface IMDSSubmission {
  id: number;
  supplier_name: string;
  mds_id: string;
  part_number: string;
  oem: string;
  status: string;
  submitted_at: string;
  rejection_reason?: string;
}

export default function IMDSPage() {
  const [submissions, setSubmissions] = useState<IMDSSubmission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      setSubmissions([
        { id: 1, supplier_name: 'Marmen Inc.', mds_id: 'MDS-2025-001', part_number: 'STRUCT-001', oem: 'BMW', status: 'validated', submitted_at: '2025-01-15' },
        { id: 2, supplier_name: 'AGT Robotique', mds_id: 'MDS-2025-002', part_number: 'ROB-AUTO-01', oem: 'Stellantis', status: 'validated', submitted_at: '2025-01-20' },
        { id: 3, supplier_name: 'Ambiance Bois Structures', mds_id: 'MDS-2025-003', part_number: 'BOIS-STR-01', oem: 'Volvo', status: 'submitted', submitted_at: '2025-02-01' },
        { id: 4, supplier_name: 'Faurecia', mds_id: 'MDS-2025-004', part_number: 'INT-SEAT-01', oem: 'BMW', status: 'pending', submitted_at: '2025-02-10' },
        { id: 5, supplier_name: 'Plastic Omnium', mds_id: 'MDS-2025-005', part_number: 'EXT-BUMP-01', oem: 'Renault', status: 'rejected', submitted_at: '2025-02-05', rejection_reason: 'Données matériaux incomplètes' },
        { id: 6, supplier_name: 'Aisin Seiki', mds_id: 'MDS-2025-006', part_number: 'DRV-COMP-01', oem: 'Toyota', status: 'validated', submitted_at: '2025-01-25' },
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      validated: 'bg-green-100 text-green-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      validated: 'Validé',
      submitted: 'Soumis',
      pending: 'En attente',
      rejected: 'Rejeté',
    };
    return (
      <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredSubmissions = statusFilter
    ? submissions.filter(s => s.status === statusFilter)
    : submissions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IMDS</h1>
          <p className="text-gray-500">International Material Data System - Gestion des soumissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle soumission
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">Total Soumissions</p>
                <p className="text-3xl font-bold text-blue-900">{stats.imds?.total || 15}</p>
              </div>
            </div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-green-600">Validées</p>
                <p className="text-3xl font-bold text-green-900">{stats.imds?.validated || 8}</p>
              </div>
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-yellow-600">En attente</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.imds?.pending || 5}</p>
              </div>
            </div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-red-600">Rejetées</p>
                <p className="text-3xl font-bold text-red-900">{stats.imds?.rejected || 2}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par MDS ID, fournisseur..."
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">Tous les statuts</option>
          <option value="validated">Validées</option>
          <option value="submitted">Soumises</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">MDS ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pièce</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">OEM</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune soumission trouvée
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-primary-600">
                        {submission.mds_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {submission.supplier_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {submission.part_number}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {submission.oem}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        {getStatusBadge(submission.status)}
                      </div>
                      {submission.rejection_reason && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {submission.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
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
