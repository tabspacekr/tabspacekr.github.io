/**
 * Chatbot Demo Animation
 * 실제 채팅처럼 타이핑 효과와 함께 순차적으로 메시지를 표시
 * 스크롤 시 Intersection Observer로 자동 시작
 */

class ChatbotDemoAnimation {
  constructor() {
    this.container = document.getElementById('chatbot-demo-messages');
    this.hasPlayed = false;
    this.isPlaying = false;

    // 기술 지원 요청 시나리오 메시지 (8개)
    this.messages = [
      {
        type: 'ai',
        text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
        delay: 800,
        typingDelay: 1000
      },
      {
        type: 'user',
        text: '출입 게이트 디바이스가 작동하지 않아요',
        delay: 1200,
        typingDelay: 0
      },
      {
        type: 'ai',
        text: '출입 게이트 문제를 확인하겠습니다. 어떤 증상인가요?',
        delay: 1000,
        typingDelay: 1200
      },
      {
        type: 'user',
        text: '카드를 인식하지 못하고 빨간불이 계속 켜져있어요',
        delay: 1500,
        typingDelay: 0
      },
      {
        type: 'ai',
        text: '디바이스 상태를 원격으로 확인하겠습니다... 잠시만 기다려 주세요.',
        delay: 1000,
        typingDelay: 1500
      },
      {
        type: 'ai',
        text: '센서 연결이 끊어진 것으로 확인됩니다. 디바이스 재부팅을 시도해주세요.',
        delay: 1200,
        typingDelay: 1300
      },
      {
        type: 'user',
        text: '재부팅 후 정상 작동합니다! 감사합니다 😊',
        delay: 1000,
        typingDelay: 0
      },
      {
        type: 'ai',
        text: '해결되어 다행입니다! 추가 문제 발생 시 언제든 070-7780-5577로 연락 주세요.',
        delay: 800,
        typingDelay: 1200
      }
    ];

    if (this.container) {
      this.init();
    }
  }

  /**
   * 초기화 - Intersection Observer 설정
   */
  init() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // 섹션이 50% 보이면 트리거
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasPlayed && !this.isPlaying) {
          this.startAnimation();
        }
      });
    }, observerOptions);

    // 챗봇 데모 카드 전체를 관찰
    const demoCard = this.container.closest('.cyber-card');
    if (demoCard) {
      this.observer.observe(demoCard);
    }

    console.log('✓ Chatbot Demo Animation initialized');
  }

  /**
   * 애니메이션 시작
   */
  async startAnimation() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.hasPlayed = true;

    // 컨테이너 비우기
    this.container.innerHTML = '';

    try {
      for (let i = 0; i < this.messages.length; i++) {
        const message = this.messages[i];

        // AI 메시지인 경우 타이핑 인디케이터 표시
        if (message.type === 'ai' && message.typingDelay > 0) {
          this.showTyping();
          await this.delay(message.typingDelay);
          this.removeTyping();
        }

        // 메시지 추가
        await this.addMessage(message);

        // 다음 메시지까지 대기
        if (i < this.messages.length - 1) {
          await this.delay(message.delay);
        }
      }

      console.log('✓ Chatbot demo animation completed');
    } catch (error) {
      console.error('Chatbot animation error:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  /**
   * 타이핑 인디케이터 표시
   */
  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-demo-typing';
    typingDiv.id = 'chatbot-typing-indicator';

    typingDiv.innerHTML = `
      <div class="d-flex align-items-start mb-2">
        <div class="cyber-avatar me-2" style="width: 32px; height: 32px; font-size: 0.8rem; background: linear-gradient(135deg, #5ff4ff 0%, #0080ff 100%); color: #0a0e27; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold;">AI</div>
        <div class="chatbot-typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.container.appendChild(typingDiv);
    this.scrollToBottom();
  }

  /**
   * 타이핑 인디케이터 제거
   */
  removeTyping() {
    const typing = document.getElementById('chatbot-typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  /**
   * 메시지 추가
   */
  async addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-demo-message';

    if (message.type === 'ai') {
      // AI 메시지
      messageDiv.innerHTML = `
        <div class="d-flex align-items-start mb-2">
          <div class="cyber-avatar me-2" style="width: 32px; height: 32px; font-size: 0.8rem; background: linear-gradient(135deg, #5ff4ff 0%, #0080ff 100%); color: #0a0e27; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold;">AI</div>
          <div class="cyber-bg-dark-card p-2 rounded chatbot-demo-ai-bubble" style="border: 1px solid rgba(95, 244, 255, 0.3); max-width: 80%;">
            <small style="color: #e0e6ed;">${message.text}</small>
          </div>
        </div>
      `;
    } else {
      // 사용자 메시지
      messageDiv.innerHTML = `
        <div class="d-flex align-items-start justify-content-end mb-2">
          <div class="p-2 rounded text-dark chatbot-demo-user-bubble" style="background: linear-gradient(135deg, #5ff4ff 0%, #00ff88 100%); max-width: 80%;">
            <small><strong>${message.text}</strong></small>
          </div>
        </div>
      `;
    }

    this.container.appendChild(messageDiv);
    this.scrollToBottom();

    // 페이드인 애니메이션을 위한 짧은 딜레이
    await this.delay(50);
  }

  /**
   * 컨테이너를 맨 아래로 스크롤
   */
  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  /**
   * 딜레이 유틸리티
   * @param {number} ms - 밀리초
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 리셋 (재생을 위한)
   */
  reset() {
    this.hasPlayed = false;
    this.isPlaying = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 정리
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.container = null;
  }
}

// 전역 인스턴스
window.ChatbotDemoAnimation = ChatbotDemoAnimation;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  try {
    const chatbotDemo = new ChatbotDemoAnimation();
    window.chatbotDemoInstance = chatbotDemo;
    console.log('✓ Chatbot Demo Animation loaded');
  } catch (error) {
    console.error('Failed to initialize Chatbot Demo Animation:', error);
  }
});
