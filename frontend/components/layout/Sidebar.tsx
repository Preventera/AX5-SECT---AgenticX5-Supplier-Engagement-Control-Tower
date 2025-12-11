'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Target, 
  Settings,
  Leaf,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat IA', href: '/chat', icon: MessageSquare },
  { name: 'Fournisseurs', href: '/suppliers', icon: Building2 },
  { name: 'Campagnes', href: '/campaigns', icon: Target },
];

const secondaryNavigation = [
  { name: 'IMDS', href: '/imds', icon: FileCheck },
  { name: 'PCF / Carbone', href: '/pcf', icon: Leaf },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">X5</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">AX5-SECT</h1>
            <p className="text-xs text-gray-500">Control Tower</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Principal
          </p>
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 -ml-1 pl-4'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 mb-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Modules
          </p>
        </div>

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-700">Mode Démonstration</p>
          <p className="text-xs text-gray-500 mt-1">Mock Mode actif</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-600">Connecté</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
