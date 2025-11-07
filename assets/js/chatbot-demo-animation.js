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

    // 사용된 시나리오 인덱스 추적 (중복 방지)
    this.usedScenarioIndices = [];

    // 랜덤하게 하나의 시나리오 선택 (중복 방지)
    const scenarioIndex = this.getNextScenarioIndex();
    this.messages = this.scenarios[scenarioIndex];

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
          text: '보통 18-24개월이면 투자금 회수가 가능합니다. 상세 ROI 분석은 he086@tabspace.kr로 문의 주세요.',
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
      ],

      // 시나리오 5: CCTV 카메라 영상 끊김 장애
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: 'CCTV 카메라 영상이 자꾸 끊기는데 확인 부탁드려요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'CCTV 카메라 영상 끊김 증상을 확인하겠습니다. 몇 번 카메라인가요? 다른 장비를 추가하신 적 있나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '주차장 3번 카메라요. 어제 새 도어락 설치 후부터 끊겼다 연결돼요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '원격으로 3번 카메라 상태를 확인 중입니다... 네트워크 IP 주소 할당 상태를 점검하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '네트워크에서 IP 주소 충돌이 감지됩니다. 카메라에 새로운 고정 IP를 할당했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '이제 영상이 안정적으로 나오네요! 빠른 해결 감사합니다',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '문제가 해결되어 다행입니다. 모든 IoT 장비는 고정 IP로 관리되어 안정적입니다. 추가 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 6: 온도/습도 센서 통신 장애
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '창고 온습도 센서 데이터가 업데이트되지 않아요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온습도 센서 통신 문제를 확인하겠습니다. 마지막 데이터 수신이 언제였나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '어제 오후 3시가 마지막이에요. 그 이후로 멈춰있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해당 센서의 통신 로그를 확인 중입니다... 센서 배터리 잔량과 게이트웨이 연결 상태를 점검하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '게이트웨이와 센서 간 연결이 끊어졌습니다. 게이트웨이를 원격으로 재시작했으니 센서가 자동으로 재연결됩니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '데이터가 다시 들어오기 시작했습니다! 감사합니다 👍',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해결되어 다행입니다. 센서 상태는 대시보드에서 실시간으로 확인하실 수 있습니다. 추가 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 7: 스마트 조명 자동 제어 오작동
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '사무실 조명이 계속 껐다 켜졌다를 반복해요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '조명 제어 이상 증상을 확인하겠습니다. 특정 구역만 그런가요, 아니면 전체 구역인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '회의실 B 구역만 그래요. 1-2분마다 반복됩니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '회의실 B 구역 조명 제어 로그를 확인 중입니다... 재실 감지 센서 상태를 점검하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '재실 센서가 오작동하여 계속 사람 감지를 반복하고 있습니다. 센서 민감도를 조정하고 펌웨어를 업데이트했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '조명이 이제 정상적으로 작동하네요. 빠른 조치 감사합니다!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '문제가 해결되어 다행입니다. 조명 일정 및 센서 설정은 모바일 앱에서 조정 가능합니다. 추가 문의는 he086@tabspace.kr로 연락 주세요.',
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
document.addEventListener('DOMContentLoaded', () => {
  try {
    const chatbotDemo = new ChatbotDemoAnimation();
    window.chatbotDemoInstance = chatbotDemo;
    console.log('✓ Chatbot Demo Animation loaded');
  } catch (error) {
    console.error('Failed to initialize Chatbot Demo Animation:', error);
  }
});
