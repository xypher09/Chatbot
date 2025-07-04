export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  interactionId?: number;
  suggestions?: string[];
  feedbackGiven?: 'like' | 'dislike';
}

export interface ChatState {
  sessionId: string | null;
  chatHistory: Message[];
  isLoading: boolean;
  rateLimitInfo: string | null;
  systemMessage: string | null;
  isLocked: boolean;
}

export interface ApiResponse {
  interaction_id: number;
  answer: string;
  source_links: Array<{
    text: string;
    url: string;
  }>;
  suggested_questions?: string[];
  response_type: 'ANSWER_GENERATED' | 'NO_ANSWER_FOUND';
}

export interface HealthResponse {
  status: 'online' | 'offline' | 'degraded';
  reason?: string;
  maintenance_message?: string | null;
}

export interface FeedbackResponse {
  message: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}