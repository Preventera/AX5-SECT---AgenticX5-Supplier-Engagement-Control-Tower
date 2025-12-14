'use client';

import { useState } from 'react';
import { ArrowLeft, Leaf, Save, Send, Loader2, Info } from 'lucide-react';

interface PortalPCFFormProps {
  token: string;
  supplierName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PortalPCFForm({ token, supplierName, onClose, onSuccess }: PortalPCFFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    product_name: '',
    emissions_total: '',
    emissions_unit: 'kg CO2e',
    perimeter: '',
    methodology: '',
    reference_year: new Date().getFullYear().toString(),
    notes: ''
  });

  const handleSubmit = async (asDraft: boolean) => {
    setError('');
    
    if (!formData.product_name) {
      setError('Le nom du produit est requis');
      return;
    }

    if (!asDraft && !formData.emissions_total) {
      setError('Les émissions totales sont requises pour soumettre');
      return;
    }

    setLoading(true);
    try {
      // Créer la soumission
      const res = await fetch('/api/portal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          submission_type: 'pcf',
          product_name: formData.product_name,
          emissions_total: formData.emissions_total ? parseFloat(formData.emissions_total) : null,
          emissions_unit: formData.emissions_unit,
          perimeter: formData.perimeter,
          methodology: formData.methodology,
          reference_year: formData.reference_year ? parseInt(formData.reference_year) : null,
          notes: formData.notes
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const submission = await res.json();

      // Si pas brouillon, soumettre
      if (!asDraft) {
        await fetch('/api/portal/submissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: submission.id,
            token,
            status: 'submitted'
          })
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-[#12121a] border-b border-[#27272a]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#27272a] rounded-lg text-[#71717a] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Nouvelle déclaration PCF</h1>
                <p className="text-xs text-[#71717a]">{supplierName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">Product Carbon Footprint (PCF)</p>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Déclarez l'empreinte carbone de votre produit selon les standards ISO 14067, 
              GHG Protocol ou Catena-X. Indiquez le périmètre et la méthodologie utilisée.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 mb-6 text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="bg-[#16161f] border border-[#27272a] rounded-xl p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Ex: Composant électronique XYZ-500"
              className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#10b981]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Emissions */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Émissions totales *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.emissions_total}
                  onChange={(e) => setFormData({ ...formData, emissions_total: e.target.value })}
                  placeholder="Ex: 12.5"
                  className="flex-1 px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#10b981]"
                />
                <select
                  value={formData.emissions_unit}
                  onChange={(e) => setFormData({ ...formData, emissions_unit: e.target.value })}
                  className="px-3 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="kg CO2e">kg CO₂e</option>
                  <option value="kg CO2e/kg">kg CO₂e/kg</option>
                  <option value="kg CO2e/unit">kg CO₂e/unité</option>
                </select>
              </div>
            </div>

            {/* Reference Year */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Année de référence
              </label>
              <select
                value={formData.reference_year}
                onChange={(e) => setFormData({ ...formData, reference_year: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Perimeter */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Périmètre
              </label>
              <select
                value={formData.perimeter}
                onChange={(e) => setFormData({ ...formData, perimeter: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="">Sélectionner un périmètre</option>
                <option value="cradle-to-gate">Cradle-to-Gate (Berceau à porte)</option>
                <option value="A1-A3">A1-A3 (Matières premières + Production)</option>
                <option value="cradle-to-grave">Cradle-to-Grave (Cycle de vie complet)</option>
                <option value="gate-to-gate">Gate-to-Gate (Production uniquement)</option>
              </select>
              <p className="text-xs text-[#52525b] mt-1">Selon norme ISO 14067</p>
            </div>

            {/* Methodology */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Méthodologie
              </label>
              <select
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="">Sélectionner une méthodologie</option>
                <option value="ISO 14067">ISO 14067</option>
                <option value="GHG Protocol">GHG Protocol Product</option>
                <option value="Catena-X">Catena-X PCF Rulebook</option>
                <option value="PEF">PEF (Product Environmental Footprint)</option>
                <option value="Other">Autre</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Notes / Hypothèses de calcul
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Décrivez les hypothèses de calcul, sources des facteurs d'émission, etc."
              rows={4}
              className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#10b981] resize-none"
            />
          </div>
        </div>

        {/* Summary Card */}
        {formData.emissions_total && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#10b981]/10 to-[#06b6d4]/10 border border-[#10b981]/30 rounded-xl">
            <p className="text-sm text-[#a1a1aa]">Émissions déclarées</p>
            <p className="text-2xl font-bold text-[#10b981]">
              {formData.emissions_total} <span className="text-lg font-normal">{formData.emissions_unit}</span>
            </p>
            {formData.perimeter && (
              <p className="text-xs text-[#71717a] mt-1">Périmètre : {formData.perimeter}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white hover:bg-[#27272a] transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-2.5 bg-[#27272a] border border-[#3f3f46] rounded-lg text-white hover:bg-[#3f3f46] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Sauvegarder brouillon
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Soumettre
          </button>
        </div>
      </main>
    </div>
  );
}
