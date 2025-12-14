'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-[#ef4444]/15',
      icon: 'text-[#ef4444]',
      button: 'bg-[#ef4444] hover:bg-[#dc2626]'
    },
    warning: {
      bg: 'bg-[#f59e0b]/15',
      icon: 'text-[#f59e0b]',
      button: 'bg-[#f59e0b] hover:bg-[#d97706]'
    },
    info: {
      bg: 'bg-[#06b6d4]/15',
      icon: 'text-[#06b6d4]',
      button: 'bg-[#06b6d4] hover:bg-[#0891b2]'
    }
  };

  const style = colors[type];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#16161f] border border-[#27272a] rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
        {/* Content */}
        <div className="flex items-start gap-4 p-6">
          <div className={`w-12 h-12 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-[#a1a1aa]">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#27272a] rounded-lg transition-colors text-[#71717a] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 ${style.button}`}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
