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
      ],

      // 시나리오 8: 쇼핑몰 실시간 방문객 수 집계
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace IoT 솔루션입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '쇼핑몰 매장별 실시간 방문객 수를 집계하고 싶은데 가능한가요?',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '카운터 센서 기반 방문객 카운팅 시스템으로 가능합니다. 쇼핑몰 규모가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '지하 1층부터 지상 5층까지 약 150개 매장이 있습니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '각 매장 입구에 카운터 센서를 설치하여 실시간 방문객 수, 체류시간, 동선 분석이 가능합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '시간대별, 요일별 통계도 볼 수 있나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 대시보드에서 시간대별/요일별/월별 통계, 히트맵, 매출 연계 분석을 실시간으로 확인하실 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '개인정보 보호는 어떻게 되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '센서 방식으로 사람 수만 카운팅하여 개인정보 이슈가 없습니다. 상세 상담은 he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 9: 매장 냉장/냉동 설비 온도 관리
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace IoT 솔루션입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '편의점 냉장고와 냉동고 온도를 실시간으로 관리하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온도 모니터링 IoT 센서 솔루션이 적합하겠습니다. 몇 대의 냉장/냉동 설비를 관리하시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '냉장고 5대, 냉동고 3대입니다. 밤에도 온도 확인이 필요해요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '각 설비에 무선 온도 센서를 부착하여 24시간 자동으로 온도를 기록하고 모니터링합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '온도가 이상하면 알림이 오나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 설정한 임계값을 초과하면 모바일 앱 푸시, 문자, 이메일로 즉시 알림을 받아 제품 손실을 방지할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '고장 예측도 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온도 변화 패턴을 분석하여 설비 이상 징후를 사전에 감지합니다. 상세 상담은 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 10: 음식점 주방 환경 모니터링
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 안전 관리 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '레스토랑 주방의 온도, 습도, 가스 누출을 실시간으로 모니터링하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '주방 환경 통합 모니터링 시스템이 적합합니다. 주방 면적과 가스 사용 설비가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '주방 면적은 약 30평이고 가스레인지 4구, 오븐 2대 사용합니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온습도 센서와 가스 감지 센서를 설치하여 실시간으로 주방 환경을 모니터링하고 안전 기록을 자동 생성합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '가스 누출 시 자동으로 알림이 오나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 가스 감지 즉시 모바일 알림과 현장 경보음이 울리며, 선택적으로 자동 차단 시스템 연동도 가능합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '온습도 기록도 자동으로 저장되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '모든 환경 데이터가 클라우드에 자동 저장되어 언제든 조회 및 리포트 출력이 가능합니다. 상세 상담은 he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 11: 출입 게이트 시스템 정전 복구 후 재시작 문제
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '어제 정전 이후 출입 게이트가 제대로 작동하지 않아요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '정전 복구 후 출입 게이트 문제를 확인하겠습니다. 어떤 증상인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '일부 게이트만 작동하고 나머지는 응답이 없어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '정전 후 시스템 상태를 원격으로 점검 중입니다... 게이트 컨트롤러 재시작 상태를 확인하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '3대의 게이트 컨트롤러가 부팅 시퀀스를 완료하지 못했습니다. 원격으로 강제 재부팅과 펌웨어 체크를 진행합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '이제 모든 게이트가 정상 작동하네요. 빠른 대응 감사합니다!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해결되어 다행입니다. 정전 대비 UPS 설치를 권장드립니다. 추가 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 12: 냉난방 제어 시스템 센서 오류
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '사무실 냉난방이 설정 온도를 무시하고 계속 가동돼요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '냉난방 제어 시스템 오작동을 확인하겠습니다. 설정 온도는 몇 도이고 현재 실내 온도는 어떻게 표시되나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '22도로 설정했는데 현재 온도가 27도로 표시되고 냉방이 멈추지 않아요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온도 센서 값을 원격으로 확인 중입니다... 센서 캘리브레이션 데이터를 점검하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '온도 센서가 실제 온도를 잘못 읽고 있습니다. 센서 캘리브레이션을 재설정하고 정확도를 조정했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '온도가 정확하게 표시되고 냉방도 정상적으로 제어되네요!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '문제가 해결되어 다행입니다. 센서는 6개월마다 자동 캘리브레이션됩니다. 추가 문의는 he086@tabspace.kr로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 13: 실시간 재고 데이터 동기화 장애
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '무인 매장 재고 데이터가 실시간으로 업데이트되지 않아요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '재고 데이터 동기화 문제를 확인하겠습니다. 마지막 동기화가 언제였나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '오늘 오전 9시 이후로 재고가 전혀 변하지 않아요. 판매는 계속 되고 있는데요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '재고 관리 시스템 통신 로그를 확인 중입니다... 데이터베이스 연결 상태와 RFID 리더기를 점검하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '데이터베이스 연결 풀이 고갈되어 새로운 데이터를 받지 못했습니다. 연결 풀을 초기화하고 대기 중인 데이터를 동기화했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '실시간 재고가 다시 정확하게 표시됩니다. 감사합니다!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해결되어 다행입니다. 시스템 모니터링을 강화했으니 동일 문제 재발 시 자동으로 복구됩니다. 추가 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 14: 주차 관리 시스템 문의
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 주차 관리 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '상업 빌딩 주차장 관리를 자동화하고 싶은데 가능한가요?',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 주차 관리 시스템으로 가능합니다. 주차 면수와 출입구가 몇 개인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '지하 3층까지 총 250면이고 출입구는 2개입니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '번호판 인식 출입, 실시간 주차 현황 표시, 모바일 정기권 관리, 무인 정산 시스템을 제공합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '빈자리 안내도 가능한가요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 각 층별 주차 센서로 실시간 빈자리를 감지하고 안내 전광판과 모바일 앱에 표시합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '기존 차단기와 통합 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '대부분의 기존 차단기와 통합 가능합니다. 현장 조사 후 상세 제안서를 드립니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 15: 스마트 빌딩 공기질 모니터링
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 환경 관리 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '오피스 빌딩 실내 공기질을 관리하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '공기질 모니터링 IoT 시스템이 적합합니다. 빌딩 규모와 층수가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '지상 10층 빌딩에 층마다 회사가 2-3개씩 입주해 있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'CO2, 미세먼지, 온습도, VOC를 실시간 측정하고 환기 시스템과 자동 연동됩니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '공기질이 나쁠 때 자동으로 환기되나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 설정 기준치 초과 시 환기 시스템이 자동으로 작동하며, 관리자에게 알림도 전송됩니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '입주사별로 데이터를 볼 수 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '층별, 구역별로 데이터를 분리하여 각 입주사에 대시보드를 제공합니다. 상세 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 16: 무인 카페 원두 자동 발주 시스템
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 무인 매장 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '무인 카페를 운영 중인데 원두 재고 관리가 어려워요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 재고 관리 시스템으로 자동 발주가 가능합니다. 카페 규모와 하루 판매량이 어느 정도인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '커피 머신 4대 운영 중이고 하루 평균 200잔 판매돼요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '원두통에 무게 센서를 설치하여 실시간 재고를 파악하고, 설정 수량 이하 시 자동으로 발주 알림을 보냅니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '시럽이나 우유도 관리되나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 모든 소모품에 센서를 부착하여 통합 관리하고, 발주 시기를 예측해 알려드립니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '판매 데이터와 연동되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'POS 시스템과 연동하여 판매 패턴을 분석하고 최적의 발주 타이밍을 제안합니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 17: 헬스장 출입 및 락커 관리
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 스마트 시설 관리팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '헬스장 회원 출입과 락커를 스마트하게 관리하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 출입 및 락커 시스템이 적합합니다. 회원 수와 락커 개수가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '등록 회원 500명 정도이고 락커는 200개 있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '모바일 앱 또는 카드로 출입하고, QR코드나 PIN으로 락커를 이용할 수 있습니다. 실시간 사용 현황 파악도 가능합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '회원권 만료 시 자동 차단되나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 회원 관리 시스템과 연동하여 만료 시 자동으로 출입이 제한되며, 사전 알림도 발송됩니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '락커 이용 통계도 볼 수 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '시간대별 락커 사용률, 회원 출입 패턴 등 다양한 통계를 대시보드에서 확인 가능합니다. 070-7780-5577로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 18: 호텔 스마트룸 제어 시스템
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 호스피탈리티 IoT 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '부티크 호텔에 스마트룸 시스템을 도입하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '호텔 스마트룸 IoT 솔루션에 관심 가져주셔서 감사합니다. 객실 수가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '총 50개 객실이고 프리미엄 경험을 제공하고 싶어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '모바일 키, 조명/온도 자동 제어, 커튼 자동화, 음성 제어를 통합 제공합니다. 투숙객 취향에 맞춘 맞춤 설정도 가능합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '에너지 절감 효과도 있나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '재실 감지로 빈 객실의 냉난방을 자동 조절하여 에너지를 20-30% 절감할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '기존 PMS와 연동 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '대부분의 호텔 PMS와 API 연동 가능합니다. 체크인/아웃 자동화도 지원합니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 19: 무인 세탁소 기계 상태 모니터링
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace IoT 모니터링팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '무인 세탁소 세탁기와 건조기 상태를 원격으로 확인하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '세탁 설비 모니터링 시스템이 적합합니다. 설비가 몇 대 있으신가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '세탁기 8대, 건조기 6대 운영 중입니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '각 기계에 IoT 센서를 부착하여 가동 상태, 온도, 진동, 전력 소비를 실시간으로 모니터링합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '고장 전에 미리 알 수 있나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 진동 패턴과 소비 전력을 분석하여 고장 징후를 조기에 감지하고 알림을 보냅니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '가동 시간과 매출 연계도 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '기계별 가동률, 매출, 수익성 분석 리포트를 제공합니다. 데모 요청은 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 20: 수영장 수질 자동 관리 시스템
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 시설 자동화팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '수영장 수질을 자동으로 관리하고 싶은데 가능한가요?',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 수질 관리 시스템으로 가능합니다. 수영장 규모와 이용 인원이 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '25m 레인 6개 규모이고 하루 평균 100명 이용해요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: 'pH, 염소, 온도, 탁도를 실시간 측정하고 자동으로 약품을 투입하여 최적 수질을 유지합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '수질 기록도 자동으로 저장되나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 모든 측정 데이터가 클라우드에 저장되어 관리 기록부가 자동 생성되며, 보건소 점검에도 활용 가능합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '이상 수질 발생 시 알림이 오나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '기준치 이탈 시 즉시 모바일 알림을 보내며, 긴급 상황 시 자동 대응합니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 21: 사무실 회의실 예약 및 재실 감지
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 스마트 오피스 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '회의실 예약은 했는데 실제로 사용 안 하는 경우가 많아요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 회의실 관리 시스템이 문제를 해결해드립니다. 회의실이 몇 개 있으신가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '10개 회의실이 있고 예약률이 높아요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '재실 센서로 실제 사용 여부를 감지하고, 노쇼 발생 시 15분 후 자동으로 예약을 취소하여 다른 직원이 사용할 수 있게 합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '회의실 사용 통계도 볼 수 있나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 회의실별 가동률, 노쇼율, 인기 시간대 등 상세 통계를 제공하여 공간 효율을 최적화할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '디스플레이에 예약 현황이 표시되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '각 회의실 입구에 태블릿을 설치하여 예약 현황과 즉석 예약이 가능합니다. 070-7780-5577로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 22: 물류창고 온습도 자동 제어
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 물류 IoT 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '물류창고에 온습도 관리가 필요한 제품들이 많아요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '창고 환경 자동 제어 시스템이 적합합니다. 창고 면적과 보관 제품 종류가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '500평 규모이고 식품, 화장품, 의약품을 보관해요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '구역별로 온습도 센서를 설치하고 제품 특성에 맞게 냉난방과 제습기를 자동 제어합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '여름철 습도 관리가 특히 어려운데 도움이 될까요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 습도 임계치 설정 시 자동으로 제습기를 가동하고, 외기 습도와 비교하여 환기 타이밍도 최적화합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '제품별 보관 이력도 관리되나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '구역별 온습도 기록이 자동 저장되어 제품 보관 이력 관리와 품질 보증에 활용 가능합니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 23: 스마트 팜 환경 제어
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 스마트팜 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '스마트팜 환경을 자동으로 제어하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '농업 IoT 환경 제어 시스템이 적합합니다. 재배 작물과 재배 면적이 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '500평 온실에서 토마토와 파프리카를 재배합니다',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '온습도, CO2, 조도, 토양 수분을 실시간 측정하고 환기, 관수, 보광등을 자동 제어합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '작물별로 다른 환경 설정이 가능한가요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 작물 성장 단계별로 최적 환경을 사전 설정하고, 구역별로 다른 제어 전략을 적용할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '외부에서도 확인하고 제어할 수 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '모바일 앱으로 언제 어디서나 환경 데이터 확인과 원격 제어가 가능합니다. 070-7780-5577로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 24: 매장 방범 알람 오작동 (기술 지원)
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '매장 방범 센서가 자꾸 오작동으로 알람이 울려요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '방범 센서 오작동을 확인하겠습니다. 어떤 상황에서 알람이 울리나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '새벽에 아무도 없는데 자주 울려요. 창문 쪽 센서 같아요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '센서 로그를 원격으로 확인 중입니다... 창문 쪽 센서의 감지 이력을 분석하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '창문 근처 난방기로 인한 온도 변화로 적외선 센서가 오작동하고 있습니다. 센서 민감도와 위치를 조정했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '오늘 밤 테스트해보고 연락드릴게요. 빠른 대응 감사합니다!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '문제가 지속되면 070-7780-5577로 연락 주세요. 필요 시 센서 교체도 가능합니다.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 26: 무인 택배함 알림 시스템 오류 (기술 지원)
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '무인 택배함에 택배가 들어와도 알림이 안 와요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '택배함 알림 문제를 확인하겠습니다. 어느 위치의 택배함인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '아파트 1단지 A동 택배함이요. 어제부터 알림이 안 와요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해당 택배함 시스템 상태를 원격으로 점검 중입니다... 알림 서버 연결과 센서 작동을 확인하겠습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '알림 서버와의 통신은 정상이나 SMS 발송 모듈에 오류가 있었습니다. 모듈을 재시작하고 대기 중인 알림을 발송했습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '밀려있던 알림이 한꺼번에 왔어요! 감사합니다',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '해결되어 다행입니다. 시스템 모니터링을 강화하여 재발을 방지하겠습니다. 추가 문의는 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 27: 공유 오피스 스마트 락 배터리 교체 (기술 지원)
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 기술 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '공유 오피스 스마트 락 배터리 경고가 떠요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 락 배터리 상태를 확인하겠습니다. 몇 번 룸인가요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '3층 305호입니다. 배터리 잔량이 10% 미만이라고 나와요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '305호 스마트 락 배터리 상태를 확인했습니다. 배터리 교체가 필요합니다. 교체용 배터리를 보유하고 계신가요?',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'user',
          text: '예비 배터리가 있어요. 교체 방법을 알려주세요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '도어락 하단 커버를 열고 기존 배터리 4개를 빼낸 후 새 배터리를 넣으면 됩니다. 교체 후 "*" 버튼을 3초 눌러 초기화해주세요.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '교체 완료했고 정상 작동하네요. 감사합니다!',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '배터리 수명은 약 6개월입니다. 다음 교체 시기 2주 전에 미리 알림을 보내드립니다. 추가 문의는 he086@tabspace.kr로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 28: 수도 누수 감지 센서 알림 (기술 지원)
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 긴급 지원팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '누수 감지 센서에서 알림이 왔는데 어떻게 해야 하나요?',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '누수 알림을 확인하겠습니다. 어느 위치의 센서에서 감지되었나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '화장실 세면대 아래 센서에서 알림이 왔어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '즉시 해당 구역 수도 밸브를 잠그세요. 센서 데이터를 확인 중입니다... 수분 감지 수치가 높습니다.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'user',
          text: '밸브를 잠갔어요. 배수관 연결 부위에서 물이 새고 있었어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '조기에 발견하셔서 큰 피해를 막으셨습니다. 전문 배관 업체 방문이 필요합니다. 연계 업체를 소개해드릴까요?',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '네, 부탁드려요. 빨리 수리해야 할 것 같아요',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '협력 배관 업체 연락처를 문자로 보내드렸습니다. 긴급 출동 가능하다고 합니다. 추가 지원은 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 29: 화재 감지 센서 오작동 (기술 지원)
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 안전 관리팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '주방 화재 감지 센서가 요리할 때마다 울려요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '화재 감지 센서 오작동을 확인하겠습니다. 어떤 요리를 할 때 주로 작동하나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '고기를 구울 때 연기가 조금만 나도 알람이 울려요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '센서 민감도를 원격으로 확인 중입니다... 주방용 센서는 조리 연기를 구분해야 하는데 설정이 높게 되어 있네요.',
          delay: 1000,
          typingDelay: 1500
        },
        {
          type: 'ai',
          text: '주방 환경에 맞게 센서 민감도를 조정하고 급격한 온도 변화 패턴도 학습시켰습니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '이제 요리해도 오작동 안 하나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '일반 조리 시에는 작동하지 않고, 실제 화재 시에만 알람이 울립니다. 테스트 후 이상 있으면 070-7780-5577로 연락 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 30: 쇼핑몰 공용 화장실 이용 현황 모니터링
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 스마트 시설 관리팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '쇼핑몰 화장실 청소 주기를 최적화하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 화장실 관리 시스템이 적합합니다. 층수와 화장실 개수가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '지하 1층부터 지상 5층까지 각 층에 남녀 화장실이 있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '칸별 사용 감지 센서와 악취 센서를 설치하여 실시간 이용 현황과 청소 필요 여부를 모니터링합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '고객들도 빈자리를 확인할 수 있나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 화장실 입구 디스플레이에 칸별 사용 현황을 표시하고, 쇼핑몰 앱에서도 확인 가능합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '청소 직원에게 알림도 가나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '사용 횟수나 악취 수준 기준 초과 시 청소 직원 앱으로 알림을 보냅니다. 청소 이력 관리도 자동화됩니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 32: 공장 설비 가동률 및 예방 점검
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 산업 IoT 솔루션팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '공장 생산 설비의 가동률과 고장을 미리 예측하고 싶어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '예지 정비 IoT 시스템이 적합합니다. 생산 라인과 주요 설비가 어떻게 구성되어 있나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '3개 생산 라인에 주요 설비 20대가 있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '각 설비에 진동, 온도, 전류 센서를 부착하여 실시간 상태를 모니터링하고 AI로 고장 징후를 사전에 감지합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '예방 점검 시기도 알려주나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 가동 시간과 부하를 분석하여 최적의 점검 시기를 제안하고, 부품 교체 주기도 예측합니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '라인별 가동률 통계도 볼 수 있나요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '라인별, 설비별 가동률, 비가동 사유, OEE 지표를 실시간 대시보드로 제공합니다. he086@tabspace.kr로 문의 주세요.',
          delay: 800,
          typingDelay: 1200
        }
      ],

      // 시나리오 33: 지능형 엘리베이터 대기 시간 최적화
      [
        {
          type: 'ai',
          text: '안녕하세요! TabSpace 빌딩 자동화팀입니다. 무엇을 도와드릴까요?',
          delay: 800,
          typingDelay: 1000
        },
        {
          type: 'user',
          text: '출퇴근 시간대 엘리베이터 대기가 너무 길어요',
          delay: 1200,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '스마트 엘리베이터 운행 최적화 시스템이 도움이 될 것 같습니다. 빌딩 층수와 엘리베이터 대수가 어떻게 되시나요?',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '20층 빌딩에 엘리베이터 4대가 있어요',
          delay: 1500,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '승객 패턴을 AI로 분석하여 피크 시간대 엘리베이터를 최적 배치하고, 층별 대기 인원에 따라 동적으로 운행합니다.',
          delay: 1200,
          typingDelay: 1300
        },
        {
          type: 'user',
          text: '출근 시간에는 1층에서 위로만 올라가나요?',
          delay: 1000,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '네! 오전 피크 시간에는 일부 엘리베이터를 상향 전용으로 운행하여 대기 시간을 50% 이상 단축할 수 있습니다.',
          delay: 1000,
          typingDelay: 1200
        },
        {
          type: 'user',
          text: '기존 엘리베이터에 적용 가능한가요?',
          delay: 800,
          typingDelay: 0
        },
        {
          type: 'ai',
          text: '대부분의 엘리베이터 제어 시스템과 연동 가능합니다. 제조사 확인 후 제안서를 드립니다. 070-7780-5577로 문의 주세요.',
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
