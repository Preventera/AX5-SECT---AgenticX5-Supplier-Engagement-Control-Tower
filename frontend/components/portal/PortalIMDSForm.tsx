'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, Save, Send, Loader2, Info } from 'lucide-react';

interface PortalIMDSFormProps {
  token: string;
  supplierName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PortalIMDSForm({ token, supplierName, onClose, onSuccess }: PortalIMDSFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    mds_id: '',
    part_number: '',
    part_name: '',
    oem: '',
    notes: ''
  });

  const handleSubmit = async (asDraft: boolean) => {
    setError('');
    
    if (!formData.part_name) {
      setError('Le nom de la pièce est requis');
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
          submission_type: 'imds',
          ...formData
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
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Nouvelle soumission IMDS</h1>
                <p className="text-xs text-[#71717a]">{supplierName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">International Material Data System</p>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Remplissez les informations de votre Material Data Sheet. Vous pouvez sauvegarder en brouillon 
              et compléter plus tard, ou soumettre directement pour validation.
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
          <div className="grid grid-cols-2 gap-6">
            {/* MDS ID */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                ID MDS (IMDS)
              </label>
              <input
                type="text"
                value={formData.mds_id}
                onChange={(e) => setFormData({ ...formData, mds_id: e.target.value })}
                placeholder="Ex: 12345678"
                className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6]"
              />
              <p className="text-xs text-[#52525b] mt-1">Numéro de référence IMDS si disponible</p>
            </div>

            {/* Part Number */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Numéro de pièce
              </label>
              <input
                type="text"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="Ex: ABC-123-XYZ"
                className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
          </div>

          {/* Part Name */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Nom de la pièce *
            </label>
            <input
              type="text"
              value={formData.part_name}
              onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
              placeholder="Ex: Support moteur en aluminium"
              className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6]"
              required
            />
          </div>

          {/* OEM */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              OEM / Client
            </label>
            <select
              value={formData.oem}
              onChange={(e) => setFormData({ ...formData, oem: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]"
            >
              <option value="">Sélectionner un OEM</option>
              <option value="volkswagen">Volkswagen Group</option>
              <option value="stellantis">Stellantis</option>
              <option value="renault">Renault Group</option>
              <option value="bmw">BMW Group</option>
              <option value="mercedes">Mercedes-Benz</option>
              <option value="toyota">Toyota</option>
              <option value="ford">Ford</option>
              <option value="gm">General Motors</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Notes / Commentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={4}
              className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6] resize-none"
            />
          </div>
        </div>

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
            className="px-6 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Soumettre
          </button>
        </div>
      </main>
    </div>
  );
}
