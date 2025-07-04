import { 
  Document, 
  PerformanceData, 
  InteractionLog, 
  InteractionLogsResponse,
  SystemStatus,
  RAGTestResult,
  AnalyticsFilters,
  DbSizeWarning,
  AutoArchivePolicy,
  AutoArchivePolicyResponse,
  MaintenanceMessageResponse,
  ArchivePurgeRequest,
  GenericResponse,
  AuthResponse
} from '../types/admin';

class AdminMockApiService {
  private documents: Document[] = [
    {
      id: '1',
      filename: 'University Handbook 2024.pdf',
      status: 'INDEXED',
      is_enabled: true,
      upload_date: '2024-01-15T10:30:00Z',
      last_indexed_date: '2024-01-15T11:00:00Z',
      error_message: null
    },
    {
      id: '2',
      filename: 'Admissions Guide.pdf',
      status: 'INDEXED',
      is_enabled: true,
      upload_date: '2024-01-14T14:20:00Z',
      last_indexed_date: '2024-01-14T14:45:00Z',
      error_message: null
    },
    {
      id: '3',
      filename: 'Campus Facilities.txt',
      status: 'PENDING',
      is_enabled: false,
      upload_date: '2024-01-16T09:15:00Z',
      last_indexed_date: null,
      error_message: null
    }
  ];

  private interactionLogs: InteractionLog[] = [
    {
      id: 1,
      session_id: 'sess_abc123',
      user_query: 'What are the application deadlines?',
      bot_response_snippet: 'Application deadlines vary by program. For undergraduate programs, the deadline is March 1st...',
      response_type: 'ANSWER_GENERATED',
      feedback: 'LIKE',
      created_at: '2024-01-16T15:30:00Z'
    },
    {
      id: 2,
      session_id: 'sess_def456',
      user_query: 'How much is tuition?',
      bot_response_snippet: 'Tuition for the 2024-2025 academic year is $45,000 for undergraduate students...',
      response_type: 'ANSWER_GENERATED',
      feedback: null,
      created_at: '2024-01-16T15:25:00Z'
    },
    {
      id: 3,
      session_id: 'sess_ghi789',
      user_query: 'Tell me about campus housing',
      bot_response_snippet: 'We offer several housing options including traditional dormitories, apartment-style living...',
      response_type: 'ANSWER_GENERATED',
      feedback: 'LIKE',
      created_at: '2024-01-16T15:20:00Z'
    }
  ];

  private maintenanceMessage = 'The assistant is currently unavailable. We\'re working on it. Please try again later.';

  // MOCK API CALL - Replace with actual authentication endpoint
  async authenticate(username: string, password: string): Promise<AuthResponse | { detail: string }> {
    await this.delay(800);
    
    // Demo credentials
    if (username === 'admin' && password === 'password') {
      return { 
        message: 'Login successful.',
        token: 'mock_jwt_token_12345' 
      };
    }
    
    return { detail: 'Invalid credentials.' };
  }

  // MOCK API CALL - Replace with actual documents endpoint
  async getDocuments(): Promise<Document[]> {
    await this.delay(500);
    return [...this.documents];
  }

