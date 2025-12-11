/**
 * AX5-SECT API Client
 * Connexion aux vraies données PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface Supplier {
  id: number;
  external_id: string | null;
  name: string;
  parent_group: string | null;
  country_code: string | null;
  region: string | null;
  supplier_type: string | null;
  supply_chain_level: string | null;
  main_part_families: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string | null;
  objective: string | null;
  start_date: string | null;
  end_date: string | null;
  suppliers_total: number;
  suppliers_responded: number;
  suppliers_validated: number;
  progress: number;
}

export interface SupplierStats {
  total: number;
  by_level: { tier1: number; tier2: number };
  by_region: Record<string, number>;
  pcf_maturity: { advanced: number; intermediate: number; beginner: number };
}

export interface CampaignStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
  total_suppliers_engaged: number;
}

export interface DashboardStats {
  suppliers: { total: number; tier1: number; tier2: number };
  campaigns: { total: number; active: number };
  imds: { total: number; validated: number; pending: number; rejected: number };
  pcf: { total: number; validated: number; pending: number; coverage: number; suppliers_covered: number };
  emissions: { total_kgco2e: number; total_tco2e: number };
}

export interface ChatResponse {
  response: string;
  thread_id: string;
  agents_called: string[];
  iteration_count: number;
  errors: string[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Health
export async function getHealthStatus() {
  return fetchAPI<{ status: string; version: string }>('/health');
}

// Chat
export async function sendChatMessage(message: string, threadId?: string): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, thread_id: threadId }),
  });
}

// Suppliers
export async function getSuppliers(params?: {
  search?: string;
  supply_chain_level?: string;
  country_code?: string;
}): Promise<Supplier[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.supply_chain_level) searchParams.append('supply_chain_level', params.supply_chain_level);
  if (params?.country_code) searchParams.append('country_code', params.country_code);

  const query = searchParams.toString();
  return fetchAPI<Supplier[]>(`/suppliers${query ? `?${query}` : ''}`);
}

export async function getSupplier(id: number): Promise<Supplier> {
  return fetchAPI<Supplier>(`/suppliers/${id}`);
}

export async function getSuppliersStats(): Promise<SupplierStats> {
  return fetchAPI<SupplierStats>('/suppliers/stats');
}

// Campaigns
export async function getCampaigns(params?: {
  type?: string;
  status?: string;
}): Promise<Campaign[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);

  const query = searchParams.toString();
  return fetchAPI<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`);
}

export async function getCampaign(id: number): Promise<Campaign> {
  return fetchAPI<Campaign>(`/campaigns/${id}`);
}

export async function getCampaignsStats(): Promise<CampaignStats> {
  return fetchAPI<CampaignStats>('/campaigns/stats');
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/dashboard/stats');
}

export async function getDashboardOverview() {
  return fetchAPI<{ stats: DashboardStats; active_campaigns: Campaign[] }>('/dashboard/overview');
}

export async function getRecentActivity(limit: number = 10) {
  return fetchAPI<Array<{
    type: string;
    title: string;
    description: string;
    status: string;
    timestamp: string;
  }>>(`/dashboard/activity?limit=${limit}`);
}

export async function getEmissionsTrend(months: number = 6) {
  return fetchAPI<Array<{ month: string; collected: number; validated: number }>>(
    `/dashboard/emissions/trend?months=${months}`
  );
}

// ============================================================================
// UTILS
// ============================================================================

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

export function getCountryFlag(code: string | null): string {
  const flags: Record<string, string> = {
    CA: '🇨🇦',
    US: '🇺🇸',
    DE: '🇩🇪',
    FR: '🇫🇷',
    JP: '🇯🇵',
    CN: '🇨🇳',
    MX: '🇲🇽',
  };
  return code ? flags[code] || '🌍' : '🌍';
}

export function getSupplierLevelLabel(level: string | null): string {
  const labels: Record<string, string> = {
    tier1: 'Tier 1',
    tier2: 'Tier 2',
  };
  return level ? labels[level] || level : '-';
}

export function getStatusColor(status: string | null): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    validated: 'bg-green-100 text-green-800',
    submitted: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return status ? colors[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
}
