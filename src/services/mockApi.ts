import { HealthResponse, ApiResponse, FeedbackResponse } from '../types/chat';

class MockApiService {
  private interactionCounter = 8019;
  private sessionQueryCount = 0;
  private hardLimitCount = 50;
  private isOnline = true;

  async getHealth(): Promise<HealthResponse> {
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

  async getChatResponse(message: string, sessionId: string, chatHistory: any[]): Promise<any> {
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

    const response: ApiResponse = {
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

  async postFeedback(interactionId: number, feedbackType: 'like' | 'dislike'): Promise<FeedbackResponse> {
    await this.delay(300);
    console.log(`FEEDBACK SENT: interaction_id=${interactionId}, type=${feedbackType}`);
    return { message: "Feedback recorded successfully." };
  }

  resetSessionCounters(): void {
    this.sessionQueryCount = 0;
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
  }

  private createSuccessResponse(data: ApiResponse) {
    return {
      ok: true,
      status: 200,
      headers: this.getHeaders(),
      json: async () => data,
    };
  }

  private createErrorResponse(status: number, detail = 'An error occurred.') {
    return {
      ok: false,
      status,
      headers: this.getHeaders(),
      json: async () => ({ detail }),
    };
  }

  private getHeaders() {
    const headers = new Headers();
    headers.append('X-Session-Query-Count', this.sessionQueryCount.toString());
    headers.append('X-Hard-Limit-Count', this.hardLimitCount.toString());
    return headers;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockApi = new MockApiService();