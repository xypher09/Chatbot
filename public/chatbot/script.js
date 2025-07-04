/**
 * University AI Assistant Chat Widget - Vanilla JavaScript
 * Converted from React to pure JavaScript with DOM manipulation
 */

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.isOnline = true;
        this.state = {
            sessionId: null,
            chatHistory: [],
            isLoading: false,
            rateLimitInfo: null,
            systemMessage: null,
            isLocked: false
        };
        this.inputValue = '';
        
        this.init();
    }

    init() {
        this.loadSavedState();
        this.createWidget();
        this.bindEvents();
        this.checkHealth();
        
        // Check API health periodically
        setInterval(() => this.checkHealth(), 30000);
    }

    createWidget() {
        // Create chat widget button
        const widgetButton = document.createElement('button');
        widgetButton.id = 'chat-widget-button';
        widgetButton.className = 'chat-widget-button';
        widgetButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div id="status-dot" class="status-dot ${this.isOnline ? 'online' : ''}"></div>
        `;

        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'chat-window';
        chatWindow.className = 'chat-window';
        chatWindow.innerHTML = `
            <!-- Header -->
            <div class="chat-header">
                <div class="header-info">
                    <h3>AI Assistant</h3>
                    <div id="rate-limit-display" class="rate-limit-info"></div>
                </div>
                <div class="header-actions">
                    <button id="admin-panel-btn" class="icon-button" title="Admin Panel">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                    <button id="new-conversation-btn" class="icon-button" title="New Conversation">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <button id="close-chat-btn" class="icon-button" title="Close chat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Messages -->
            <div id="message-list" class="message-list">
                <!-- Messages will be rendered here -->
            </div>

            <!-- System Message -->
            <div id="system-message-area" class="system-message-area hidden">
                <!-- System messages will appear here -->
            </div>

            <!-- Input Area -->
            <div class="chat-input-area">
                <form id="chat-form">
                    <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off" required>
                    <button type="submit" id="send-btn" class="icon-button send-button" title="Send">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(widgetButton);
        document.body.appendChild(chatWindow);
    }

    bindEvents() {
        // Widget button click
        document.getElementById('chat-widget-button').addEventListener('click', () => this.toggleChat());
        
        // Header buttons
        document.getElementById('admin-panel-btn').addEventListener('click', () => this.openAdminPanel());
        document.getElementById('new-conversation-btn').addEventListener('click', () => this.resetConversation());
        document.getElementById('close-chat-btn').addEventListener('click', () => this.toggleChat());
        
        // Chat form
        document.getElementById('chat-form').addEventListener('submit', (e) => this.handleSendMessage(e));
        
        // Input field
        document.getElementById('chat-input').addEventListener('input', (e) => {
            this.inputValue = e.target.value;
        });

        // Message list for suggestions and feedback
        document.getElementById('message-list').addEventListener('click', (e) => this.handleMessageClick(e));
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chat-window');
        const widgetButton = document.getElementById('chat-widget-button');
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            widgetButton.style.transform = 'scale(0.95)';
            
            if (this.state.chatHistory.length === 0) {
                this.renderInitialGreeting();
            }
            
            // Focus input if not locked
            if (!this.state.isLocked) {
                setTimeout(() => {
                    document.getElementById('chat-input').focus();
                }, 100);
            }
        } else {
            chatWindow.classList.remove('open');
            widgetButton.style.transform = 'scale(1)';
        }
    }

    renderInitialGreeting() {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
        
        const welcomeMessage = {
            id: Date.now().toString(),
            role: 'bot',
            content: `${greeting} I'm your university AI assistant. How can I help you today?`,
            timestamp: new Date(),
            suggestions: [
                "What are the application deadlines?",
                "How much is tuition?",
                "Tell me about campus housing."
            ]
        };

        this.addToHistory(welcomeMessage);
        this.renderMessage(welcomeMessage);
    }

    addToHistory(message) {
        this.state.chatHistory.push(message);
        
        // Keep only last 4 messages (2 turns)
        if (this.state.chatHistory.length > 4) {
            this.state.chatHistory = this.state.chatHistory.slice(-4);
        }
        
        this.saveState();
    }

    renderMessage(message) {
        const messageList = document.getElementById('message-list');
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${message.role}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${message.role}-message`;
        messageBubble.innerHTML = window.parseAndLinkify(message.content);
        
        messageContainer.appendChild(messageBubble);
        
        // Add feedback buttons for bot messages
        if (message.role === 'bot' && message.interactionId) {
            const feedbackContainer = document.createElement('div');
            feedbackContainer.className = 'feedback-controls';
            feedbackContainer.innerHTML = `
                <button class="feedback-btn ${message.feedbackGiven === 'like' ? 'clicked' : ''}" 
                        data-interaction-id="${message.interactionId}" 
                        data-feedback-type="like"
                        ${message.feedbackGiven ? 'disabled' : ''}
                        title="Like this response">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                </button>
                <button class="feedback-btn ${message.feedbackGiven === 'dislike' ? 'clicked' : ''}" 
                        data-interaction-id="${message.interactionId}" 
                        data-feedback-type="dislike"
                        ${message.feedbackGiven ? 'disabled' : ''}
                        title="Dislike this response">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm-3-13h3v7H7V2z"></path>
                    </svg>
                </button>
            `;
            messageContainer.appendChild(feedbackContainer);
        }
        
        // Add suggestions
        if (message.suggestions && message.suggestions.length > 0) {
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'suggestions-container';
            
            message.suggestions.forEach(suggestion => {
                const suggestionBtn = document.createElement('button');
                suggestionBtn.className = 'suggestion-btn';
                suggestionBtn.textContent = suggestion;
                suggestionBtn.disabled = this.state.isLoading || this.state.isLocked;
                suggestionsContainer.appendChild(suggestionBtn);
            });
            
            messageContainer.appendChild(suggestionsContainer);
        }
        
        messageList.appendChild(messageContainer);
        this.scrollToBottom();
    }

    renderLoadingMessage() {
        const messageList = document.getElementById('message-list');
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'loading-message';
        loadingContainer.className = 'message-container bot';
        
        const loadingBubble = document.createElement('div');
        loadingBubble.className = 'message-bubble bot-message';
        loadingBubble.innerHTML = `
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        loadingContainer.appendChild(loadingBubble);
        messageList.appendChild(loadingContainer);
        this.scrollToBottom();
        
        return loadingContainer;
    }

    removeLoadingMessage() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    async handleSendMessage(e, messageText = null) {
        e?.preventDefault();
        
        const messageToSend = messageText || this.inputValue.trim();
        if (!messageToSend || this.state.isLoading || this.state.isLocked) return;

        // Clear input and reset value
        const chatInput = document.getElementById('chat-input');
        chatInput.value = '';
        this.inputValue = '';

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageToSend,
            timestamp: new Date()
        };
        
        this.addToHistory(userMessage);
        this.renderMessage(userMessage);

        // Generate session ID if needed
        if (!this.state.sessionId) {
            this.state.sessionId = crypto.randomUUID();
        }

        // Set loading state
        this.state.isLoading = true;
        this.updateInputState();
        const loadingMessage = this.renderLoadingMessage();

        try {
            const response = await window.mockApi.getChatResponse(messageToSend, this.state.sessionId, this.state.chatHistory);
            await this.handleApiResponse(response);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now().toString(),
                role: 'bot',
                content: "I'm having some technical difficulties right now. Please try again in a few moments.",
                timestamp: new Date()
            };
            this.addToHistory(errorMessage);
            this.renderMessage(errorMessage);
        } finally {
            this.removeLoadingMessage();
            this.state.isLoading = false;
            this.updateInputState();
        }
    }

    async handleApiResponse(response) {
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 429) {
                this.state.isLocked = true;
                this.state.systemMessage = errorData.detail;
                this.updateSystemMessage();
            } else {
                const errorMessage = {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: "I'm having some technical difficulties right now. Please try again in a few moments.",
                    timestamp: new Date()
                };
                this.addToHistory(errorMessage);
                this.renderMessage(errorMessage);
            }
            return;
        }

        const data = await response.json();
        const botMessage = {
            id: Date.now().toString(),
            role: 'bot',
            content: data.answer,
            timestamp: new Date(),
            interactionId: data.interaction_id,
            suggestions: data.suggested_questions
        };
        
        this.addToHistory(botMessage);
        this.renderMessage(botMessage);

        // Update rate limit info
        const hardLimitCount = response.headers.get('X-Hard-Limit-Count');
        const sessionQueryCount = response.headers.get('X-Session-Query-Count');

        if (hardLimitCount && parseInt(hardLimitCount) <= 10) {
            this.state.rateLimitInfo = `${hardLimitCount} queries remaining. Resets at 5:00 PM.`;
            this.updateRateLimitDisplay();
        }

        if (sessionQueryCount && parseInt(sessionQueryCount) >= 10) {
            this.state.isLocked = true;
            this.state.systemMessage = "You've reached the query limit for this conversation.";
            this.updateSystemMessage();
        }
    }

    handleMessageClick(e) {
        // Handle suggestion clicks
        if (e.target.classList.contains('suggestion-btn')) {
            const suggestion = e.target.textContent;
            this.handleSendMessage(null, suggestion);
            return;
        }

        // Handle feedback clicks
        if (e.target.closest('.feedback-btn')) {
            const btn = e.target.closest('.feedback-btn');
            if (btn.disabled) return;
            
            const interactionId = parseInt(btn.dataset.interactionId);
            const feedbackType = btn.dataset.feedbackType;
            
            this.handleFeedback(interactionId, feedbackType, btn);
        }
    }

    async handleFeedback(interactionId, type, buttonElement) {
        try {
            await window.mockApi.postFeedback(interactionId, type);
            
            // Update UI
            buttonElement.classList.add('clicked');
            const feedbackContainer = buttonElement.parentElement;
            const allButtons = feedbackContainer.querySelectorAll('.feedback-btn');
            allButtons.forEach(btn => btn.disabled = true);
            
            // Update message in history
            const messageIndex = this.state.chatHistory.findIndex(msg => msg.interactionId === interactionId);
            if (messageIndex !== -1) {
                this.state.chatHistory[messageIndex].feedbackGiven = type;
                this.saveState();
            }
        } catch (error) {
            console.error('Feedback error:', error);
        }
    }

    resetConversation() {
        if (!confirm('Are you sure you want to start a new conversation?')) return;
        
        this.state = {
            sessionId: null,
            chatHistory: [],
            isLoading: false,
            rateLimitInfo: null,
            systemMessage: null,
            isLocked: false
        };
        
        sessionStorage.removeItem('aiAssistantSession');
        window.mockApi.resetSessionCounters();
        
        // Clear UI
        document.getElementById('message-list').innerHTML = '';
        this.updateRateLimitDisplay();
        this.updateSystemMessage();
        this.updateInputState();
        
        this.renderInitialGreeting();
    }

    openAdminPanel() {
        window.open('/admin/', '_blank', 'width=1200,height=800');
    }

    updateInputState() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        const isDisabled = !this.isOnline || this.state.isLocked || this.state.isLoading;
        
        chatInput.disabled = isDisabled;
        sendBtn.disabled = isDisabled;
        
        if (!this.isOnline) {
            chatInput.placeholder = "Assistant offline";
        } else if (this.state.isLocked) {
            chatInput.placeholder = "Input disabled";
        } else if (this.state.isLoading) {
            chatInput.placeholder = "Waiting for response...";
            sendBtn.innerHTML = `
                <div class="loading-spinner"></div>
            `;
        } else {
            chatInput.placeholder = "Type your message...";
            sendBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            `;
        }
    }

    updateRateLimitDisplay() {
        const display = document.getElementById('rate-limit-display');
        display.textContent = this.state.rateLimitInfo || '';
    }

    updateSystemMessage() {
        const area = document.getElementById('system-message-area');
        
        if (this.state.systemMessage) {
            area.innerHTML = `
                <p>${this.state.systemMessage}</p>
                ${this.state.isLocked ? '<button class="suggestion-btn" onclick="chatWidget.resetConversation()">Start New Conversation</button>' : ''}
            `;
            area.classList.remove('hidden');
        } else {
            area.classList.add('hidden');
        }
    }

    async checkHealth() {
        try {
            const response = await window.mockApi.getHealth();
            const wasOnline = this.isOnline;
            this.isOnline = response.status === 'online';
            
            const statusDot = document.getElementById('status-dot');
            if (this.isOnline) {
                statusDot.classList.add('online');
                if (!wasOnline) {
                    // Re-enable if was offline
                    this.state.systemMessage = null;
                    this.updateSystemMessage();
                }
            } else {
                statusDot.classList.remove('online');
                if (this.isOpen) {
                    this.state.systemMessage = response.maintenance_message || 'The assistant is currently unavailable. We\'re working on it. Please try again later.';
                    this.updateSystemMessage();
                }
            }
            
            this.updateInputState();
        } catch (error) {
            this.isOnline = false;
            document.getElementById('status-dot').classList.remove('online');
            if (this.isOpen) {
                this.state.systemMessage = 'The assistant is currently unavailable. We\'re working on it. Please try again later.';
                this.updateSystemMessage();
            }
            this.updateInputState();
        }
    }

    scrollToBottom() {
        const messageList = document.getElementById('message-list');
        messageList.scrollTop = messageList.scrollHeight;
    }

    saveState() {
        if (this.state.sessionId) {
            sessionStorage.setItem('aiAssistantSession', JSON.stringify({
                sessionId: this.state.sessionId,
                chatHistory: this.state.chatHistory
            }));
        }
    }

    loadSavedState() {
        const savedState = sessionStorage.getItem('aiAssistantSession');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state.sessionId = parsed.sessionId;
                this.state.chatHistory = parsed.chatHistory || [];
            } catch (error) {
                console.error('Failed to load saved state:', error);
            }
        }
    }

    restoreMessages() {
        if (this.state.chatHistory.length > 0) {
            document.getElementById('message-list').innerHTML = '';
            this.state.chatHistory.forEach(message => {
                this.renderMessage(message);
            });
        }
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load dependencies first
    Promise.all([
        import('./mockApi.js'),
        import('./textUtils.js')
    ]).then(() => {
        window.chatWidget = new ChatWidget();
    });
});