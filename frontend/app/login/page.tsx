'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS, UserRole } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';

// Utilisateurs de démo
const DEMO_USERS = [
  { email: 'admin@agenticx5.com', name: 'Admin RSE', role: 'admin' as UserRole },
  { email: 'quality@agenticx5.com', name: 'Marie Qualité', role: 'quality_manager' as UserRole },
  { email: 'data@agenticx5.com', name: 'Jean Data', role: 'data_steward' as UserRole },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang, setLang } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(lang === 'fr' ? 'Email requis' : 'Email required');
      return;
    }

    setLoading(true);
    setError('');

    const success = await login(email);
    if (success) {
      router.push('/');
    } else {
      setError(lang === 'fr' ? 'Utilisateur non trouvé' : 'User not found');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError('');
    setEmail(demoEmail);

    const success = await login(demoEmail);
    if (success) {
      router.push('/');
    } else {
      setError(lang === 'fr' ? 'Erreur de connexion' : 'Login error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06b6d4]/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] mb-4 shadow-lg shadow-[#8b5cf6]/20">
            <Image 
              src="/agenticx5-logo.png" 
              alt="AgenticX5" 
              width={50} 
              height={50}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">AgenticX5</h1>
          <p className="text-[#71717a] mt-1">Supplier Engagement Control Tower</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
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

        {/* Login Card */}
        <div className="bg-[#16161f] border border-[#27272a] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {lang === 'fr' ? 'Connexion' : 'Sign In'}
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input-dark w-full pl-11"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {lang === 'fr' ? 'Se connecter' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27272a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#16161f] text-[#71717a]">
                {lang === 'fr' ? 'ou connexion rapide' : 'or quick login'}
              </span>
            </div>
          </div>

          {/* Demo Users */}
          <div className="space-y-3">
            <p className="text-xs text-[#71717a] text-center mb-3">
              {lang === 'fr' ? 'Comptes de démonstration :' : 'Demo accounts:'}
            </p>
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user.email)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1a1a25] border border-[#27272a] hover:border-[#3f3f46] transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-[#8b5cf6] transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#71717a]">{user.email}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                  <Shield className="w-3 h-3" />
                  {ROLE_LABELS[user.role][lang]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#71717a] text-xs mt-6">
          © 2025 AgenticX5 by Preventera
        </p>
      </div>
    </div>
  );
}
