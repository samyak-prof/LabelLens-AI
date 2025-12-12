export interface ScanResult {
  purity_score: number;
  verdict_title: string;
  verdict_color: string;
  summary: string;
  additives_found: string[];
  nutrients_highlight: string[];
  warning_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isCached?: boolean;
  timestamp?: number; // Added for history sorting
  mimeType?: string; // Track if it was image or video
  
  // New features
  consistency_warning?: string | null; // e.g. "Front image (Apple) does not match Back image (Chips)"
  freshness_analysis?: string | null; // e.g. "Ripe, consume within 2 days"
  items_detected?: string[]; // For multi-item fruit scans
}

export type AppState = 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR';

export type ActiveTab = 'SCANNER' | 'HISTORY';

export interface VerdictConfig {
  color: string;
  bg: string;
  text: string;
}