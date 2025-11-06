/**
 * AI Chatbot UI Component
 * Floating chatbot interface for IoT inquiry and customer support
 * Features: Cyber-themed UI, Auto-responses, Quick reply buttons
 */

class ChatbotUI {
  constructor(config = {}) {
    this.config = {
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#5ff4ff',
      botName: config.botName || 'TabSpace AI',
      welcomeMessage: config.welcomeMessage || '안녕하세요! TabSpace IoT 솔루션에 관심 가져주셔서 감사합니다. 무엇을 도와드릴까요?',
      quickReplies: config.quickReplies || [
        '무인 매장 솔루션 문의',
        '상업 시설 IoT 문의',
        '견적 요청',
        '기술 지원'
      ],
      autoResponses: config.autoResponses || this.getDefaultResponses()
    };

    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  /**
   * Initialize chatbot UI
   */
  init() {
    this.injectStyles();
    this.createChatbotHTML();
    this.attachEventListeners();
    this.addWelcomeMessage();

    console.log('✓ AI Chatbot UI initialized');
  }

  /**
   * Inject chatbot styles
   */
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Chatbot Container */
      .chatbot-container {
        position: fixed;
        ${this.config.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : 'left: 20px; bottom: 20px;'}
        z-index: 10000;
        font-family: var(--cyber-font-primary, 'Manrope', sans-serif);
      }

      /* Floating Button */
      .chatbot-toggle-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--cyber-gradient-1, linear-gradient(135deg, #5ff4ff 0%, #0080ff 100%));
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(95, 244, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        animation: pulse-cyber 2s ease-in-out infinite;
      }

      .chatbot-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(95, 244, 255, 0.6);
      }

      .chatbot-toggle-btn svg {
        width: 28px;
        height: 28px;
        color: #0a0e27;
      }

      @keyframes pulse-cyber {
        0%, 100% { box-shadow: 0 4px 20px rgba(95, 244, 255, 0.4); }
        50% { box-shadow: 0 8px 40px rgba(95, 244, 255, 0.8); }
      }

      /* Chat Window */
      .chatbot-window {
        position: absolute;
        ${this.config.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        bottom: 75px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 550px;
        max-height: calc(100vh - 120px);
        background: var(--cyber-dark-card, #1a1f3a);
        border: 2px solid var(--cyber-cyan, #5ff4ff);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(95, 244, 255, 0.3);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      .chatbot-window.active {
        display: flex;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Chat Header */
      .chatbot-header {
        padding: 1rem;
        background: linear-gradient(135deg, var(--cyber-cyan, #5ff4ff) 0%, var(--cyber-electric-blue, #0080ff) 100%);
        color: #0a0e27;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--cyber-cyan, #5ff4ff);
      }

      .chatbot-header-title {
        font-weight: 700;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .chatbot-status {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #00ff88;
        animation: blink 1.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      .chatbot-close-btn {
        background: none;
        border: none;
        color: #0a0e27;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .chatbot-close-btn:hover {
        transform: scale(1.2);
      }

      /* Chat Messages */
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: var(--cyber-dark-bg, #0a0e27);
      }

      .chatbot-message {
        display: flex;
        gap: 0.5rem;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .chatbot-message.bot {
        align-self: flex-start;
      }

      .chatbot-message.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .chatbot-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--cyber-gradient-1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 10px rgba(95, 244, 255, 0.3);
      }

      .chatbot-avatar svg {
        width: 20px;
        height: 20px;
        color: #0a0e27;
      }

      .chatbot-message-content {
        max-width: 70%;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        word-wrap: break-word;
      }

      .chatbot-message.bot .chatbot-message-content {
        background: var(--cyber-dark-surface, #131829);
        border: 1px solid rgba(95, 244, 255, 0.3);
        color: #e0e6ed;
      }

      .chatbot-message.user .chatbot-message-content {
        background: var(--cyber-gradient-1);
        color: #0a0e27;
        font-weight: 500;
      }

      .chatbot-message-time {
        font-size: 0.7rem;
        color: #9499a3;
        margin-top: 0.25rem;
      }

      /* Quick Replies */
      .chatbot-quick-replies {
        padding: 0.5rem 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        border-top: 1px solid rgba(95, 244, 255, 0.2);
        background: var(--cyber-dark-surface, #131829);
      }

      .chatbot-quick-reply-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        background: transparent;
        color: var(--cyber-cyan, #5ff4ff);
        border: 1px solid var(--cyber-cyan, #5ff4ff);
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .chatbot-quick-reply-btn:hover {
        background: var(--cyber-gradient-1);
        color: #0a0e27;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(95, 244, 255, 0.3);
      }

      /* Input Area */
      .chatbot-input-area {
        padding: 1rem;
        background: var(--cyber-dark-surface, #131829);
        border-top: 2px solid rgba(95, 244, 255, 0.2);
        display: flex;
        gap: 0.5rem;
      }

      .chatbot-input {
        flex: 1;
        padding: 0.75rem 1rem;
        background: var(--cyber-dark-bg, #0a0e27);
        border: 1px solid rgba(95, 244, 255, 0.3);
        border-radius: 8px;
        color: #e0e6ed;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.3s;
      }

      .chatbot-input:focus {
        border-color: var(--cyber-cyan, #5ff4ff);
        box-shadow: 0 0 15px rgba(95, 244, 255, 0.3);
      }

      .chatbot-send-btn {
        padding: 0.75rem 1.25rem;
        background: var(--cyber-gradient-1);
        border: none;
        border-radius: 8px;
        color: #0a0e27;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .chatbot-send-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(95, 244, 255, 0.4);
      }

      .chatbot-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Typing Indicator */
      .chatbot-typing {
        display: flex;
        gap: 4px;
        padding: 0.75rem 1rem;
      }

      .chatbot-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--cyber-cyan, #5ff4ff);
        animation: typing 1.4s ease-in-out infinite;
      }

      .chatbot-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .chatbot-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
        30% { transform: translateY(-10px); opacity: 1; }
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .chatbot-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
        }

        .chatbot-quick-reply-btn {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create chatbot HTML structure
   */
  createChatbotHTML() {
    const container = document.createElement('div');
    container.className = 'chatbot-container';
    container.innerHTML = `
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <span class="chatbot-status"></span>
            ${this.config.botName}
          </div>
          <button class="chatbot-close-btn" id="chatbot-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages"></div>

        <div class="chatbot-quick-replies" id="chatbot-quick-replies">
          ${this.config.quickReplies.map((reply, index) => `
            <button class="chatbot-quick-reply-btn" data-reply="${reply}">${reply}</button>
          `).join('')}
        </div>

        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" id="chatbot-input" placeholder="메시지를 입력하세요..." />
          <button class="chatbot-send-btn" id="chatbot-send">전송</button>
        </div>
      </div>

      <button class="chatbot-toggle-btn" id="chatbot-toggle">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    `;

    document.body.appendChild(container);

    this.elements = {
      window: document.getElementById('chatbot-window'),
      messages: document.getElementById('chatbot-messages'),
      input: document.getElementById('chatbot-input'),
      sendBtn: document.getElementById('chatbot-send'),
      toggleBtn: document.getElementById('chatbot-toggle'),
      closeBtn: document.getElementById('chatbot-close'),
      quickReplies: document.getElementById('chatbot-quick-replies')
    };
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle chatbot
    this.elements.toggleBtn.addEventListener('click', () => this.toggle());
    this.elements.closeBtn.addEventListener('click', () => this.close());

    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Quick replies
    this.elements.quickReplies.querySelectorAll('.chatbot-quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reply = e.target.getAttribute('data-reply');
        this.handleQuickReply(reply);
      });
    });
  }

  /**
   * Add welcome message
   */
  addWelcomeMessage() {
    this.addBotMessage(this.config.welcomeMessage);
  }

  /**
   * Toggle chatbot visibility
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.elements.window.classList.toggle('active');

    if (this.isOpen) {
      this.elements.input.focus();
    }
  }

  /**
   * Close chatbot
   */
  close() {
    this.isOpen = false;
    this.elements.window.classList.remove('active');
  }

  /**
   * Send user message
   */
  sendMessage() {
    const text = this.elements.input.value.trim();
    if (!text) return;

    this.addUserMessage(text);
    this.elements.input.value = '';

    // Simulate bot response
    this.simulateBotResponse(text);
  }

  /**
   * Add user message to chat
   * @param {string} text - Message text
   */
  addUserMessage(text) {
    const message = {
      type: 'user',
      text: text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(message);
    this.renderMessage(message);
  }

  /**
   * Add bot message to chat
   * @param {string} text - Message text
   */
  addBotMessage(text) {
    const message = {
      type: 'bot',
      text: text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(message);
    this.renderMessage(message);
  }

  /**
   * Render message in chat
   * @param {Object} message - Message object
   */
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${message.type}`;

    const avatar = message.type === 'bot'
      ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>'
      : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';

    messageEl.innerHTML = `
      <div class="chatbot-avatar">${avatar}</div>
      <div>
        <div class="chatbot-message-content">${message.text}</div>
        <div class="chatbot-message-time">${message.time}</div>
      </div>
    `;

    this.elements.messages.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  showTyping() {
    const typing = document.createElement('div');
    typing.id = 'chatbot-typing-indicator';
    typing.className = 'chatbot-message bot';
    typing.innerHTML = `
      <div class="chatbot-avatar">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <div class="chatbot-message-content chatbot-typing">
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
      </div>
    `;

    this.elements.messages.appendChild(typing);
    this.scrollToBottom();
  }

  /**
   * Remove typing indicator
   */
  removeTyping() {
    const typing = document.getElementById('chatbot-typing-indicator');
    if (typing) typing.remove();
  }

  /**
   * Simulate bot response
   * @param {string} userMessage - User message
   */
  simulateBotResponse(userMessage) {
    this.showTyping();

    setTimeout(() => {
      this.removeTyping();

      const response = this.generateResponse(userMessage);
      this.addBotMessage(response);
    }, 1000 + Math.random() * 1000);
  }

  /**
   * Generate bot response based on user input
   * @param {string} input - User input
   * @returns {string} Bot response
   */
  generateResponse(input) {
    const lowerInput = input.toLowerCase();

    for (const [keywords, response] of Object.entries(this.config.autoResponses)) {
      const keywordList = keywords.split(',').map(k => k.trim());
      if (keywordList.some(keyword => lowerInput.includes(keyword))) {
        return response;
      }
    }

    return '문의해 주셔서 감사합니다. 담당자가 확인 후 상세한 답변을 드리겠습니다. 긴급한 문의는 070-7780-5577로 연락 주세요.';
  }

  /**
   * Handle quick reply button click
   * @param {string} reply - Quick reply text
   */
  handleQuickReply(reply) {
    this.addUserMessage(reply);
    this.simulateBotResponse(reply);
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  /**
   * Get default auto-responses
   * @returns {Object} Auto-response mappings
   */
  getDefaultResponses() {
    return {
      // 제품 및 솔루션 문의
      '무인매장,무인,매장': '무인 매장 IoT 솔루션에 관심 가져주셔서 감사합니다. 출입 관리, 결제 시스템, 재고 관리 등 통합 솔루션을 제공하고 있습니다. 견적 문의는 he086@tabspace.kr로 연락 주세요.',
      '상업시설,상업,시설,빌딩': '상업 시설 IoT 솔루션 문의 감사합니다. 에너지 관리, 보안 시스템, 환경 제어 등 맞춤형 솔루션을 제공합니다. 자세한 상담은 070-7780-5577로 연락 주세요.',
      'iot센서,센서,온도센서,습도센서': 'IoT 센서 솔루션에 관심 가져주셔서 감사합니다. 온도, 습도, 조도, 동작 감지 등 다양한 센서를 제공하며, 실시간 모니터링이 가능합니다. 상세 문의는 he086@tabspace.kr로 연락 주세요.',
      '스마트조명,조명,조명제어': '스마트 조명 제어 시스템 문의 감사합니다. 자동 일정 제어, 밝기 조절, 에너지 절감 기능을 제공합니다. 데모 요청은 070-7780-5577로 연락 주세요.',
      '에너지,전력,절감': '에너지 관리 시스템(EMS) 문의 감사합니다. 실시간 전력 모니터링, 소비 분석, 자동 제어로 최대 30% 에너지 절감이 가능합니다. 자세한 상담은 ceo@tabspace.kr로 연락 주세요.',
      'cctv,보안,감시,카메라': 'IoT 기반 CCTV 보안 시스템 문의 감사합니다. AI 영상 분석, 실시간 알림, 원격 모니터링 기능을 제공합니다. 견적 문의는 he086@tabspace.kr로 연락 주세요.',
      '재고,재고관리,창고': '스마트 재고 관리 시스템 문의 감사합니다. RFID/바코드 기반 실시간 재고 추적, 자동 발주 알림 기능을 제공합니다. 데모 요청은 070-7780-5577로 연락 주세요.',
      '결제,페이,결제시스템': '무인 결제 시스템 문의 감사합니다. QR코드, NFC, 카드 결제를 지원하며, PG사 연동도 가능합니다. 상세 문의는 he086@tabspace.kr로 연락 주세요.',

      // 기술 및 지원 문의
      '기술지원,지원,문제,오류': '기술 지원이 필요하신가요? ceo@tabspace.kr로 문의 주시거나 070-7780-5577로 연락 주세요. 신속하게 지원해드리겠습니다.',
      '원격,원격모니터링,모니터링': '원격 모니터링 시스템 문의 감사합니다. 실시간 데이터 조회, 알림 설정, 웹/모바일 대시보드를 제공합니다. 데모는 070-7780-5577로 문의 주세요.',
      'api,연동,integration': 'API 연동 문의 감사합니다. REST API를 통해 외부 시스템과 연동 가능하며, 기술 문서를 제공합니다. 개발자 문의는 ceo@tabspace.kr로 연락 주세요.',
      '설치,시공,공사': '설치 및 시공 문의 감사합니다. 전문 엔지니어가 현장 방문하여 설치를 진행하며, 사후 지원도 제공합니다. 일정 문의는 070-7780-5577로 연락 주세요.',
      '유지보수,as,보수': '유지보수 서비스 문의 감사합니다. 정기 점검, 장애 대응, 소프트웨어 업데이트를 포함한 유지보수 계약을 제공합니다. 상세 문의는 he086@tabspace.kr로 연락 주세요.',
      '긴급,urgent,emergency': '긴급 지원이 필요하신가요? 070-7780-5577로 즉시 연락 주시면 신속하게 대응하겠습니다. 24시간 긴급 지원 서비스를 운영하고 있습니다.',

      // 영업 및 상담 문의
      '견적,가격,비용': '견적 문의 감사합니다. 프로젝트 규모와 요구사항에 따라 맞춤 견적을 제공해드립니다. he086@tabspace.kr로 상세 내용을 보내주시면 검토 후 회신 드리겠습니다.',
      '데모,시연,테스트': '제품 데모 요청 감사합니다. 실제 작동하는 시스템을 직접 보실 수 있도록 현장 방문 데모를 제공합니다. 일정 조율은 070-7780-5577로 연락 주세요.',
      '상담,컨설팅,미팅': '상담 요청 감사합니다. IoT 전문가가 귀사의 요구사항을 분석하여 최적의 솔루션을 제안해드립니다. 상담 예약은 he086@tabspace.kr로 연락 주세요.',
      '포트폴리오,실적,사례': '포트폴리오 문의 감사합니다. 무인 매장, 오피스 빌딩, 상업 시설 등 다양한 구축 사례가 있습니다. 상세 자료는 he086@tabspace.kr로 요청해주세요.',
      '제안서,proposal': '제안서 요청 감사합니다. 프로젝트 개요를 he086@tabspace.kr로 보내주시면 맞춤형 제안서를 작성하여 보내드리겠습니다.',

      // 기타
      '안녕,hi,hello': '안녕하세요! TabSpace IoT 솔루션에 오신 것을 환영합니다. 무엇을 도와드릴까요?',
      '감사,고마워': '저희 서비스에 관심 가져주셔서 감사합니다. 언제든 문의해주세요!',
      '회사소개,회사,tabspace': 'TabSpace는 상업 시설 및 무인 매장을 위한 IoT 솔루션 전문 기업입니다. 센서, 제어, 모니터링 시스템을 통합 제공하며, 고객 맞춤형 서비스를 제공합니다. 상세 정보는 웹사이트를 참고해주세요.'
    };
  }
}

// Export for use
window.ChatbotUI = ChatbotUI;

console.log('✓ AI Chatbot UI module loaded');
