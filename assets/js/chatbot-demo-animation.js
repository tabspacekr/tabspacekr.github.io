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

    // 다양한 시나리오 정의
    this.scenarios = this.getScenarios();

    // 랜덤하게 하나의 시나리오 선택
    this.messages = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];

    if (this.container) {
      this.init();
    }
  }

  /**
   * 다양한 대화 시나리오 정의
   * @returns {Array} 시나리오 배열
   */
  getScenarios() {
    return [
      // 시나리오 1: 기술 지원 요청
      [
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
      ],

      // 시나리오 2: 에너지 관리 시스템 문의
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace IoT 솔루션입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '오피스 빌딩의 전기료가 너무 높게 나와서요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '에너지 관리 시스템(EMS)이 도움이 될 것 같습니다. 현재 월 평균 전기료가 어느 정도이신가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '월 약 500만원 정도 나옵니다',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'IoT 기반 EMS 도입 시 실시간 전력 모니터링과 자동 제어로 20-30% 절감 가능합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '어떤 기능이 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '실시간 전력 모니터링, 스마트 조명/냉난방 자동 제어, 피크 시간대 부하 분산, 모바일 대시보드를 제공합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '투자 회수 기간은 얼마나 걸리나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '보통 18-24개월이면 투자금 회수가 가능합니다. 상세 ROI 분석은 ceo@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 3: CCTV 보안 시스템 문의
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 보안 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: 'IoT 기반 CCTV 시스템이 기존 CCTV와 어떻게 다른가요?',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'IoT CCTV는 AI 영상 분석, 실시간 알림, 원격 모니터링이 가능합니다. 어떤 시설에 설치하실 예정이신가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '상업 빌딩 주차장과 로비입니다',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '주차장과 로비라면 사람 감지, 차량 번호판 인식, 침입 탐지 AI 기능이 유용하겠네요.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '이상 상황 발생 시 자동으로 알림이 오나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 모바일 앱 푸시 알림, 이메일, SMS로 즉시 알림을 받을 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '기존 CCTV와 통합도 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '대부분의 기존 CCTV와 통합 가능합니다. 현장 조사를 통해 정확한 방안을 제시해드립니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 4: 스마트 조명 제어 문의
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace IoT 솔루션입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '사무실 조명을 스마트하게 제어하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 조명 제어 시스템에 관심 가져주셔서 감사합니다. 사무실 규모가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '100평 정도의 사무 공간입니다',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '자동 일정 제어, 조도 센서 기반 밝기 조절, 재실 감지 자동 제어를 제공합니다. 전기료 20% 이상 절감 가능합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '모바일로도 제어할 수 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 모바일 앱으로 언제 어디서나 조명을 제어하고 상태를 확인할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '설치는 어떻게 진행되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '기존 조명 활용 또는 신규 설치 모두 가능합니다. 전문 엔지니어가 현장 방문하여 설치를 진행합니다. 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ]
    ];
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
