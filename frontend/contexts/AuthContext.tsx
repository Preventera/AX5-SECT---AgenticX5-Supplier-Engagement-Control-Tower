'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type UserRole = 'admin' | 'quality_manager' | 'data_steward' | 'viewer';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  job_title?: string;
  language: string;
  theme: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isQualityManager: boolean;
  isDataSteward: boolean;
}

// Permissions par rôle (côté client pour UI)
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'suppliers:read', 'suppliers:write', 'suppliers:delete',
    'campaigns:read', 'campaigns:write', 'campaigns:delete',
    'imds:read', 'imds:write', 'imds:validate',
    'pcf:read', 'pcf:write', 'pcf:validate',
    'users:read', 'users:write',
    'settings:read', 'settings:write',
    'chat:use'
  ],
  quality_manager: [
    'suppliers:read', 'suppliers:write',
    'campaigns:read', 'campaigns:write',
    'imds:read', 'imds:write', 'imds:validate',
    'pcf:read', 'pcf:write', 'pcf:validate',
    'chat:use'
  ],
  data_steward: [
    'suppliers:read', 'suppliers:write',
    'campaigns:read',
    'imds:read', 'imds:write',
    'pcf:read', 'pcf:write',
    'chat:use'
  ],
  viewer: [
    'suppliers:read',
    'campaigns:read',
    'imds:read',
    'pcf:read',
    'chat:use'
  ]
};

// Labels des rôles
export const ROLE_LABELS: Record<UserRole, { fr: string; en: string }> = {
  admin: { fr: 'Administrateur', en: 'Administrator' },
  quality_manager: { fr: 'Responsable Qualité', en: 'Quality Manager' },
  data_steward: { fr: 'Data Steward', en: 'Data Steward' },
  viewer: { fr: 'Lecteur', en: 'Viewer' }
};

// Couleurs des rôles
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-[#ef4444]/15 text-[#ef4444]',
  quality_manager: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
  data_steward: 'bg-[#06b6d4]/15 text-[#06b6d4]',
  viewer: 'bg-[#71717a]/15 text-[#71717a]'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('ax5_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          ...parsed,
          permissions: ROLE_PERMISSIONS[parsed.role as UserRole] || []
        });
      } catch (e) {
        localStorage.removeItem('ax5_user');
      }
    }
    setLoading(false);
  }, []);

  // Login - récupère l'utilisateur depuis l'API
  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (!res.ok) return false;
      
      const userData = await res.json();
      if (!userData || !userData.id) return false;

      const userWithPermissions: User = {
        ...userData,
        permissions: ROLE_PERMISSIONS[userData.role as UserRole] || []
      };

      setUser(userWithPermissions);
      localStorage.setItem('ax5_user', JSON.stringify(userData));
      
      // Update last login
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userData.id, last_login_at: new Date().toISOString() })
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ax5_user');
  };

  // Vérifier une permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  // Vérifier un ou plusieurs rôles
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Helpers rapides
  const isAdmin = user?.role === 'admin';
  const isQualityManager = user?.role === 'quality_manager' || isAdmin;
  const isDataSteward = user?.role === 'data_steward' || isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      hasPermission,
      hasRole,
      isAdmin,
      isQualityManager,
      isDataSteward
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC pour protéger les composants
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: string
) {
  return function ProtectedComponent(props: P) {
    const { hasPermission, loading } = useAuth();
    
    if (loading) return null;
    if (!hasPermission(permission)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-[#ef4444] text-lg">🔒 Accès refusé</p>
            <p className="text-[#71717a] text-sm mt-2">
              Vous n'avez pas la permission d'accéder à cette ressource.
            </p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
