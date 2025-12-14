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
  CheckCircle,
  Users,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth, ROLE_LABELS, ROLE_COLORS, UserRole } from '@/contexts/AuthContext';
import { useState } from 'react';

interface NavLink {
  href: string;
  icon: any;
  label: string;
  permission?: string;
  roles?: UserRole[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();
  const { user, logout, hasPermission, hasRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Navigation principale - visible selon permissions
  const mainLinks: NavLink[] = [
    { href: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
    { href: '/chat', icon: MessageSquare, label: 'nav.chat', permission: 'chat:use' },
    { href: '/suppliers', icon: Building2, label: 'nav.suppliers', permission: 'suppliers:read' },
    { href: '/campaigns', icon: Target, label: 'nav.campaigns', permission: 'campaigns:read' },
  ];

  // Modules - visible selon permissions
  const moduleLinks: NavLink[] = [
    { href: '/imds', icon: FileText, label: 'nav.imds', permission: 'imds:read' },
    { href: '/pcf', icon: Leaf, label: 'nav.pcf', permission: 'pcf:read' },
  ];

  // Administration - visible selon rôles
  const adminLinks: NavLink[] = [
    { href: '/users', icon: Users, label: 'nav.users', roles: ['admin'] },
    { href: '/settings', icon: Settings, label: 'nav.settings', permission: 'settings:read' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Filtrer les liens selon les permissions
  const filterLinks = (links: NavLink[]) => {
    return links.filter(link => {
      if (link.roles && !hasRole(link.roles)) return false;
      if (link.permission && !hasPermission(link.permission)) return false;
      return true;
    });
  };

  const visibleMainLinks = filterLinks(mainLinks);
  const visibleModuleLinks = filterLinks(moduleLinks);
  const visibleAdminLinks = filterLinks(adminLinks);

  return (
    <aside className="w-64 h-screen bg-[#12121a] border-r border-[#27272a] flex flex-col fixed left-0 top-0 z-50">
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

      {/* User Info (if logged in) */}
      {user && (
        <div className="px-4 py-3 border-b border-[#27272a]">
          <div 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e1e2a] cursor-pointer transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${ROLE_COLORS[user.role]}`}>
                <Shield className="w-3 h-3" />
                {ROLE_LABELS[user.role][lang]}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#71717a] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>
          
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="mt-2 p-1 bg-[#1a1a25] rounded-lg border border-[#27272a]">
              <Link 
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-md"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4" />
                {lang === 'fr' ? 'Mon profil' : 'My profile'}
              </Link>
              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                {lang === 'fr' ? 'Déconnexion' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-3">
            {t('nav.principal')}
          </p>
          <div className="space-y-1">
            {visibleMainLinks.map((link) => {
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
        {visibleModuleLinks.length > 0 && (
          <div className="px-4 mb-6">
            <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-3">
              {t('nav.modules')}
            </p>
            <div className="space-y-1">
              {visibleModuleLinks.map((link) => {
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
        )}

        {/* Admin Section */}
        {visibleAdminLinks.length > 0 && (
          <div className="px-4">
            <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-3">
              {lang === 'fr' ? 'ADMINISTRATION' : 'ADMINISTRATION'}
            </p>
            <div className="space-y-1">
              {visibleAdminLinks.map((link) => {
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
        )}
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
