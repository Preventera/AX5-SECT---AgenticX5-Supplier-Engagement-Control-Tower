'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Hash, Package, Building, Save } from 'lucide-react';

interface IMDSSubmission {
  id?: number;
  supplier_id: number;
  mds_id: string;
  part_number: string;
  part_name?: string;
  oem?: string;
  validation_status: string;
  notes?: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface IMDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (submission: IMDSSubmission) => Promise<void>;
  submission?: IMDSSubmission | null;
  suppliers: Supplier[];
}

const defaultSubmission: IMDSSubmission = {
  supplier_id: 0,
  mds_id: '',
  part_number: '',
  part_name: '',
  oem: '',
  validation_status: 'pending',
  notes: ''
};

export default function IMDSModal({ isOpen, onClose, onSave, submission, suppliers }: IMDSModalProps) {
  const [formData, setFormData] = useState<IMDSSubmission>(defaultSubmission);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (submission) {
      setFormData(submission);
    } else {
      setFormData(defaultSubmission);
    }
    setError('');
  }, [submission, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.supplier_id) {
      setError('Le fournisseur est requis');
      return;
    }
    if (!formData.mds_id.trim()) {
      setError('Le MDS ID est requis');
      return;
    }
    if (!formData.part_number.trim()) {
      setError('Le numéro de pièce est requis');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Générer un MDS ID automatique
  const generateMDSId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData({ ...formData, mds_id: `MDS-${year}-${random}` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {submission?.id ? 'Modifier la soumission IMDS' : 'Nouvelle soumission IMDS'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Fournisseur */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur *
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Sélectionner un fournisseur</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* MDS ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MDS ID *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.mds_id}
                    onChange={(e) => setFormData({ ...formData, mds_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MDS-2025-001"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateMDSId}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Générer
                </button>
              </div>
            </div>

            {/* Part Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de pièce *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PART-A100"
                />
              </div>
            </div>

            {/* Part Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la pièce
              </label>
              <input
                type="text"
                value={formData.part_name || ''}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Composant structural"
              />
            </div>

            {/* OEM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OEM
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.oem || ''}
                  onChange={(e) => setFormData({ ...formData, oem: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="OEM-Auto1"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.validation_status}
                onChange={(e) => setFormData({ ...formData, validation_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
