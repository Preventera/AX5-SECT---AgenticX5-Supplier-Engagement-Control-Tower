import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'badge-green',
    completed: 'badge-blue',
    draft: 'badge-gray',
    paused: 'badge-yellow',
    overdue: 'badge-red',
    validated: 'badge-green',
    pending: 'badge-yellow',
    rejected: 'badge-red',
    submitted: 'badge-blue',
    not_started: 'badge-gray',
    in_progress: 'badge-yellow',
  };
  return colors[status.toLowerCase()] || 'badge-gray';
}

export function getSupplierLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
    tier4: 'Tier 4',
  };
  return labels[level.toLowerCase()] || level;
}

export function getCampaignTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IMDS: 'IMDS',
    PCF: 'PCF',
    MIXED: 'Mixte',
  };
  return labels[type] || type;
}

export function getAgentIcon(agent: string): string {
  const icons: Record<string, string> = {
    orchestrator: '🎯',
    knowledge_miner: '📚',
    data_modeler: '📊',
    campaign_manager: '🎯',
    content_generator: '✉️',
  };
  return icons[agent.toLowerCase()] || '🤖';
}

export function getAgentLabel(agent: string): string {
  const labels: Record<string, string> = {
    orchestrator: 'Orchestrateur',
    knowledge_miner: 'Knowledge Miner',
    data_modeler: 'Data Modeler',
    campaign_manager: 'Campaign Manager',
    content_generator: 'Content Generator',
  };
  return labels[agent.toLowerCase()] || agent;
}
