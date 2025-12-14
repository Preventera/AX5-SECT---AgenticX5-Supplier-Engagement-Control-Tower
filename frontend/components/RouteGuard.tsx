'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
}

// Routes publiques (pas besoin d'auth)
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export default function RouteGuard({ 
  children, 
  requiredPermission,
  requiredRoles,
  requireAuth = true 
}: RouteGuardProps) {
  const { user, loading, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // Si route publique, pas de vérification
    if (isPublicRoute) return;

    // Si auth requise et pas connecté → login
    if (requireAuth && !user) {
      router.push('/login');
      return;
    }

    // Si connecté mais pas la permission requise
    if (user && requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    // Si connecté mais pas le rôle requis
    if (user && requiredRoles && !hasRole(requiredRoles)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, pathname, requireAuth, requiredPermission, requiredRoles, router, hasPermission, hasRole]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6] mx-auto mb-4" />
          <p className="text-[#71717a]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Route publique → afficher
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Pas connecté → null (redirection en cours)
  if (requireAuth && !user) {
    return null;
  }

  // Permission manquante → null (redirection en cours)
  if (user && requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  // Rôle manquant → null (redirection en cours)
  if (user && requiredRoles && !hasRole(requiredRoles)) {
    return null;
  }

  // Tout OK → afficher
  return <>{children}</>;
}
