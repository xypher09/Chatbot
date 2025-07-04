/**
 * University AI Assistant Frontend Logic
 * Version 1.0
 *
 * This script handles all client-side functionality for the chat interface,
 * including state management, UI rendering, and API communication.
 *
 * Warning: This code contains traces of humor, puns, and possibly a dad joke or two.
 * Proceed with a smile!
 */
document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURATION & CONSTANTS ---
  const CONFIG = {
    api: {
      // In a real app, these would be your actual API endpoints
      health: "/api/health",
      chat: "/api/chat",
      feedback: "/api/feedback",
    },
    selectors: {
      widgetButton: "#chat-widget-button",
      statusDot: "#status-dot",
      chatWindow: "#chat-window",
      messageList: "#message-list",
      chatForm: "#chat-form",
      chatInput: "#chat-input",
      sendButton: "#send-btn",
      newConversationBtn: "#new-conversation-btn",
      rateLimitDisplay: "#rate-limit-display",
      systemMessageArea: "#system-message-area",
    },
    css: {
      open: "open",
      online: "online",
      hidden: "hidden",
      clicked: "clicked",
      suggestionBtn: "suggestion-btn",
      feedbackBtn: "feedback-btn",
      commonQuestions: "common-questions",
      suggestedQuestions: "suggested-questions",
    },
    storageKey: "aiAssistantSession",
    statusCheckInterval: 30000, // 30 seconds (or one episode of a cat video in internet time)
  };

  // --- DOM ELEMENTS ---
  // Caching DOM elements for performance and cleaner access (and to avoid DOM hide-and-seek)
  const elements = {
    widgetButton: document.querySelector(CONFIG.selectors.widgetButton),
    statusDot: document.querySelector(CONFIG.selectors.statusDot),
    chatWindow: document.querySelector(CONFIG.selectors.chatWindow),
    messageList: document.querySelector(CONFIG.selectors.messageList),
    chatForm: document.querySelector(CONFIG.selectors.chatForm),
    chatInput: document.querySelector(CONFIG.selectors.chatInput),
    sendButton: document.querySelector(CONFIG.selectors.sendButton),
    newConversationBtn: document.querySelector(
      CONFIG.selectors.newConversationBtn
    ),
    rateLimitDisplay: document.querySelector(CONFIG.selectors.rateLimitDisplay),
    systemMessageArea: document.querySelector(
      CONFIG.selectors.systemMessageArea
    ),
  };

  // --- APPLICATION STATE ---
  // Centralizing the session's state into a single object (because chaos is only fun in parties)
  let state = {
    sessionId: null,
    chatHistory: [], // The "Two-Turn Memory" (because bots have goldfish memory)
    isWindowOpen: false,
  };

  // =================================================================================
  // MOCK API SIMULATION
  // This object simulates the backend to allow for full frontend testing.
  // In a real application, this entire object would be replaced with `fetch` calls.
  // =================================================================================
  const mockApi = {
    interactionCounter: 8019,
    sessionQueryCount: 0,
    hardLimitCount: 50,
    isOnline: true,

    async getHealth() {
      await new Promise((res) => setTimeout(res, 200));
      return { status: this.isOnline ? "Online" : "Offline" };
    },

    async getChatResponse(message) {
      await new Promise((res) => setTimeout(res, 1200));
      this.interactionCounter++;
      this.sessionQueryCount++;
      this.hardLimitCount--;

      if (this.sessionQueryCount % 6 === 0)
        return this.createErrorResponse(
          429,
          "You've made a lot of requests in a short time. Please try again in about 15 minutes."
        );
      if (this.hardLimitCount <= 0)
        return this.createErrorResponse(
          429,
          "Usage Limit Reached. You can ask more questions in 2 hours and 45 minutes. (Limit for this 3-hour window resets at 5:00 PM)"
        );
      if (message.toLowerCase().includes("break"))
        return this.createErrorResponse(503);

      const noAnswer = message.toLowerCase().includes("obscure topic");

      return this.createSuccessResponse({
        answer: noAnswer
          ? "I'm sorry, I couldn't find an answer to that in my knowledge base. Could you try rephrasing, or would you like to see our [FAQ Page](https://example.com/faq)?"
          : `This is a response to your query about "${message}". For more details, visit our website at https://example.edu or check out the [admissions page](https://example.edu/admissions).`,
        interaction_id: this.interactionCounter,
        suggested_questions: noAnswer
          ? ["How do I apply?", "What are the tuition fees?"]
          : [
              "Tell me about student life.",
              "What are the main faculties?",
              "How do I contact support?",
            ],
      });
    },

    async postFeedback(interactionId, feedbackType) {
      // Fire-and-forget, like sending a message in a bottle (but faster)
      console.log(
        `FEEDBACK SENT: interaction_id=${interactionId}, type=${feedbackType}. (Fire-and-forget)`
      );
      return { ok: true, status: 200 };
    },

    createSuccessResponse(data) {
      return {
        ok: true,
        status: 200,
        headers: this.getHeaders(),
        json: async () => data,
      };
    },

    createErrorResponse(status, detail = "An error occurred.") {
      return {
        ok: false,
        status,
        headers: this.getHeaders(),
        json: async () => ({ detail }),
      };
    },

    getHeaders() {
      const headers = new Headers();
      headers.append("X-Session-Query-Count", this.sessionQueryCount);
      headers.append("X-Hard-Limit-Count", this.hardLimitCount);
      return headers;
    },

    resetSessionCounters() {
      this.sessionQueryCount = 0;
    },
  };

  // --- UI RENDERING & UPDATES ---

  /**
   * Toggles the chat window's visibility and updates the open state.
   * Like a magic trick, but with more JavaScript and less rabbits.
   */
  const toggleChatWindow = () => {
    state.isWindowOpen = !state.isWindowOpen;
    elements.chatWindow.classList.toggle(CONFIG.css.open, state.isWindowOpen);

    if (state.isWindowOpen && !state.sessionId) {
      renderInitialView();
    }
  };

  /**
   * Renders the initial friendly greeting and a set of common questions.
   * Because everyone loves a warm welcome (and a little help).
   */
  const renderInitialView = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning!"
        : hour < 18
        ? "Good afternoon!"
        : "Good evening!";

    renderMessage("bot", `${greeting} How can I assist you today?`);

    const commonQuestions = [
      "What are the application deadlines?",
      "How much is tuition?",
      "Tell me about campus housing.",
    ];
    renderSuggestions(commonQuestions, CONFIG.css.commonQuestions);
  };

  /**
   * Creates and appends a new message to the chat list.
   * @param {'user' | 'bot'} role - The sender of the message.
   * @param {string} text - The message content.
   * @param {number | null} interactionId - The ID for feedback controls.
   *
   * Fun fact: Each message is hand-crafted by our team of highly trained electrons.
   */
  const renderMessage = (role, text, interactionId = null) => {
    const messageContainer = document.createElement("div");
    messageContainer.className = `${role}-message-container`;

    const messageBubble = document.createElement("div");
    messageBubble.className = `message-bubble ${role}-message`;
    messageBubble.innerHTML = parseAndLinkify(text);

    messageContainer.appendChild(messageBubble);

    if (role === "bot" && interactionId) {
      const feedbackHTML = createFeedbackControlsHTML(interactionId);
      messageContainer.insertAdjacentHTML("beforeend", feedbackHTML);
    }

    elements.messageList.appendChild(messageContainer);
    scrollToBottom();
    return messageContainer;
  };

  /**
   * Renders a list of clickable suggestion buttons.
   * @param {string[]} suggestions - An array of question strings.
   * @param {string} typeClass - The CSS class for the container.
   *
   * Buttons so tempting, even the bot wants to click them.
   */
  const renderSuggestions = (suggestions, typeClass) => {
    // Clear previous suggestions to prevent duplicates (because two is a crowd)
    elements.messageList.querySelector(`.${typeClass}`)?.remove();

    const container = document.createElement("div");
    container.className = typeClass;
    container.innerHTML = suggestions
      .map((q) => `<button class="${CONFIG.css.suggestionBtn}">${q}</button>`)
      .join("");

    elements.messageList.appendChild(container);
    scrollToBottom();
  };

  /**
   * Manages the enabled/disabled state of the user input area and system messages.
   * @param {'active'|'loading'|'locked'|'offline'} mode - The desired UI state.
   * @param {string | null} message - An optional message to display.
   *
   * Disabling input: because sometimes, even bots need a break.
   */
  const setInteractionState = (mode, message = null) => {
    const isLocked =
      mode === "locked" || mode === "loading" || mode === "offline";
    elements.chatInput.disabled = isLocked;
    elements.sendButton.disabled = isLocked;
    elements.systemMessageArea.classList.toggle(CONFIG.css.hidden, !message);
    elements.systemMessageArea.innerHTML = message ? `<p>${message}</p>` : "";

    switch (mode) {
      case "active":
        elements.chatInput.placeholder = "Type your message...";
        elements.sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
        break;
      case "loading":
        elements.chatInput.placeholder = "Waiting for response...";
        elements.sendButton.innerHTML = `<div class="loading-dots-small"><span></span><span></span><span></span></div>`; // A smaller loader for the button
        break;
      case "locked":
      case "offline":
        elements.chatInput.placeholder = "Input disabled";
        break;
    }
  };

  /**
   * Updates the UI based on rate limit headers from the API response.
   * @param {Headers} headers - The headers object from the fetch response.
   *
   * Because limits are like cookies: you always want more.
   */
  const updateHeaderBasedUI = (headers) => {
    // Handle 3-hour limit display
    const hardLimitCount = headers.get("X-Hard-Limit-Count");
    if (hardLimitCount && parseInt(hardLimitCount) <= 10) {
      elements.rateLimitDisplay.textContent = `Queries left: ${hardLimitCount}. Resets at 5:00 PM.`;
    } else {
      elements.rateLimitDisplay.textContent = "";
    }

    // Handle session limit (10 queries)
    const sessionQueryCount = headers.get("X-Session-Query-Count");
    if (sessionQueryCount && parseInt(sessionQueryCount) >= 10) {
      const message = `You've reached the query limit for this conversation. <button class="${CONFIG.css.suggestionBtn}" data-action="reset">Start a New Conversation</button>`;
      setInteractionState("locked", message);
    }
  };

  // --- STATE & CONTEXT MANAGEMENT ---

  /**
   * Persists the current session state (ID and history) to sessionStorage.
   * Because even bots need to remember things sometimes.
   */
  const saveState = () => {
    if (state.sessionId) {
      sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    }
  };

  /**
   * Loads session state from sessionStorage on page load.
   * Like waking up from a nap and remembering your dreams.
   */
  const loadState = () => {
    const savedState = sessionStorage.getItem(CONFIG.storageKey);
    if (savedState) {
      const loaded = JSON.parse(savedState);
      state.sessionId = loaded.sessionId;
      state.chatHistory = loaded.chatHistory;

      // Rehydrate the UI from history
      elements.messageList.innerHTML = "";
      state.chatHistory.forEach((msg) => renderMessage(msg.role, msg.content));
      console.log("Session rehydrated from sessionStorage.");
    }
  };

  /**
   * Adds a message to the history and trims it to the "Two-Turn Memory" limit (4 messages).
   * @param {'user' | 'bot'} role - The sender.
   * @param {string} content - The message text.
   *
   * Memory is precious. So is RAM.
   */
  const addToHistory = (role, content) => {
    state.chatHistory.push({ role, content });
    if (state.chatHistory.length > 4) {
      state.chatHistory = state.chatHistory.slice(-4);
    }
  };

  /**
   * Resets the entire conversation state and UI.
   *
   * Like a fresh start, but with less existential dread.
   */
  const resetSession = () => {
    if (!confirm("Are you sure you want to start a new conversation?")) return;

    // Reset state
    state.sessionId = null;
    state.chatHistory = [];
    mockApi.resetSessionCounters(); // For mock API only
    sessionStorage.removeItem(CONFIG.storageKey);

    // Reset UI
    elements.messageList.innerHTML = "";
    elements.rateLimitDisplay.textContent = "";
    setInteractionState("active");
    renderInitialView();
  };

  // --- CORE LOGIC & API HANDLING ---

  /**
   * Main handler for when the user submits the chat form.
   * @param {Event} e - The form submission event.
   *
   * This is where the magic happens. Or at least, where the user hopes it does.
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = elements.chatInput.value.trim();
    if (!userMessage) return;

    // Clear any leftover suggestions
    elements.messageList
      .querySelector(
        `.${CONFIG.css.suggestedQuestions}, .${CONFIG.css.commonQuestions}`
      )
      ?.remove();

    renderMessage("user", userMessage);
    elements.chatForm.reset();

    addToHistory("user", userMessage);

    if (!state.sessionId) {
      state.sessionId = generateUUIDv4();
    }

    // Show loading state
    const loadingIndicator = renderMessage(
      "bot",
      '<div class="loading-dots"><span></span><span></span><span></span></div>'
    );
    setInteractionState("loading");

    try {
      const response = await mockApi.getChatResponse(
        userMessage,
        state.sessionId,
        state.chatHistory
      );
      handleApiResponse(response);
    } catch (error) {
      console.error("Network or unexpected error:", error);
      renderMessage(
        "bot",
        "I seem to be having some technical trouble right now. Please try your question again in a few moments."
      );
    } finally {
      loadingIndicator.remove();
      // The interaction state will be set by handleApiResponse or the error handler.
      // If it wasn't a locking error, set it back to active.
      if (!elements.chatInput.disabled) {
        setInteractionState("active");
      }
    }
  };

  /**
   * Processes the response from the API, handling success, errors, and rate limits.
   * @param {Response} response - The fetch-like response from the mock API.
   *
   * If you can read this, congrats! You survived the callback jungle.
   */
  const handleApiResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        setInteractionState("locked", errorData.detail);
      } else {
        // Generic server error (5xx)
        renderMessage(
          "bot",
          "I seem to be having some technical trouble right now. Please try your question again in a few moments."
        );
        setInteractionState("active"); // Allow user to try again
      }
      return;
    }

    const data = await response.json();
    renderMessage("bot", data.answer, data.interaction_id);
    addToHistory("bot", data.answer);

    if (data.suggested_questions?.length) {
      renderSuggestions(
        data.suggested_questions,
        CONFIG.css.suggestedQuestions
      );
    }

    setInteractionState("active"); // Re-enable input after successful response
    updateHeaderBasedUI(response.headers);
    saveState();
  };

  /**
   * Checks the API health endpoint and updates the UI accordingly.
   *
   * Because even bots need a checkup now and then.
   */
  const checkApiStatus = async () => {
    try {
      const data = await mockApi.getHealth();
      if (data.status !== "Online") throw new Error("Offline");

      elements.statusDot.classList.add(CONFIG.css.online);
      // If the chat was offline, but is now online, re-enable it.
      if (elements.chatInput.dataset.offline) {
        delete elements.chatInput.dataset.offline;
        setInteractionState("active");
      }
    } catch (error) {
      elements.statusDot.classList.remove(CONFIG.css.online);
      if (state.isWindowOpen) {
        setInteractionState(
          "offline",
          "The assistant is currently unavailable. We're working on it. Please try again later."
        );
        elements.chatInput.dataset.offline = "true";
      }
    }
  };

  /**
   * Handles clicks on dynamically added elements within the message list.
   * @param {Event} e The click event.
   *
   * Event delegation: because who wants to add a million event listeners?
   */
  const handleMessageListClick = (e) => {
    const target = e.target;

    // Handle suggestion button clicks
    const suggestionBtn = target.closest(`.${CONFIG.css.suggestionBtn}`);
    if (suggestionBtn) {
      // Handle special case for reset button
      if (suggestionBtn.dataset.action === "reset") {
        resetSession();
        return;
      }
      elements.chatInput.value = suggestionBtn.textContent;
      elements.chatForm.requestSubmit(); // Modern way to submit a form
      return;
    }

    // Handle feedback button clicks
    const feedbackBtn = target.closest(`.${CONFIG.css.feedbackBtn}`);
    if (feedbackBtn && !feedbackBtn.disabled) {
      const parent = feedbackBtn.parentElement;

      feedbackBtn.classList.add(CONFIG.css.clicked);
      Array.from(parent.children).forEach((btn) => (btn.disabled = true));

      mockApi.postFeedback(
        feedbackBtn.dataset.interactionId,
        feedbackBtn.dataset.feedbackType
      );
    }
  };

  // --- UTILITY FUNCTIONS ---

  /** Scrolls the message list to the most recent message. Because nobody likes spoilers at the top. */
  const scrollToBottom = () => {
    elements.messageList.scrollTop = elements.messageList.scrollHeight;
  };

  /** Generates a Version 4 UUID. Because every session deserves a unique name. */
  const generateUUIDv4 = () => crypto.randomUUID();

  /**
   * Parses a string for Markdown links and raw URLs, converting them to HTML <a> tags.
   * @param {string} text - The text to parse.
   * @returns {string} The text with HTML links.
   *
   * Now with 100% more clickable goodness!
   */
  const parseAndLinkify = (text) => {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
    const rawUrlRegex = /(?<!href=")(https?:\/\/[^\s]+)/g; // Avoids linking already linked URLs
    return text
      .replace(
        markdownLinkRegex,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        rawUrlRegex,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  };

  /**
   * Returns the HTML string for the feedback controls.
   * @param {number} interactionId - The ID to tag the buttons with.
   * @returns {string} The HTML string for the controls.
   *
   * Like/dislike: because even bots crave validation.
   */
  const createFeedbackControlsHTML = (interactionId) => `
        <div class="feedback-controls">
            <button class="${CONFIG.css.feedbackBtn}" title="Like" data-interaction-id="${interactionId}" data-feedback-type="like">
                <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </button>
            <button class="${CONFIG.css.feedbackBtn}" title="Dislike" data-interaction-id="${interactionId}" data-feedback-type="dislike">
                <svg viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm-3-13h3v7H7V2z"></path></svg>
            </button>
        </div>
    `;

  // --- EVENT LISTENERS & INITIALIZATION ---
  elements.widgetButton.addEventListener("click", toggleChatWindow);
  elements.chatForm.addEventListener("submit", handleSendMessage);
  elements.newConversationBtn.addEventListener("click", resetSession);
  elements.messageList.addEventListener("click", handleMessageListClick); // Event Delegation

  // --- Kick things off ---
  const initialize = () => {
    loadState();
    checkApiStatus();
    setInterval(checkApiStatus, CONFIG.statusCheckInterval);
  };

  initialize();
});
