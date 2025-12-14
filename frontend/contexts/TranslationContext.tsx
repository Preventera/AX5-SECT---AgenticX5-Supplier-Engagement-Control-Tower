'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface TranslationContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.chat': 'Chat IA',
    'nav.suppliers': 'Fournisseurs',
    'nav.campaigns': 'Campagnes',
    'nav.imds': 'IMDS',
    'nav.pcf': 'PCF / Carbone',
    'nav.settings': 'Paramètres',
    'nav.principal': 'PRINCIPAL',
    'nav.modules': 'MODULES',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.subtitle': 'Vue d\'ensemble de vos opérations',
    'dashboard.suppliers': 'Fournisseurs',
    'dashboard.campaigns': 'Campagnes actives',
    'dashboard.imds_submissions': 'Soumissions IMDS',
    'dashboard.pcf_coverage': 'Couverture PCF',
    
    // Suppliers
    'suppliers.title': 'Fournisseurs',
    'suppliers.subtitle': 'Gestion des fournisseurs et contacts',
    'suppliers.add': 'Ajouter un fournisseur',
    'suppliers.refresh': 'Rafraîchir',
    'suppliers.search': 'Rechercher par nom ou email...',
    'suppliers.all_tiers': 'Tous les tiers',
    'suppliers.all_status': 'Tous les statuts',
    'suppliers.total': 'Total',
    'suppliers.active': 'Actifs',
    'suppliers.name': 'Nom de l\'entreprise',
    'suppliers.email': 'Email de contact',
    'suppliers.contact': 'Nom du contact',
    'suppliers.tier': 'Niveau (Tier)',
    'suppliers.status': 'Statut',
    'suppliers.country': 'Pays',
    'suppliers.city': 'Ville',
    'suppliers.industry': 'Secteur d\'activité',
    'suppliers.location': 'Localisation',
    'suppliers.actions': 'Actions',
    'suppliers.edit': 'Modifier',
    'suppliers.delete': 'Supprimer',
    'suppliers.new': 'Nouveau fournisseur',
    'suppliers.edit_title': 'Modifier le fournisseur',
    'suppliers.save': 'Sauvegarder',
    'suppliers.cancel': 'Annuler',
    'suppliers.delete_confirm': 'Supprimer le fournisseur',
    'suppliers.delete_message': 'Êtes-vous sûr de vouloir supprimer',
    'suppliers.delete_warning': 'Cette action est irréversible.',
    'suppliers.none_found': 'Aucun fournisseur trouvé',
    
    // Status
    'status.active': 'Actif',
    'status.inactive': 'Inactif',
    'status.pending': 'En attente',
    'status.validated': 'Validé',
    'status.rejected': 'Rejeté',
    
    // Tier
    'tier.direct': 'Tier 1 - Direct',
    'tier.indirect': 'Tier 2 - Indirect',
    'tier.subcontractor': 'Tier 3 - Sous-traitant',
    
    // IMDS
    'imds.title': 'Soumissions IMDS',
    'imds.subtitle': 'Gestion des Material Data Sheets',
    'imds.new': 'Nouvelle soumission',
    
    // PCF
    'pcf.title': 'PCF / Carbone',
    'pcf.subtitle': 'Product Carbon Footprint - Empreinte carbone produits',
    'pcf.new': 'Nouvelle déclaration',
    'pcf.total_emissions': 'Émissions totales',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.saving': 'Sauvegarde...',
    'common.database': 'Base de données',
    'common.connected': 'Connectée',
    
    // Header
    'header.search': 'Rechercher fournisseurs, campagnes, documents...',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'AI Chat',
    'nav.suppliers': 'Suppliers',
    'nav.campaigns': 'Campaigns',
    'nav.imds': 'IMDS',
    'nav.pcf': 'PCF / Carbon',
    'nav.settings': 'Settings',
    'nav.principal': 'MAIN',
    'nav.modules': 'MODULES',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your operations',
    'dashboard.suppliers': 'Suppliers',
    'dashboard.campaigns': 'Active Campaigns',
    'dashboard.imds_submissions': 'IMDS Submissions',
    'dashboard.pcf_coverage': 'PCF Coverage',
    
    // Suppliers
    'suppliers.title': 'Suppliers',
    'suppliers.subtitle': 'Manage suppliers and contacts',
    'suppliers.add': 'Add Supplier',
    'suppliers.refresh': 'Refresh',
    'suppliers.search': 'Search by name or email...',
    'suppliers.all_tiers': 'All tiers',
    'suppliers.all_status': 'All status',
    'suppliers.total': 'Total',
    'suppliers.active': 'Active',
    'suppliers.name': 'Company Name',
    'suppliers.email': 'Contact Email',
    'suppliers.contact': 'Contact Name',
    'suppliers.tier': 'Tier Level',
    'suppliers.status': 'Status',
    'suppliers.country': 'Country',
    'suppliers.city': 'City',
    'suppliers.industry': 'Industry',
    'suppliers.location': 'Location',
    'suppliers.actions': 'Actions',
    'suppliers.edit': 'Edit',
    'suppliers.delete': 'Delete',
    'suppliers.new': 'New Supplier',
    'suppliers.edit_title': 'Edit Supplier',
    'suppliers.save': 'Save',
    'suppliers.cancel': 'Cancel',
    'suppliers.delete_confirm': 'Delete Supplier',
    'suppliers.delete_message': 'Are you sure you want to delete',
    'suppliers.delete_warning': 'This action cannot be undone.',
    'suppliers.none_found': 'No suppliers found',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.validated': 'Validated',
    'status.rejected': 'Rejected',
    
    // Tier
    'tier.direct': 'Tier 1 - Direct',
    'tier.indirect': 'Tier 2 - Indirect',
    'tier.subcontractor': 'Tier 3 - Subcontractor',
    
    // IMDS
    'imds.title': 'IMDS Submissions',
    'imds.subtitle': 'Material Data Sheets Management',
    'imds.new': 'New Submission',
    
    // PCF
    'pcf.title': 'PCF / Carbon',
    'pcf.subtitle': 'Product Carbon Footprint',
    'pcf.new': 'New Declaration',
    'pcf.total_emissions': 'Total Emissions',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.saving': 'Saving...',
    'common.database': 'Database',
    'common.connected': 'Connected',
    
    // Header
    'header.search': 'Search suppliers, campaigns, documents...',
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
