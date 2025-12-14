'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Target, 
  FileText, 
  Leaf, 
  Settings,
  Database,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();

  const mainLinks = [
    { href: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
    { href: '/chat', icon: MessageSquare, label: 'nav.chat' },
    { href: '/suppliers', icon: Building2, label: 'nav.suppliers' },
    { href: '/campaigns', icon: Target, label: 'nav.campaigns' },
  ];

  const moduleLinks = [
    { href: '/imds', icon: FileText, label: 'nav.imds' },
    { href: '/pcf', icon: Leaf, label: 'nav.pcf' },
    { href: '/settings', icon: Settings, label: 'nav.settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen bg-[#12121a] border-r border-[#27272a] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#27272a]">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/agenticx5-logo.png" 
            alt="AgenticX5" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="font-bold text-lg text-white">AgenticX5</h1>
            <p className="text-xs text-[#71717a]">Control Tower</p>
          </div>
        </Link>
      </div>

      {/* Language Toggle */}
      <div className="px-4 py-3 border-b border-[#27272a]">
        <div className="lang-toggle">
          <button 
            onClick={() => setLang('fr')}
            className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
          >
            🇫🇷 FR
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-3">
            {t('nav.principal')}
          </p>
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active 
                      ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border-l-2 border-[#8b5cf6]' 
                      : 'text-[#a1a1aa] hover:bg-[#1e1e2a] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{t(link.label)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Modules Section */}
        <div className="px-4">
          <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-3">
            {t('nav.modules')}
          </p>
          <div className="space-y-1">
            {moduleLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active 
                      ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border-l-2 border-[#8b5cf6]' 
                      : 'text-[#a1a1aa] hover:bg-[#1e1e2a] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{t(link.label)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Database Status */}
      <div className="p-4 border-t border-[#27272a]">
        <div className="bg-[#1a1a25] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-xs font-medium text-white">{t('common.database')}</span>
          </div>
          <p className="text-[11px] text-[#71717a]">Neon PostgreSQL</p>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle className="w-3 h-3 text-[#10b981]" />
            <span className="text-[11px] text-[#10b981]">{t('common.connected')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
