'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Globe, 
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock data
const suppliers = [
  {
    id: 1,
    external_id: 'SUP-001',
    name: 'Bosch Automotive',
    parent_group: 'Robert Bosch GmbH',
    country_code: 'DE',
    region: 'Europe',
    supplier_type: 'component',
    supply_chain_level: 'tier1',
    imds_status: 'validated',
    pcf_status: 'submitted',
    pcf_maturity: 'advanced',
  },
  {
    id: 2,
    external_id: 'SUP-002',
    name: 'Valeo SA',
    parent_group: 'Valeo',
    country_code: 'FR',
    region: 'Europe',
    supplier_type: 'assembly',
    supply_chain_level: 'tier1',
    imds_status: 'validated',
    pcf_status: 'validated',
    pcf_maturity: 'advanced',
  },
  {
    id: 3,
    external_id: 'SUP-003',
    name: 'Continental AG',
    parent_group: 'Continental',
    country_code: 'DE',
    region: 'Europe',
    supplier_type: 'component',
    supply_chain_level: 'tier1',
    imds_status: 'pending',
    pcf_status: 'pending',
    pcf_maturity: 'intermediate',
  },
  {
    id: 4,
    external_id: 'SUP-004',
    name: 'Denso Corporation',
    parent_group: 'Denso',
    country_code: 'JP',
    region: 'Asia',
    supplier_type: 'component',
    supply_chain_level: 'tier1',
    imds_status: 'validated',
    pcf_status: 'not_started',
    pcf_maturity: 'beginner',
  },
  {
    id: 5,
    external_id: 'SUP-005',
    name: 'ZF Friedrichshafen',
    parent_group: 'ZF Group',
    country_code: 'DE',
    region: 'Europe',
    supplier_type: 'assembly',
    supply_chain_level: 'tier1',
    imds_status: 'validated',
    pcf_status: 'validated',
    pcf_maturity: 'advanced',
  },
  {
    id: 6,
    external_id: 'SUP-006',
    name: 'Magna International',
    parent_group: 'Magna',
    country_code: 'CA',
    region: 'North America',
    supplier_type: 'assembly',
    supply_chain_level: 'tier1',
    imds_status: 'submitted',
    pcf_status: 'pending',
    pcf_maturity: 'intermediate',
  },
];

const statusConfig = {
  validated: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Validé' },
  submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Soumis' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En attente' },
  not_started: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Non démarré' },
};

const maturityColors = {
  beginner: 'bg-red-100 text-red-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-green-100 text-green-700',
};

const maturityLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.external_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || supplier.supply_chain_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500 mt-1">Gérez votre base de données fournisseurs</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un fournisseur
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les niveaux</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
        </select>
        
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Plus de filtres
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tier 1</p>
          <p className="text-2xl font-bold text-gray-900">
            {suppliers.filter(s => s.supply_chain_level === 'tier1').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">PCF complet</p>
          <p className="text-2xl font-bold text-green-600">
            {suppliers.filter(s => s.pcf_status === 'validated').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">
            {suppliers.filter(s => s.pcf_status === 'pending' || s.pcf_status === 'not_started').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fournisseur</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Niveau</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Région</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">IMDS</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">PCF</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Maturité PCF</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSuppliers.map((supplier) => {
              const imdsStatus = statusConfig[supplier.imds_status as keyof typeof statusConfig];
              const pcfStatus = statusConfig[supplier.pcf_status as keyof typeof statusConfig];
              
              return (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-500">{supplier.external_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-blue uppercase text-xs">
                      {supplier.supply_chain_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{supplier.country_code === 'DE' ? '🇩🇪' : 
                                                  supplier.country_code === 'FR' ? '🇫🇷' : 
                                                  supplier.country_code === 'JP' ? '🇯🇵' : 
                                                  supplier.country_code === 'CA' ? '🇨🇦' : '🌍'}</span>
                      <span className="text-sm text-gray-600">{supplier.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', imdsStatus.bg)}>
                      <imdsStatus.icon className={cn('w-3.5 h-3.5', imdsStatus.color)} />
                      <span className={cn('text-xs font-medium', imdsStatus.color)}>{imdsStatus.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', pcfStatus.bg)}>
                      <pcfStatus.icon className={cn('w-3.5 h-3.5', pcfStatus.color)} />
                      <span className={cn('text-xs font-medium', pcfStatus.color)}>{pcfStatus.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'badge',
                      maturityColors[supplier.pcf_maturity as keyof typeof maturityColors]
                    )}>
                      {maturityLabels[supplier.pcf_maturity as keyof typeof maturityLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
