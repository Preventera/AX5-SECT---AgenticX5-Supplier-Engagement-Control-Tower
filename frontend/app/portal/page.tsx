'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Building2, FileText, Leaf, Clock, CheckCircle, 
  XCircle, AlertCircle, Plus, Send, Loader2
} from 'lucide-react';
import PortalIMDSForm from '@/components/portal/PortalIMDSForm';
import PortalPCFForm from '@/components/portal/PortalPCFForm';

interface TokenData {
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  campaign_id?: number;
  campaign_name?: string;
  contact_email: string;
  contact_name?: string;
  expires_at: string;
}

interface Submission {
  id: number;
  submission_type: 'imds' | 'pcf';
  status: string;
  mds_id?: string;
  part_name?: string;
  product_name?: string;
  emissions_total?: number;
  created_at: string;
  submitted_at?: string;
}

export default function SupplierPortalPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'imds' | 'pcf'>('overview');
  const [showForm, setShowForm] = useState<'imds' | 'pcf' | null>(null);

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setError('Token manquant. Veuillez utiliser le lien fourni par email.');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`/api/portal/tokens?token=${token}`);
      const data = await res.json();

      if (!data.valid) {
        setError(data.error || 'Token invalide ou expiré');
        setLoading(false);
        return;
      }

      setTokenData(data.data);
      await loadSubmissions();
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await fetch(`/api/portal/submissions?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      draft: { bg: 'bg-[#71717a]/15', text: 'text-[#71717a]', icon: Clock, label: 'Brouillon' },
      submitted: { bg: 'bg-[#06b6d4]/15', text: 'text-[#06b6d4]', icon: Send, label: 'Soumis' },
      under_review: { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', icon: AlertCircle, label: 'En révision' },
      validated: { bg: 'bg-[#10b981]/15', text: 'text-[#10b981]', icon: CheckCircle, label: 'Validé' },
      rejected: { bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', icon: XCircle, label: 'Rejeté' },
    };
    const style = styles[status] || styles.draft;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  // Page d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#ef4444]/15 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-[#ef4444]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Accès Refusé</h1>
          <p className="text-[#a1a1aa] mb-6">{error}</p>
          <p className="text-sm text-[#71717a]">
            Si vous pensez qu'il s'agit d'une erreur, contactez votre interlocuteur.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6] mx-auto mb-4" />
          <p className="text-[#71717a]">Vérification de votre accès...</p>
        </div>
      </div>
    );
  }

  // Formulaire IMDS
  if (showForm === 'imds') {
    return (
      <PortalIMDSForm 
        token={token!}
        supplierName={tokenData?.supplier_name || ''}
        onClose={() => setShowForm(null)}
        onSuccess={() => {
          setShowForm(null);
          loadSubmissions();
        }}
      />
    );
  }

  // Formulaire PCF
  if (showForm === 'pcf') {
    return (
      <PortalPCFForm 
        token={token!}
        supplierName={tokenData?.supplier_name || ''}
        onClose={() => setShowForm(null)}
        onSuccess={() => {
          setShowForm(null);
          loadSubmissions();
        }}
      />
    );
  }

  // Stats
  const stats = {
    total: submissions.length,
    imds: submissions.filter(s => s.submission_type === 'imds').length,
    pcf: submissions.filter(s => s.submission_type === 'pcf').length,
    validated: submissions.filter(s => s.status === 'validated').length,
    pending: submissions.filter(s => ['submitted', 'under_review'].includes(s.status)).length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-[#12121a] border-b border-[#27272a]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image 
                src="/agenticx5-logo.png" 
                alt="AgenticX5" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="font-bold text-lg text-white">Portail Fournisseur</h1>
                <p className="text-xs text-[#71717a]">AgenticX5 Control Tower</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{tokenData?.supplier_name}</p>
              <p className="text-xs text-[#71717a]">{tokenData?.contact_email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Campaign Banner */}
      {tokenData?.campaign_name && (
        <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#06b6d4]/20 border-b border-[#8b5cf6]/30">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <p className="text-sm text-white">
              <span className="text-[#a1a1aa]">Campagne active :</span>{' '}
              <span className="font-medium">{tokenData.campaign_name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bienvenue, {tokenData?.contact_name || tokenData?.supplier_name}
          </h2>
          <p className="text-[#a1a1aa]">
            Gérez vos soumissions IMDS et déclarations PCF depuis ce portail.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16161f] border border-[#27272a] rounded-xl p-4">
            <p className="text-sm text-[#71717a]">Total soumissions</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-[#16161f] border border-[#27272a] rounded-xl p-4">
            <p className="text-sm text-[#71717a]">IMDS</p>
            <p className="text-2xl font-bold text-[#8b5cf6] mt-1">{stats.imds}</p>
          </div>
          <div className="bg-[#16161f] border border-[#27272a] rounded-xl p-4">
            <p className="text-sm text-[#71717a]">PCF</p>
            <p className="text-2xl font-bold text-[#10b981] mt-1">{stats.pcf}</p>
          </div>
          <div className="bg-[#16161f] border border-[#27272a] rounded-xl p-4">
            <p className="text-sm text-[#71717a]">Validées</p>
            <p className="text-2xl font-bold text-[#06b6d4] mt-1">{stats.validated}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowForm('imds')}
            className="flex-1 flex items-center justify-center gap-3 p-6 bg-[#16161f] border border-[#27272a] rounded-xl hover:border-[#8b5cf6]/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Nouvelle soumission IMDS</p>
              <p className="text-sm text-[#71717a]">Material Data Sheet</p>
            </div>
            <Plus className="w-5 h-5 text-[#8b5cf6] ml-auto" />
          </button>

          <button
            onClick={() => setShowForm('pcf')}
            className="flex-1 flex items-center justify-center gap-3 p-6 bg-[#16161f] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-[#10b981]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Nouvelle déclaration PCF</p>
              <p className="text-sm text-[#71717a]">Product Carbon Footprint</p>
            </div>
            <Plus className="w-5 h-5 text-[#10b981] ml-auto" />
          </button>
        </div>

        {/* Submissions List */}
        <div className="bg-[#16161f] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="font-semibold text-white">Mes soumissions</h3>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-[#3f3f46] mx-auto mb-4" />
              <p className="text-[#71717a]">Aucune soumission pour le moment</p>
              <p className="text-sm text-[#52525b] mt-1">
                Commencez par créer une soumission IMDS ou PCF
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a25]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#71717a] uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-t border-[#27272a] hover:bg-[#1e1e2a]">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        sub.submission_type === 'imds' 
                          ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' 
                          : 'bg-[#10b981]/15 text-[#10b981]'
                      }`}>
                        {sub.submission_type === 'imds' ? <FileText className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                        {sub.submission_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">
                        {sub.submission_type === 'imds' 
                          ? (sub.mds_id || sub.part_name || '-')
                          : (sub.product_name || '-')
                        }
                      </p>
                      {sub.submission_type === 'pcf' && sub.emissions_total && (
                        <p className="text-xs text-[#71717a]">{sub.emissions_total} kg CO₂e</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a1a1aa]">
                      {new Date(sub.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(sub.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-[#71717a]">
            © 2025 AgenticX5 by Preventera · Portail Fournisseur
          </p>
        </div>
      </footer>
    </div>
  );
}
