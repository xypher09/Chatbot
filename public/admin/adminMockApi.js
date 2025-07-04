// Admin Mock API Service
class AdminMockApiService {
    constructor() {
        this.documents = [
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

        this.interactionLogs = [
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
            },
            {
                id: 4,
                session_id: 'sess_jkl012',
                user_query: 'What programs do you offer?',
                bot_response_snippet: 'We offer over 100 undergraduate and graduate programs across various disciplines...',
                response_type: 'ANSWER_GENERATED',
                feedback: 'DISLIKE',
                created_at: '2024-01-16T15:15:00Z'
            },
            {
                id: 5,
                session_id: 'sess_mno345',
                user_query: 'How do I apply for financial aid?',
                bot_response_snippet: 'Financial aid applications can be submitted through our online portal...',
                response_type: 'ANSWER_GENERATED',
                feedback: 'LIKE',
                created_at: '2024-01-16T15:10:00Z'
            }
        ];

        this.maintenanceMessage = 'The assistant is currently unavailable. We\'re working on it. Please try again later.';
        this.systemStatus = {
            isOnline: true,
            apiHealth: 'Healthy',
            databaseStatus: 'Connected',
            lastUpdated: new Date().toISOString(),
            maintenanceMessage: this.maintenanceMessage
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Authentication
    async authenticate(username, password) {
        await this.delay(800);
        
        if (username === 'admin' && password === 'password') {
            return { 
                message: 'Login successful.',
                token: 'mock_jwt_token_12345' 
            };
        }
        
        return { detail: 'Invalid credentials.' };
    }

    // Documents
    async getDocuments() {
        await this.delay(500);
        return [...this.documents];
    }

    async uploadDocument(file, onProgress) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await this.delay(100);
            onProgress(i);
        }

        const newDoc = {
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

    async toggleDocument(docId, is_enabled) {
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

    async deleteDocument(docId) {
        await this.delay(400);
        this.documents = this.documents.filter(d => d.id !== docId);
        return { message: `Source '${docId}' deleted successfully.` };
    }

    async reindexDocuments() {
        await this.delay(2000);
        this.documents.forEach(doc => {
            if (doc.is_enabled) {
                doc.status = 'INDEXED';
                doc.last_indexed_date = new Date().toISOString();
            }
        });
        return { message: 'Re-indexing initiated for all active sources. Check /admin/sources for status updates.' };
    }

    async testRAGQuery(query) {
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

    // Analytics
    async getPerformanceData() {
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

    async getInteractionLogs(filters = {}) {
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
                new Date(log.created_at) >= new Date(filters.start_date)
            );
        }
        
        if (filters.end_date) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.created_at) <= new Date(filters.end_date)
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

    async exportData(format, filters = {}) {
        await this.delay(1000);
        
        const logs = await this.getInteractionLogs(filters);
        
        const csvContent = [
            'ID,Session ID,User Query,Bot Response Snippet,Response Type,Feedback,Created At',
            ...logs.interactions.map(log => 
                `"${log.id}","${log.session_id}","${log.user_query}","${log.bot_response_snippet}","${log.response_type}","${log.feedback || ''}","${log.created_at}"`
            )
        ].join('\n');
        
        return new Blob([csvContent], { 
            type: format === 'CSV' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
    }

    // System
    async getSystemStatus() {
        await this.delay(300);
        return { ...this.systemStatus };
    }

    async toggleChatbotStatus(status) {
        await this.delay(500);
        this.systemStatus.isOnline = status === 'online';
        this.systemStatus.lastUpdated = new Date().toISOString();
        console.log(`Chatbot status changed to: ${status}`);
        return { message: `Chatbot status updated to '${status}'.` };
    }

    async getMaintenanceMessage() {
        await this.delay(200);
        return { message: this.maintenanceMessage };
    }

    async updateMaintenanceMessage(message) {
        await this.delay(400);
        this.maintenanceMessage = message;
        this.systemStatus.maintenanceMessage = message;
        console.log(`Maintenance message updated: ${message}`);
        return { message: 'Maintenance message updated successfully.' };
    }
}

// Create global instance
window.adminMockApi = new AdminMockApiService();