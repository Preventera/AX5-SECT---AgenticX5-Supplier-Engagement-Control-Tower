'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Plus, Search, RefreshCw, 
  MoreHorizontal, Edit, Trash2, Mail,
  Shield, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS, UserRole } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  job_title?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export default function UsersPage() {
  const { lang, t } = useTranslation();
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Vérifier si admin
  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-white text-lg">{lang === 'fr' ? 'Accès réservé aux administrateurs' : 'Admin access only'}</p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {lang === 'fr' ? 'Gestion des Utilisateurs' : 'User Management'}
          </h1>
          <p className="text-[#71717a]">
            {lang === 'fr' ? 'Gérer les comptes et les rôles' : 'Manage accounts and roles'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('suppliers.refresh')}
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {lang === 'fr' ? 'Ajouter' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">{t('suppliers.total')}</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">Admins</p>
          <p className="text-3xl font-bold text-[#ef4444] mt-1">{stats.admins}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[#71717a]">{t('suppliers.active')}</p>
          <p className="text-3xl font-bold text-[#10b981] mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher par nom ou email...' : 'Search by name or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark w-full pl-10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">{lang === 'fr' ? 'Tous les rôles' : 'All roles'}</option>
          <option value="admin">{ROLE_LABELS.admin[lang]}</option>
          <option value="quality_manager">{ROLE_LABELS.quality_manager[lang]}</option>
          <option value="data_steward">{ROLE_LABELS.data_steward[lang]}</option>
          <option value="viewer">{ROLE_LABELS.viewer[lang]}</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="table-dark">
          <thead>
            <tr>
              <th>{lang === 'fr' ? 'Utilisateur' : 'User'}</th>
              <th>{lang === 'fr' ? 'Rôle' : 'Role'}</th>
              <th>{lang === 'fr' ? 'Département' : 'Department'}</th>
              <th>{lang === 'fr' ? 'Dernière connexion' : 'Last login'}</th>
              <th>{t('suppliers.status')}</th>
              <th>{t('suppliers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8b5cf6]" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto text-[#3f3f46] mb-3" />
                  <p className="text-[#71717a]">{lang === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-[#71717a]">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      <Shield className="w-3 h-3" />
                      {ROLE_LABELS[user.role][lang]}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm text-[#a1a1aa]">{user.department || '-'}</p>
                    {user.job_title && (
                      <p className="text-xs text-[#71717a]">{user.job_title}</p>
                    )}
                  </td>
                  <td>
                    <p className="text-sm text-[#71717a]">{formatDate(user.last_login_at)}</p>
                  </td>
                  <td>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10b981]/15 text-[#10b981]">
                        <CheckCircle className="w-3 h-3" />
                        {t('status.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#71717a]/15 text-[#71717a]">
                        <XCircle className="w-3 h-3" />
                        {t('status.inactive')}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#1e1e2a] rounded-lg text-[#71717a] hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#ef4444]/10 rounded-lg text-[#71717a] hover:text-[#ef4444]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
