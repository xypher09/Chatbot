// Mock API Service for Chat
class MockApiService {
    constructor() {
        this.interactionCounter = 8019;
        this.sessionQueryCount = 0;
        this.hardLimitCount = 50;
        this.isOnline = true;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getHealth() {
        await this.delay(200);
        
        if (this.isOnline) {
            return { status: 'online' };
        } else {
            return { 
                status: 'offline',
                reason: 'Admin switch is OFF',
                maintenance_message: 'The assistant is currently unavailable. We\'re working on it. Please try again later.'
            };
        }
    }

    async getChatResponse(message, sessionId, chatHistory) {
        await this.delay(1200);
        this.interactionCounter++;
        this.sessionQueryCount++;
        this.hardLimitCount--;

        // Simulate rate limiting
        if (this.sessionQueryCount % 6 === 0) {
            return this.createErrorResponse(
                429,
                "You've made a lot of requests in a short time. Please try again in about 15 minutes."
            );
        }

        if (this.hardLimitCount <= 0) {
            return this.createErrorResponse(
                429,
                "Usage Limit Reached. You can ask more questions in 2 hours and 45 minutes. (Limit for this 3-hour window resets at 5:00 PM)"
            );
        }

        // Simulate server error
        if (message.toLowerCase().includes('break')) {
            return this.createErrorResponse(503);
        }

        const noAnswer = message.toLowerCase().includes('obscure topic');

        const response = {
            interaction_id: this.interactionCounter,
            answer: noAnswer
                ? "I'm sorry, I couldn't find an answer to that in my knowledge base. Could you try rephrasing, or would you like to see our [FAQ Page](https://example.com/faq)?"
                : `This is a response to your query about "${message}". For more details, visit our website at https://example.edu or check out the [admissions page](https://example.edu/admissions).`,
            source_links: noAnswer ? [] : [
                {
                    text: "University Admissions Guide",
                    url: "https://example.edu/admissions"
                },
                {
                    text: "Student Handbook",
                    url: "https://example.edu/handbook"
                }
            ],
            suggested_questions: noAnswer
                ? ["How do I apply?", "What are the tuition fees?"]
                : [
                    "Tell me about student life.",
                    "What are the main faculties?",
                    "How do I contact support?",
                ],
            response_type: noAnswer ? 'NO_ANSWER_FOUND' : 'ANSWER_GENERATED'
        };

        return this.createSuccessResponse(response);
    }

    async postFeedback(interactionId, feedbackType) {
        await this.delay(300);
        console.log(`FEEDBACK SENT: interaction_id=${interactionId}, type=${feedbackType}`);
        return { message: "Feedback recorded successfully." };
    }

    resetSessionCounters() {
        this.sessionQueryCount = 0;
    }

    setOnlineStatus(online) {
        this.isOnline = online;
    }

    createSuccessResponse(data) {
        return {
            ok: true,
            status: 200,
            headers: this.getHeaders(),
            json: async () => data,
        };
    }

    createErrorResponse(status, detail = 'An error occurred.') {
        return {
            ok: false,
            status,
            headers: this.getHeaders(),
            json: async () => ({ detail }),
        };
    }

    getHeaders() {
        const headers = new Map();
        headers.set('X-Session-Query-Count', this.sessionQueryCount.toString());
        headers.set('X-Hard-Limit-Count', this.hardLimitCount.toString());
        return {
            get: (key) => headers.get(key)
        };
    }
}

// Create global instance
window.mockApi = new MockApiService();