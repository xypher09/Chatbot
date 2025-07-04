import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, Send, ThumbsUp, ThumbsDown, X, Settings } from 'lucide-react';
import { ChatState, Message, ApiResponse } from '../types/chat';
import { mockApi } from '../services/mockApi';
import { parseAndLinkify } from '../utils/textUtils';
import AdminPanel from './AdminPanel';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [state, setState] = useState<ChatState>({
    sessionId: null,
    chatHistory: [],
    isLoading: false,
    rateLimitInfo: null,
    systemMessage: null,
    isLocked: false
  });
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('aiAssistantSession');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          sessionId: parsed.sessionId,
          chatHistory: parsed.chatHistory || []
        }));
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (state.sessionId) {
      sessionStorage.setItem('aiAssistantSession', JSON.stringify({
        sessionId: state.sessionId,
        chatHistory: state.chatHistory
      }));
    }
  }, [state.sessionId, state.chatHistory]);

  // Check API health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // MOCK API CALL - Replace with actual health endpoint
        const response = await mockApi.getHealth();
        setIsOnline(response.status === 'online');
      } catch {
        setIsOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !state.isLocked) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, state.isLocked]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && state.chatHistory.length === 0) {
      renderInitialGreeting();
    }
  };

  const renderInitialGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
    
    const welcomeMessage: Message = {
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

    setState(prev => ({
      ...prev,
      chatHistory: [welcomeMessage]
    }));
  };

  const addToHistory = (role: 'user' | 'bot', content: string, interactionId?: number, suggestions?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      interactionId,
      suggestions
    };

    setState(prev => {
      const newHistory = [...prev.chatHistory, message];
      // Keep only last 4 messages (2 turns)
      if (newHistory.length > 4) {
        return {
          ...prev,
          chatHistory: newHistory.slice(-4)
        };
      }
      return {
        ...prev,
        chatHistory: newHistory
      };
    });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend || state.isLoading || state.isLocked) return;

    setInputValue('');
    addToHistory('user', messageToSend);

    // Generate session ID if needed
    if (!state.sessionId) {
      setState(prev => ({ ...prev, sessionId: crypto.randomUUID() }));
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // MOCK API CALL - Replace with actual chat endpoint
      const response = await mockApi.getChatResponse(messageToSend, state.sessionId!, state.chatHistory);
      await handleApiResponse(response);
    } catch (error) {
      console.error('Chat error:', error);
      addToHistory('bot', "I'm having some technical difficulties right now. Please try again in a few moments.");
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleApiResponse = async (response: any) => {
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        setState(prev => ({
          ...prev,
          isLocked: true,
          systemMessage: errorData.detail
        }));
      } else {
        addToHistory('bot', "I'm having some technical difficulties right now. Please try again in a few moments.");
      }
      return;
    }

    const data: ApiResponse = await response.json();
    addToHistory('bot', data.answer, data.interaction_id, data.suggested_questions);

    // Update rate limit info
    const hardLimitCount = response.headers.get('X-Hard-Limit-Count');
    const sessionQueryCount = response.headers.get('X-Session-Query-Count');

    if (hardLimitCount && parseInt(hardLimitCount) <= 10) {
      setState(prev => ({
        ...prev,
        rateLimitInfo: `${hardLimitCount} queries remaining. Resets at 5:00 PM.`
      }));
    }

    if (sessionQueryCount && parseInt(sessionQueryCount) >= 10) {
      setState(prev => ({
        ...prev,
        isLocked: true,
        systemMessage: "You've reached the query limit for this conversation."
      }));
    }
  };

  const handleFeedback = async (interactionId: number, type: 'like' | 'dislike') => {
    try {
      // MOCK API CALL - Replace with actual feedback endpoint
      await mockApi.postFeedback(interactionId, type);
      // Update the message to show feedback was given
      setState(prev => ({
        ...prev,
        chatHistory: prev.chatHistory.map(msg => 
          msg.interactionId === interactionId 
            ? { ...msg, feedbackGiven: type }
            : msg
        )
      }));
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const resetConversation = () => {
    if (!confirm('Are you sure you want to start a new conversation?')) return;
    
    setState({
      sessionId: null,
      chatHistory: [],
      isLoading: false,
      rateLimitInfo: null,
      systemMessage: null,
      isLocked: false
    });
    
    sessionStorage.removeItem('aiAssistantSession');
    mockApi.resetSessionCounters();
    renderInitialGreeting();
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Admin panel access (hidden feature - triple click on status dot)
  const [clickCount, setClickCount] = useState(0);
  const handleStatusDotClick = () => {
    setClickCount(prev => prev + 1);
    setTimeout(() => setClickCount(0), 1000);
    
    if (clickCount === 2) { // Third click
      setIsAdminOpen(true);
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
          isOpen ? 'scale-95' : 'hover:scale-110'
        }`}
        aria-label="Open chat assistant"
      >
        <MessageCircle size={24} />
        <div 
          className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300 cursor-pointer ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusDotClick();
          }}
          title="System status (triple-click for admin)"
        />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 z-40 ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            {state.rateLimitInfo && (
              <p className="text-blue-100 text-xs mt-1">{state.rateLimitInfo}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors opacity-50 hover:opacity-100"
              title="Admin Panel"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={resetConversation}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="New Conversation"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.chatHistory.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: parseAndLinkify(message.content) }} />
                </div>
                
                {/* Feedback buttons for bot messages */}
                {message.role === 'bot' && message.interactionId && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleFeedback(message.interactionId!, 'like')}
                      disabled={!!message.feedbackGiven}
                      className={`p-1 rounded transition-colors ${
                        message.feedbackGiven === 'like'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                      } disabled:opacity-50`}
                      title="Like this response"
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.interactionId!, 'dislike')}
                      disabled={!!message.feedbackGiven}
                      className={`p-1 rounded transition-colors ${
                        message.feedbackGiven === 'dislike'
                          ? 'text-red-600 bg-red-50'
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      } disabled:opacity-50`}
                      title="Dislike this response"
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        disabled={state.isLoading || state.isLocked}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {state.isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* System Message */}
        {state.systemMessage && (
          <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200 text-yellow-800 text-sm">
            <p>{state.systemMessage}</p>
            {state.isLocked && (
              <button
                onClick={resetConversation}
                className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-900 text-xs transition-colors"
              >
                Start New Conversation
              </button>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                !isOnline ? "Assistant offline" :
                state.isLocked ? "Input disabled" :
                state.isLoading ? "Waiting for response..." :
                "Type your message..."
              }
              disabled={!isOnline || state.isLocked || state.isLoading}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !isOnline || state.isLocked || state.isLoading}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            >
              {state.isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />
    </>
  );
};

export default ChatWidget;