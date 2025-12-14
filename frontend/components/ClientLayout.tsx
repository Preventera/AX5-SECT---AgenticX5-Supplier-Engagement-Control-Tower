'use client';

import { usePathname } from 'next/navigation';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Routes sans layout (login, etc.)
const NO_LAYOUT_ROUTES = ['/login', '/register', '/forgot-password', '/unauthorized'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Vérifier si la route actuelle nécessite un layout
  const showLayout = !NO_LAYOUT_ROUTES.some(route => pathname.startsWith(route));

  return (
    <TranslationProvider>
      <AuthProvider>
        <RouteGuard>
          {showLayout ? (
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 ml-64">
                <Header />
                <main className="pt-16 p-6 min-h-screen">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // Pages sans layout (login, etc.)
            <>{children}</>
          )}
        </RouteGuard>
      </AuthProvider>
    </TranslationProvider>
  );
}
