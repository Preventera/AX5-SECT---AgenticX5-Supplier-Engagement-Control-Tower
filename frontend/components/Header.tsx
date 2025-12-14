'use client';

import { Search, Bell, HelpCircle, User } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-[#12121a] border-b border-[#27272a] flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a25] border border-[#27272a] rounded-lg text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/20"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Help */}
        <button className="p-2 rounded-lg hover:bg-[#1e1e2a] text-[#a1a1aa] hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-[#1e1e2a] text-[#a1a1aa] hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#27272a]">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-[#71717a]">RSE Team</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
