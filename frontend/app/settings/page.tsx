'use client';

import { useState } from 'react';
import { 
  Settings, User, Bell, Database, Shield, 
  Globe, Mail, Key, Save, RefreshCw,
  CheckCircle, AlertCircle, ExternalLink,
  Building, Palette, Clock, Lock
} from 'lucide-react';

type TabType = 'profile' | 'notifications' | 'integrations' | 'security' | 'system';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    companyName: 'Preventera Inc.',
    adminName: 'RSE Team',
    email: 'admin@preventera.com',
    role: 'Administrateur',
    timezone: 'America/Montreal',
    language: 'fr'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewSubmission: true,
    emailValidation: true,
    emailReminders: true,
    emailWeeklyReport: false,
    pushNewSubmission: true,
    pushValidation: false,
    pushReminders: true
  });

  // Integration status
  const integrations = [
    { id: 'neon', name: 'Neon PostgreSQL', status: 'connected', icon: Database, description: 'Base de données principale' },
    { id: 'imds', name: 'IMDS API', status: 'configured', icon: Globe, description: 'International Material Data System' },
    { id: 'claude', name: 'Claude API', status: 'pending', icon: Settings, description: 'IA conversationnelle Anthropic' },
    { id: 'smtp', name: 'SMTP Email', status: 'configured', icon: Mail, description: 'Envoi d\'emails automatisés' },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'integrations' as TabType, label: 'Intégrations', icon: Database },
    { id: 'security' as TabType, label: 'Sécurité', icon: Shield },
    { id: 'system' as TabType, label: 'Système', icon: Settings },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      connected: { bg: 'bg-green-100', text: 'text-green-700', label: 'Connecté' },
      configured: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Configuré' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Erreur' },
    };
    const style = styles[status] || styles.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500">Configuration du système AX5-SECT</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      {/* Success message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Paramètres sauvegardés avec succès !</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Profil de l'organisation
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={profile.companyName}
                        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'administrateur
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={profile.adminName}
                        onChange={(e) => setProfile({ ...profile, adminName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <select
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Administrateur">Administrateur</option>
                      <option value="Manager">Manager</option>
                      <option value="Analyste">Analyste</option>
                      <option value="Lecteur">Lecteur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Fuseau horaire
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="America/Montreal">Montréal (EST)</option>
                      <option value="America/Toronto">Toronto (EST)</option>
                      <option value="America/Vancouver">Vancouver (PST)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Langue
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Préférences de notifications
                </h2>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Notifications par email
                  </h3>
                  
                  {[
                    { key: 'emailNewSubmission', label: 'Nouvelle soumission IMDS/PCF' },
                    { key: 'emailValidation', label: 'Validation de soumission' },
                    { key: 'emailReminders', label: 'Rappels de délais' },
                    { key: 'emailWeeklyReport', label: 'Rapport hebdomadaire' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Notifications push
                  </h3>
                  
                  {[
                    { key: 'pushNewSubmission', label: 'Nouvelle soumission' },
                    { key: 'pushValidation', label: 'Validation' },
                    { key: 'pushReminders', label: 'Rappels' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Intégrations
                </h2>

                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <integration.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{integration.name}</p>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(integration.status)}
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Ajouter une intégration
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Sécurité
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Authentification</p>
                          <p className="text-sm text-gray-500">Méthode de connexion actuelle</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        Non configurée
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Configurer Clerk
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Clés API</p>
                          <p className="text-sm text-gray-500">Gérer les clés d'accès API</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <code className="text-sm text-gray-600">sk-ax5-****-****-****-1234</code>
                        <span className="text-xs text-gray-400">Créée le 13 déc. 2025</span>
                      </div>
                    </div>
                    <button className="mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Générer une nouvelle clé
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Configuration système
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="text-lg font-semibold text-gray-900">AX5-SECT v1.0.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Environnement</p>
                    <p className="text-lg font-semibold text-gray-900">Production</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Base de données</p>
                    <p className="text-lg font-semibold text-green-600">Neon PostgreSQL ✓</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Dernière mise à jour</p>
                    <p className="text-lg font-semibold text-gray-900">13 déc. 2025</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-4">Thème de l'interface</h3>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-500 rounded-lg">
                      <div className="w-4 h-4 bg-white border rounded"></div>
                      Clair
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      <div className="w-4 h-4 bg-gray-800 rounded"></div>
                      Sombre
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      <Palette className="w-4 h-4" />
                      Système
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-4">Actions</h3>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Vider le cache
                    </button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Réinitialiser les paramètres
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
