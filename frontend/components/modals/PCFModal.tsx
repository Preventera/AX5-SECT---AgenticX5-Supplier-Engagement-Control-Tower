'use client';

import { useState, useEffect } from 'react';
import { X, Leaf, Package, Calculator, Save } from 'lucide-react';

interface PCFDeclaration {
  id?: number;
  supplier_id: number;
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

interface PCFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pcf: PCFDeclaration) => Promise<void>;
  pcf?: PCFDeclaration | null;
  suppliers: Supplier[];
}

const defaultPCF: PCFDeclaration = {
  supplier_id: 0,
  product_ref: '',
  product_name: '',
  perimeter: 'cradle-to-gate',
  reference_year: new Date().getFullYear(),
  total_emissions_kgco2e: 0,
  method: 'ISO 14067',
  validation_status: 'pending',
  notes: ''
};

export default function PCFModal({ isOpen, onClose, onSave, pcf, suppliers }: PCFModalProps) {
  const [formData, setFormData] = useState<PCFDeclaration>(defaultPCF);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pcf) {
      setFormData(pcf);
    } else {
      setFormData(defaultPCF);
    }
    setError('');
  }, [pcf, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.supplier_id) {
      setError('Le fournisseur est requis');
      return;
    }
    if (!formData.product_ref.trim()) {
      setError('La référence produit est requise');
      return;
    }
    if (formData.total_emissions_kgco2e <= 0) {
      setError('Les émissions doivent être supérieures à 0');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {pcf?.id ? 'Modifier la déclaration PCF' : 'Nouvelle déclaration PCF'}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={0}>Sélectionner un fournisseur</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Product Ref */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence produit *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.product_ref}
                  onChange={(e) => setFormData({ ...formData, product_ref: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="PROD-001"
                />
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit
              </label>
              <input
                type="text"
                value={formData.product_name || ''}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Composant X"
              />
            </div>

            {/* Emissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Émissions totales (kg CO₂e) *
              </label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.total_emissions_kgco2e}
                  onChange={(e) => setFormData({ ...formData, total_emissions_kgco2e: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="125.5"
                />
              </div>
            </div>

            {/* Reference Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année de référence
              </label>
              <select
                value={formData.reference_year}
                onChange={(e) => setFormData({ ...formData, reference_year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {[2025, 2024, 2023, 2022, 2021].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Perimeter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Périmètre
              </label>
              <select
                value={formData.perimeter}
                onChange={(e) => setFormData({ ...formData, perimeter: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="cradle-to-gate">Cradle-to-gate</option>
                <option value="A1-A3">A1-A3</option>
                <option value="cradle-to-grave">Cradle-to-grave</option>
                <option value="gate-to-gate">Gate-to-gate</option>
              </select>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de calcul
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="ISO 14067">ISO 14067</option>
                <option value="GHG Protocol">GHG Protocol</option>
                <option value="Catena-X">Catena-X</option>
                <option value="PEF">PEF (EU)</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.validation_status}
                onChange={(e) => setFormData({ ...formData, validation_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
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