  // MOCK API CALL - Replace with actual upload endpoint
  async uploadDocument(file: File, onProgress: (progress: number) => void): Promise<{ id: string; filename: string; status: string }> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await this.delay(100);
      onProgress(i);
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      filename: file.name,
      status: 'PENDING',
      is_enabled: false,
      upload_date: new Date().toISOString(),
      last_indexed_date: null,
      error_message: null
    };

    this.documents.push(newDoc);
    
    return {
      id: newDoc.id,
      filename: newDoc.filename,
      status: newDoc.status
    };
  }

  // MOCK API CALL - Replace with actual toggle endpoint
  async toggleDocument(docId: string, is_enabled: boolean): Promise<{ id: string; filename: string; is_enabled: boolean }> {
    await this.delay(300);
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      doc.is_enabled = is_enabled;
      return {
        id: doc.id,
        filename: doc.filename,
        is_enabled: doc.is_enabled
      };
    }
    throw new Error('Document not found');
  }

  // MOCK API CALL - Replace with actual delete endpoint
  async deleteDocument(docId: string): Promise<GenericResponse> {
    await this.delay(400);
    this.documents = this.documents.filter(d => d.id !== docId);
    return { message: `Source '${docId}' deleted successfully.` };
  }

  // MOCK API CALL - Replace with actual reindex endpoint
  async reindexDocuments(): Promise<GenericResponse> {
    await this.delay(2000);
    this.documents.forEach(doc => {
      if (doc.is_enabled) {
        doc.status = 'INDEXED';
        doc.last_indexed_date = new Date().toISOString();
      }
    });
    return { message: 'Re-indexing initiated for all active sources. Check /admin/sources for status updates.' };
  }

  // MOCK API CALL - Replace with actual RAG test endpoint
  async testRAGQuery(query: string): Promise<RAGTestResult> {
    await this.delay(1500);
    
    return {
      rephrased_question: `What information is available about ${query.toLowerCase()}?`,
      retrieved_chunks: [
        `This is a relevant chunk about ${query} from the university handbook...`,
        `Additional information about ${query} can be found in our admissions guide...`,
        `Here's more context about ${query} from our student resources...`
      ],
      synthesized_answer: `Based on our knowledge base, here's what I found about ${query}: This is a comprehensive answer that synthesizes information from multiple sources to provide you with accurate and helpful information.`
    };
  }

  // MOCK API CALL - Replace with actual performance analytics endpoint
  async getPerformanceData(): Promise<PerformanceData> {
    await this.delay(600);
    
    return {
      total_queries_over_time: [
        { date: '2024-01-10', count: 45 },
        { date: '2024-01-11', count: 52 },
        { date: '2024-01-12', count: 38 },
        { date: '2024-01-13', count: 61 },
        { date: '2024-01-14', count: 47 },
        { date: '2024-01-15', count: 55 },
        { date: '2024-01-16', count: 43 }
      ],
      feedback_scores: {
        like_ratio: 0.87,
        dislike_ratio: 0.13,
        total_feedback_count: 234
      },
      most_frequent_questions: [
        { query: 'What are the application deadlines?', count: 234 },
        { query: 'How much is tuition?', count: 189 },
        { query: 'Tell me about campus housing', count: 156 },
        { query: 'What programs do you offer?', count: 143 },
        { query: 'How do I apply for financial aid?', count: 128 }
      ]
    };
  }

  // MOCK API CALL - Replace with actual interaction logs endpoint
  async getInteractionLogs(filters: AnalyticsFilters = {}): Promise<InteractionLogsResponse> {
    await this.delay(400);
    
    let filteredLogs = [...this.interactionLogs];
    
    if (filters.search_query) {
      const searchTerm = filters.search_query.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.user_query.toLowerCase().includes(searchTerm) ||
        log.bot_response_snippet.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.feedback_type && filters.feedback_type !== 'NONE') {
      filteredLogs = filteredLogs.filter(log => log.feedback === filters.feedback_type);
    }
    
    if (filters.start_date) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) >= new Date(filters.start_date!)
      );
    }
    
    if (filters.end_date) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) <= new Date(filters.end_date!)
      );
    }
    
    const page = filters.page || 1;
    const pageSize = filters.page_size || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedLogs = filteredLogs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(startIndex, endIndex);
    
    return {
      total_records: filteredLogs.length,
      page,
      page_size: pageSize,
      interactions: paginatedLogs
    };
  }

  // MOCK API CALL - Replace with actual export endpoint
  async exportData(format: 'CSV' | 'XLSX', filters: AnalyticsFilters = {}): Promise<Blob> {
    await this.delay(1000);
    
    const logs = await this.getInteractionLogs(filters);
    
    if (format === 'CSV') {
      const csvContent = [
        'ID,Session ID,User Query,Bot Response Snippet,Response Type,Feedback,Created At',
        ...logs.interactions.map(log => 
          `"${log.id}","${log.session_id}","${log.user_query}","${log.bot_response_snippet}","${log.response_type}","${log.feedback || ''}","${log.created_at}"`
        )
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    } else {
      // For demo purposes, return CSV for XLSX too
      const csvContent = [
        'ID,Session ID,User Query,Bot Response Snippet,Response Type,Feedback,Created At',
        ...logs.interactions.map(log => 
          `"${log.id}","${log.session_id}","${log.user_query}","${log.bot_response_snippet}","${log.response_type}","${log.feedback || ''}","${log.created_at}"`
        )
      ].join('\n');
      
      return new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
  }

  // MOCK API CALL - Replace with actual archive-purge endpoint
  async archivePurgeData(request: ArchivePurgeRequest): Promise<GenericResponse> {
    await this.delay(2000);
    console.log(`Archive and purge data from ${request.start_date} to ${request.end_date}`);
    return { message: 'Data exported and purged successfully for the specified range.' };
  }

  // MOCK API CALL - Replace with actual db-size-warning endpoint
  async getDbSizeWarning(): Promise<DbSizeWarning> {
    await this.delay(300);
    
    const currentSize = 2.3 * 1024; // 2.3 GB in MB
    const threshold = 5 * 1024; // 5 GB in MB
    
    return {
      current_size_mb: currentSize,
      threshold_mb: threshold,
      warning_message: currentSize > threshold ? 
        `Analytics database size: ${(currentSize / 1024).toFixed(1)} GB. Consider archiving and purging older data to maintain performance.` : 
        null
    };
  }

  // MOCK API CALL - Replace with actual auto-archive-policy endpoint
  async setAutoArchivePolicy(policy: AutoArchivePolicy): Promise<AutoArchivePolicyResponse> {
    await this.delay(400);
    console.log(`Auto-archive policy updated:`, policy);
    return {
      message: 'Auto-archive policy updated successfully.',
      policy
    };
  }

  // MOCK API CALL - Replace with actual system status endpoint
  async getSystemStatus(): Promise<SystemStatus> {
    await this.delay(300);
    
    return {
      isOnline: true,
      apiHealth: 'Healthy',
      databaseStatus: 'Connected',
      lastUpdated: new Date().toISOString(),
      maintenanceMessage: this.maintenanceMessage
    };
  }

  // MOCK API CALL - Replace with actual system toggle endpoint
  async toggleChatbotStatus(status: 'online' | 'offline'): Promise<GenericResponse> {
    await this.delay(500);
    console.log(`Chatbot status changed to: ${status}`);
    return { message: `Chatbot status updated to '${status}'.` };
  }

  // MOCK API CALL - Replace with actual maintenance message get endpoint
  async getMaintenanceMessage(): Promise<MaintenanceMessageResponse> {
    await this.delay(200);
    return { message: this.maintenanceMessage };
  }

  // MOCK API CALL - Replace with actual maintenance message update endpoint
  async updateMaintenanceMessage(message: string): Promise<GenericResponse> {
    await this.delay(400);
    this.maintenanceMessage = message;
    console.log(`Maintenance message updated: ${message}`);
    return { message: 'Maintenance message updated successfully.' };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const adminMockApi = new AdminMockApiService();