/**
 * Chatbot Demo Animation
 * 실제 채팅처럼 타이핑 효과와 함께 순차적으로 메시지를 표시
 * 스크롤 시 Intersection Observer로 자동 시작
 *
 * 대화 시나리오 31개는 data/chatbot-scenarios.json 에 있고, 카드가 화면에 다가올 때 한 번만 받는다.
 * 감속 모드(prefers-reduced-motion)에서는 타이핑 연출 없이 대화를 한 번에 보여준다.
 */

class ChatbotDemoAnimation {
  constructor() {
    this.container = document.getElementById('chatbot-demo-messages');
    this.hasPlayed = false;
    this.isPlaying = false;

    // 새로고침 버튼 참조
    this.refreshBtn = document.getElementById('chatbot-refresh-btn');
    this.refreshIcon = document.getElementById('chatbot-refresh-icon');

    this.reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 시나리오는 loadScenarios() 에서 채운다
    this.scenarios = [];
    this.messages = [];
    this.scenariosPromise = null;

    // 사용된 시나리오 인덱스 추적 (중복 방지)
    this.usedScenarioIndices = [];

    if (this.container) {
      this.init();
    }
  }

  /**
   * 초기화 - Intersection Observer 설정
   */
  init() {
    const demoCard = this.container.closest('.cyber-card') || this.container;
    if (!('IntersectionObserver' in window)) {
      this.loadScenarios().then(() => this.startAnimation());
      return;
    }

    // 카드가 화면 600px 이내로 오면 시나리오를 미리 받아 둔다
    this.preloadObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.preloadObserver.disconnect();
        this.loadScenarios();
      }
    }, { rootMargin: '600px 0px' });
    this.preloadObserver.observe(demoCard);

    // 카드가 절반 이상 보이면 재생
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasPlayed && !this.isPlaying) {
          this.loadScenarios().then(() => this.startAnimation());
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.5 });
    this.observer.observe(demoCard);
  }

  /**
   * 시나리오 JSON 을 한 번만 받아 첫 시나리오를 고른다
   * @returns {Promise}
   */
  loadScenarios() {
    if (!this.scenariosPromise) {
      this.scenariosPromise = fetch('./data/chatbot-scenarios.json')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(scenarios => {
          this.scenarios = scenarios;
          this.messages = this.scenarios[this.getNextScenarioIndex()];
        })
        .catch(error => {
          console.error('Chatbot scenarios load failed:', error);
          this.scenariosPromise = null;
        });
    }
    return this.scenariosPromise;
  }

  /**
   * 새로고침 버튼 상태 업데이트
   * @param {boolean} isAnimating - 애니메이션 진행 중 여부
   */
  updateRefreshButton(isAnimating) {
    if (!this.refreshBtn || !this.refreshIcon) return;

    if (isAnimating) {
      // 애니메이션 진행 중 - 버튼 비활성화 (회색)
      this.refreshBtn.disabled = true;
      this.refreshBtn.style.cursor = 'not-allowed';
      this.refreshIcon.style.color = '#9499a3'; // 회색
    } else {
      // 애니메이션 완료 - 버튼 활성화 (하늘색)
      this.refreshBtn.disabled = false;
      this.refreshBtn.style.cursor = 'pointer';
      this.refreshIcon.style.color = '#5ff4ff'; // 하늘색
    }
  }

  /**
   * 애니메이션 시작
   */
  async startAnimation() {
    if (this.isPlaying || !this.messages || this.messages.length === 0) return;

    this.isPlaying = true;
    this.hasPlayed = true;

    // 새로고침 버튼 비활성화
    this.updateRefreshButton(true);

    // 컨테이너 비우기
    this.container.innerHTML = '';

    try {
      for (let i = 0; i < this.messages.length; i++) {
        const message = this.messages[i];

        // AI 메시지인 경우 타이핑 인디케이터 표시
        if (message.type === 'ai' && message.typingDelay > 0 && !this.reduceMotion) {
          this.showTyping();
          await this.delay(message.typingDelay);
          this.removeTyping();
        }

        // 메시지 추가
        await this.addMessage(message);

        // 다음 메시지까지 대기
        if (i < this.messages.length - 1 && !this.reduceMotion) {
          await this.delay(message.delay);
        }
      }

      console.log('✓ Chatbot demo animation completed');
    } catch (error) {
      console.error('Chatbot animation error:', error);
    } finally {
      this.isPlaying = false;
      // 새로고침 버튼 활성화
      this.updateRefreshButton(false);
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
    if (!this.reduceMotion) await this.delay(50);
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
   * 다음 시나리오 인덱스 선택 (중복 방지)
   * @returns {number} 시나리오 인덱스
   */
  getNextScenarioIndex() {
    const totalScenarios = this.scenarios.length;

    // 모든 시나리오를 다 사용했으면 초기화
    if (this.usedScenarioIndices.length >= totalScenarios) {
      this.usedScenarioIndices = [];
      console.log('✓ All scenarios shown, resetting scenario pool');
    }

    // 아직 사용하지 않은 인덱스 찾기
    const availableIndices = [];
    for (let i = 0; i < totalScenarios; i++) {
      if (!this.usedScenarioIndices.includes(i)) {
        availableIndices.push(i);
      }
    }

    // 사용 가능한 인덱스 중 랜덤 선택
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // 사용된 인덱스 목록에 추가
    this.usedScenarioIndices.push(selectedIndex);

    console.log(`✓ Selected scenario ${selectedIndex + 1}/${totalScenarios}, Remaining: ${totalScenarios - this.usedScenarioIndices.length}`);

    return selectedIndex;
  }

  /**
   * 새로고침 - 새로운 랜덤 시나리오로 다시 시작 (중복 방지)
   */
  async refresh() {
    // 현재 진행 중이면 중단
    if (this.isPlaying) {
      return;
    }

    await this.loadScenarios();
    if (this.scenarios.length === 0) return;

    // 중복되지 않는 새로운 시나리오 선택
    const scenarioIndex = this.getNextScenarioIndex();
    this.messages = this.scenarios[scenarioIndex];

    // 리셋 후 애니메이션 시작
    this.reset();
    await this.startAnimation();

    console.log('✓ Chatbot demo refreshed with new scenario');
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
function initChatbotDemo() {
  try {
    window.chatbotDemoInstance = new ChatbotDemoAnimation();
  } catch (error) {
    console.error('Failed to initialize Chatbot Demo Animation:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbotDemo);
} else {
  initChatbotDemo();
}
