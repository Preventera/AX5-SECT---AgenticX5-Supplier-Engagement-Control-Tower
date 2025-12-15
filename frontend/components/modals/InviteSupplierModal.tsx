'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Link2, Copy, Check, Send, Loader2, Calendar, ExternalLink } from 'lucide-react';

interface InviteSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: {
    id?: number;
    name: string;
    email?: string;
    contact_email?: string;
    contact_name?: string;
  } | null;
}

export default function InviteSupplierModal({ isOpen, onClose, supplier }: InviteSupplierModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [portalUrl, setPortalUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    contact_email: '',
    contact_name: '',
    expires_days: 30
  });

  // Reset form when opening
  useEffect(() => {
    if (isOpen && supplier) {
      setFormData({
        contact_email: supplier.email || supplier.contact_email || '',
        contact_name: supplier.contact_name || '',
        expires_days: 30
      });
      setError('');
      setSuccess(false);
      setPortalUrl('');
      setCopied(false);
    }
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const handleGenerateToken = async () => {
    setError('');
    
    if (!formData.contact_email) {
      setError('L\'email est requis');
      return;
    }

    if (!supplier.id) {
      setError('ID fournisseur manquant');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: supplier.id,
          contact_email: formData.contact_email,
          contact_name: formData.contact_name,
          expires_days: formData.expires_days
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const data = await res.json();
      setPortalUrl(data.portal_url);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    setPortalUrl('');
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161f] border border-[#27272a] rounded-2xl shadow-2xl max-w-lg w-full animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Inviter au portail</h2>
              <p className="text-sm text-[#71717a]">{supplier.name}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors text-[#71717a] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            /* Success State */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                <Check className="w-6 h-6 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white">Lien d'accès généré !</p>
                  <p className="text-sm text-[#a1a1aa]">Valide {formData.expires_days} jours</p>
                </div>
              </div>

              {/* Portal URL */}
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Lien du portail fournisseur
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portalUrl}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                      copied 
                        ? 'bg-[#10b981]/15 text-[#10b981]' 
                        : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-3 pt-4">
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] border border-[#3f3f46] rounded-lg text-white hover:bg-[#3f3f46] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Tester le lien
                </a>
                <a
                  href={`mailto:${formData.contact_email}?subject=Accès au portail fournisseur - ${supplier.name}&body=Bonjour,%0A%0AVoici votre lien d'accès au portail fournisseur AgenticX5 :%0A%0A${encodeURIComponent(portalUrl)}%0A%0ACe lien est valide ${formData.expires_days} jours.%0A%0ACordialement`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                  Envoyer par email
                </a>
              </div>

              <button
                onClick={handleClose}
                className="w-full mt-4 px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white hover:bg-[#27272a] transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            /* Form State */
            <div className="space-y-6">
              {/* Error */}
              {error && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
                  {error}
                </div>
              )}

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Email du contact *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@fournisseur.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Nom du contact
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Durée de validité
                </label>
                <select
                  value={formData.expires_days}
                  onChange={(e) => setFormData({ ...formData, expires_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]"
                >
                  <option value={7}>7 jours</option>
                  <option value={14}>14 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={60}>60 jours</option>
                  <option value={90}>90 jours</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-white hover:bg-[#27272a] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerateToken}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  Générer le lien
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
