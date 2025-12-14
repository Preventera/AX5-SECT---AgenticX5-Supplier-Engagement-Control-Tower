'use client';

import { useState, useEffect } from 'react';
import { X, Building2, Mail, User, Globe, MapPin, Factory, Save } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface Supplier {
  id?: number;
  name: string;
  contact_email?: string;
  email?: string;
  contact_name?: string;
  tier: number;
  country?: string;
  city?: string;
  industry?: string;
  status: string;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => Promise<void>;
  supplier?: Supplier | null;
}

const defaultSupplier: Supplier = {
  name: '',
  contact_email: '',
  contact_name: '',
  tier: 1,
  country: '',
  city: '',
  industry: '',
  status: 'active'
};

export default function SupplierModal({ isOpen, onClose, onSave, supplier }: SupplierModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Supplier>(defaultSupplier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (supplier) {
      setFormData({
        ...supplier,
        contact_email: supplier.contact_email || supplier.email || ''
      });
    } else {
      setFormData(defaultSupplier);
    }
    setError('');
  }, [supplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(t('suppliers.name') + ' is required');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161f] border border-[#27272a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <h2 className="text-xl font-semibold text-white">
            {supplier?.id ? t('suppliers.edit_title') : t('suppliers.new')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors text-[#71717a] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.name')} *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="Ex: Marmen Inc."
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Contact name */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.contact')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Tier */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.tier')}
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                className="w-full"
              >
                <option value={1}>{t('tier.direct')}</option>
                <option value={2}>{t('tier.indirect')}</option>
                <option value={3}>{t('tier.subcontractor')}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full"
              >
                <option value="active">{t('status.active')}</option>
                <option value="inactive">{t('status.inactive')}</option>
                <option value="pending">{t('status.pending')}</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.country')}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="Canada"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.city')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="Trois-Rivières"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                {t('suppliers.industry')}
              </label>
              <div className="relative">
                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-dark w-full pl-10"
                  placeholder="Manufacturing"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t('suppliers.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? t('common.saving') : t('suppliers.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
