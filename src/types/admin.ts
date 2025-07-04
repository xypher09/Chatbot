export interface Document {
  id: string;
  filename: string;
  status: 'PENDING' | 'INDEXED' | 'ERROR';
  is_enabled: boolean;
  upload_date: string; // ISO 8601 format
  last_indexed_date: string | null; // ISO 8601 format
  error_message: string | null;
}

export interface PerformanceData {
  total_queries_over_time: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;
  feedback_scores: {
    like_ratio: number;
    dislike_ratio: number;
    total_feedback_count: number;
  };
  most_frequent_questions: Array<{
    query: string;
    count: number;
  }>;
}

export interface InteractionLog {
  id: number;
  session_id: string;
  user_query: string;
  bot_response_snippet: string;
  response_type: string;
  feedback: 'LIKE' | 'DISLIKE' | null;
  created_at: string; // ISO 8601 format
}

export interface InteractionLogsResponse {
  total_records: number;
  page: number;
  page_size: number;
  interactions: InteractionLog[];
}

export interface SystemStatus {
  isOnline: boolean;
  apiHealth: 'Healthy' | 'Degraded' | 'Down';
  databaseStatus: 'Connected' | 'Disconnected';
  lastUpdated: string;
  maintenanceMessage?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'moderator';
  lastLogin: string;
}

export interface RAGTestResult {
  rephrased_question: string;
  retrieved_chunks: string[];
  synthesized_answer: string;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  search_query?: string;
  feedback_type?: 'LIKE' | 'DISLIKE' | 'NONE';
  page?: number;
  page_size?: number;
}

export interface DbSizeWarning {
  current_size_mb: number;
  threshold_mb: number;
  warning_message: string | null;
}

export interface AutoArchivePolicy {
  enabled: boolean;
  retention_days?: number;
}

export interface AutoArchivePolicyResponse {
  message: string;
  policy: AutoArchivePolicy;
}

export interface MaintenanceMessageResponse {
  message: string | null;
}

export interface ArchivePurgeRequest {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export interface GenericResponse {
  message: string;
}