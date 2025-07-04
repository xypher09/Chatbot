// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.activeTab = 'knowledge';
        this.currentPage = 1;
        this.pageSize = 20;
        this.filters = {};
        this.performanceData = null;
        this.systemStatus = null;
        this.isEditingMessage = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showLoginScreen();
    }

    bindEvents() {
        // Login events
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('close-login').addEventListener('click', () => this.closePanel());
        document.getElementById('close-admin').addEventListener('click', () => this.closePanel());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Knowledge management events
        document.getElementById('file-upload').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('reindex-btn').addEventListener('click', () => this.reindexDocuments());
        document.getElementById('test-rag-btn').addEventListener('click', () => this.testRAGQuery());

        // Analytics events
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportData('CSV'));
        document.getElementById('export-xlsx-btn').addEventListener('click', () => this.exportData('XLSX'));
        document.getElementById('apply-filters-btn').addEventListener('click', () => this.applyFilters());
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));

        // System events
        document.getElementById('toggle-chatbot').addEventListener('click', () => this.toggleChatbotStatus());
        document.getElementById('edit-message-btn').addEventListener('click', () => this.editMaintenanceMessage());
        document.getElementById('save-message-btn').addEventListener('click', () => this.saveMaintenanceMessage());
        document.getElementById('cancel-message-btn').addEventListener('click', () => this.cancelEditMessage());
        document.getElementById('update-limits-btn').addEventListener('click', () => this.updateRateLimits());
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }

    showAdminPanel() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        this.loadInitialData();
    }

    closePanel() {
        window.close();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        const errorElement = document.getElementById('login-error');
        errorElement.classList.add('hidden');
        
        try {
            const response = await window.adminMockApi.authenticate(username, password);
            
            if (response.token) {
                this.isAuthenticated = true;
                this.showAdminPanel();
            } else {
                errorElement.textContent = response.detail;
                errorElement.classList.remove('hidden');
            }
        } catch (error) {
            errorElement.textContent = 'Authentication failed';
            errorElement.classList.remove('hidden');
        }
    }

    async loadInitialData() {
        try {
            const [documents, performanceData, systemStatus, maintenanceMessage] = await Promise.all([
                window.adminMockApi.getDocuments(),
                window.adminMockApi.getPerformanceData(),
                window.adminMockApi.getSystemStatus(),
                window.adminMockApi.getMaintenanceMessage()
            ]);
            
            this.performanceData = performanceData;
            this.systemStatus = systemStatus;
            
            this.renderDocuments(documents);
            this.renderAnalyticsOverview(performanceData);
            this.renderSystemStatus(systemStatus);
            this.renderMaintenanceMessage(maintenanceMessage.message || '');
            this.loadInteractionLogs();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.activeTab = tabName;
    }

    // Knowledge Management Methods
    async handleFileUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
            alert('Only PDF and TXT files are supported');
            return;
        }

        const progressElement = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressElement.classList.remove('hidden');
        
        try {
            await window.adminMockApi.uploadDocument(file, (progress) => {
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Uploading... ${progress}%`;
            });
            
            // Refresh documents list
            const documents = await window.adminMockApi.getDocuments();
            this.renderDocuments(documents);
            progressElement.classList.add('hidden');
        } catch (error) {
            console.error('Upload failed:', error);
            progressElement.classList.add('hidden');
        }

        // Reset file input
        e.target.value = '';
    }

    async toggleDocumentStatus(docId, isEnabled) {
        try {
            await window.adminMockApi.toggleDocument(docId, isEnabled);
            const documents = await window.adminMockApi.getDocuments();
            this.renderDocuments(documents);
        } catch (error) {
            console.error('Failed to toggle document:', error);
        }
    }

    async deleteDocument(docId) {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            await window.adminMockApi.deleteDocument(docId);
            const documents = await window.adminMockApi.getDocuments();
            this.renderDocuments(documents);
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    }

    async reindexDocuments() {
        const btn = document.getElementById('reindex-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<div class="spinner"></div> Indexing...';
        btn.disabled = true;
        
        try {
            await window.adminMockApi.reindexDocuments();
            const documents = await window.adminMockApi.getDocuments();
            this.renderDocuments(documents);
        } catch (error) {
            console.error('Reindexing failed:', error);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async testRAGQuery() {
        const queryInput = document.getElementById('rag-query');
        const query = queryInput.value.trim();
        
        if (!query) return;
        
        const resultsElement = document.getElementById('rag-results');
        
        try {
            const result = await window.adminMockApi.testRAGQuery(query);
            
            document.getElementById('rephrased-question').textContent = result.rephrased_question;
            
            const chunksContainer = document.getElementById('retrieved-chunks');
            chunksContainer.innerHTML = result.retrieved_chunks
                .map(chunk => `<div class="chunk-item">${chunk}</div>`)
                .join('');
            
            document.getElementById('synthesized-answer').textContent = result.synthesized_answer;
            
            resultsElement.classList.remove('hidden');
        } catch (error) {
            console.error('RAG query failed:', error);
        }
    }

    renderDocuments(documents) {
        const container = document.getElementById('documents-list');
        
        container.innerHTML = documents.map(doc => `
            <div class="document-item">
                <div class="document-info">
                    <div class="document-name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <span class="document-title">${doc.filename}</span>
                        <span class="document-status ${doc.status.toLowerCase()}">${doc.status}</span>
                    </div>
                    <div class="document-meta">
                        Uploaded ${new Date(doc.upload_date).toLocaleDateString()}
                        ${doc.last_indexed_date ? ` • Indexed ${new Date(doc.last_indexed_date).toLocaleDateString()}` : ''}
                    </div>
                </div>
                <div class="document-actions">
                    <button class="toggle-btn ${doc.is_enabled ? 'enabled' : ''}" 
                            onclick="adminPanel.toggleDocumentStatus('${doc.id}', ${!doc.is_enabled})"
                            title="${doc.is_enabled ? 'Disable' : 'Enable'} document">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${doc.is_enabled ? 
                                '<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle>' :
                                '<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle>'
                            }
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="adminPanel.deleteDocument('${doc.id}')" title="Delete document">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Analytics Methods
    renderAnalyticsOverview(data) {
        const totalQueries = data.total_queries_over_time.reduce((sum, day) => sum + day.count, 0);
        const satisfactionRate = Math.round(data.feedback_scores.like_ratio * 100);
        
        document.getElementById('total-queries').textContent = totalQueries;
        document.getElementById('satisfaction-rate').textContent = `${satisfactionRate}%`;
        document.getElementById('total-feedback').textContent = data.feedback_scores.total_feedback_count;
    }

    async loadInteractionLogs() {
        try {
            const logs = await window.adminMockApi.getInteractionLogs({
                ...this.filters,
                page: this.currentPage,
                page_size: this.pageSize
            });
            
            this.renderInteractionLogs(logs);
        } catch (error) {
            console.error('Failed to load interaction logs:', error);
        }
    }

    renderInteractionLogs(data) {
        const tbody = document.getElementById('interactions-tbody');
        
        tbody.innerHTML = data.interactions.map(log => `
            <tr>
                <td>${new Date(log.created_at).toLocaleString()}</td>
                <td title="${log.user_query}">${log.user_query}</td>
                <td title="${log.bot_response_snippet}">${log.bot_response_snippet}</td>
                <td>
                    ${log.feedback ? 
                        `<span class="feedback-badge ${log.feedback.toLowerCase()}">${log.feedback}</span>` :
                        '<span class="feedback-badge none">No feedback</span>'
                    }
                </td>
                <td><span class="session-id">${log.session_id.substring(0, 8)}...</span></td>
            </tr>
        `).join('');
        
        // Update pagination
        document.getElementById('pagination-info').textContent = 
            `Showing ${data.interactions.length} of ${data.total_records} results`;
        document.getElementById('page-info').textContent = `Page ${this.currentPage}`;
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = data.interactions.length < this.pageSize;
    }

    applyFilters() {
        this.filters = {
            start_date: document.getElementById('start-date').value || undefined,
            end_date: document.getElementById('end-date').value || undefined,
            search_query: document.getElementById('search-query').value || undefined
        };
        this.currentPage = 1;
        this.loadInteractionLogs();
    }

    changePage(direction) {
        this.currentPage += direction;
        if (this.currentPage < 1) this.currentPage = 1;
        this.loadInteractionLogs();
    }

    async exportData(format) {
        try {
            const blob = await window.adminMockApi.exportData(format, this.filters);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_export.${format.toLowerCase()}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    }

    // System Methods
    renderSystemStatus(status) {
        const toggleBtn = document.getElementById('toggle-chatbot');
        const apiHealth = document.getElementById('api-health');
        const databaseStatus = document.getElementById('database-status');
        const lastUpdated = document.getElementById('last-updated');
        
        toggleBtn.className = `status-toggle ${status.isOnline ? 'online' : 'offline'}`;
        toggleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            ${status.isOnline ? 'ONLINE' : 'OFFLINE'}
        `;
        
        apiHealth.textContent = status.apiHealth;
        apiHealth.className = `status-value ${status.apiHealth === 'Healthy' ? 'healthy' : 'degraded'}`;
        
        databaseStatus.textContent = status.databaseStatus;
        databaseStatus.className = `status-value ${status.databaseStatus === 'Connected' ? 'connected' : 'disconnected'}`;
        
        lastUpdated.textContent = new Date(status.lastUpdated).toLocaleString();
    }

    async toggleChatbotStatus() {
        try {
            const newStatus = this.systemStatus.isOnline ? 'offline' : 'online';
            await window.adminMockApi.toggleChatbotStatus(newStatus);
            
            this.systemStatus.isOnline = !this.systemStatus.isOnline;
            this.systemStatus.lastUpdated = new Date().toISOString();
            this.renderSystemStatus(this.systemStatus);
            
            // Update the chatbot's status if it exists in the parent window
            if (window.opener && window.opener.mockApi) {
                window.opener.mockApi.setOnlineStatus(this.systemStatus.isOnline);
            }
        } catch (error) {
            console.error('Failed to toggle chatbot status:', error);
        }
    }

    renderMaintenanceMessage(message) {
        const displayElement = document.getElementById('maintenance-text');
        const inputElement = document.getElementById('maintenance-input');
        
        displayElement.textContent = message || 'No maintenance message set';
        inputElement.value = message || '';
    }

    editMaintenanceMessage() {
        this.isEditingMessage = true;
        document.getElementById('maintenance-display').classList.add('hidden');
        document.getElementById('maintenance-input').classList.remove('hidden');
        document.getElementById('edit-message-btn').classList.add('hidden');
        document.getElementById('message-actions').classList.remove('hidden');
    }

    async saveMaintenanceMessage() {
        const message = document.getElementById('maintenance-input').value;
        
        try {
            await window.adminMockApi.updateMaintenanceMessage(message);
            this.renderMaintenanceMessage(message);
            this.cancelEditMessage();
        } catch (error) {
            console.error('Failed to save maintenance message:', error);
        }
    }

    cancelEditMessage() {
        this.isEditingMessage = false;
        document.getElementById('maintenance-display').classList.remove('hidden');
        document.getElementById('maintenance-input').classList.add('hidden');
        document.getElementById('edit-message-btn').classList.remove('hidden');
        document.getElementById('message-actions').classList.add('hidden');
        
        // Reset input value
        const currentMessage = document.getElementById('maintenance-text').textContent;
        document.getElementById('maintenance-input').value = 
            currentMessage === 'No maintenance message set' ? '' : currentMessage;
    }

    updateRateLimits() {
        const sessionLimit = document.getElementById('session-limit').value;
        const minuteLimit = document.getElementById('minute-limit').value;
        const hourLimit = document.getElementById('hour-limit').value;
        
        console.log('Rate limits updated:', { sessionLimit, minuteLimit, hourLimit });
        alert('Rate limits updated successfully!');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});