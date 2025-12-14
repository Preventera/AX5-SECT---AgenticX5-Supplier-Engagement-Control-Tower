'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function UnauthorizedPage() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#ef4444]/15 mb-6">
          <ShieldX className="w-10 h-10 text-[#ef4444]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          {lang === 'fr' ? 'Accès Refusé' : 'Access Denied'}
        </h1>

        {/* Message */}
        <p className="text-[#a1a1aa] mb-8">
          {lang === 'fr' 
            ? 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page. Contactez votre administrateur si vous pensez qu\'il s\'agit d\'une erreur.'
            : 'You do not have the required permissions to access this page. Contact your administrator if you believe this is an error.'}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'fr' ? 'Retour' : 'Go Back'}
          </button>
          <Link href="/" className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" />
            {lang === 'fr' ? 'Accueil' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
