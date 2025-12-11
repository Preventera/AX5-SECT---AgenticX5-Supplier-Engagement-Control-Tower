// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  agent_used: string;
  agents_called: string[];
  processing_time: number;
}

export interface Supplier {
  id: number;
  external_id: string;
  name: string;
  parent_group?: string;
  country_code?: string;
  region?: string;
  supplier_type?: string;
  supply_chain_level?: string;
  main_part_families?: string[];
}

export interface Campaign {
  id: number;
  name: string;
  type: 'IMDS' | 'PCF' | 'MIXED';
  objective?: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

export interface DashboardStats {
  suppliers: {
    total: number;
    by_level: Record<string, number>;
  };
  campaigns: {
    total: number;
    active: number;
    by_type: Record<string, number>;
  };
  submissions: {
    imds_total: number;
    pcf_total: number;
    pcf_validated: number;
  };
  emissions: {
    total_kgco2e: number;
  };
}

// API Functions
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  if (!response.ok) {
    throw new Error(`Chat error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getHealthStatus(): Promise<{ status: string; database?: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${API_BASE_URL}/suppliers`);
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  return response.json();
}

export async function getSupplier(id: number): Promise<Supplier> {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier');
  }
  return response.json();
}

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${API_BASE_URL}/campaigns`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
}

export async function getCampaign(id: number): Promise<Campaign> {
  const response = await fetch(`${API_BASE_URL}/campaigns/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }
  return response.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!response.ok) {
    // Return mock data if endpoint doesn't exist yet
    return {
      suppliers: { total: 12, by_level: { tier1: 10, tier2: 2 } },
      campaigns: { total: 3, active: 2, by_type: { PCF: 1, IMDS: 1, MIXED: 1 } },
      submissions: { imds_total: 15, pcf_total: 25, pcf_validated: 18 },
      emissions: { total_kgco2e: 12500.5 },
    };
  }
  return response.json();
}

// Utility function for formatting
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

export function formatEmissions(kgCO2e: number): string {
  if (kgCO2e >= 1000) {
    return `${(kgCO2e / 1000).toFixed(1)} t CO₂e`;
  }
  return `${kgCO2e.toFixed(1)} kg CO₂e`;
}
