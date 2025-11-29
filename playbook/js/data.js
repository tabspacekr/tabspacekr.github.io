// Character Data
const CHARACTERS = [
  {
    id: 'roy',
    name: '로이',
    emoji: '🚒',
    type: '소방차',
    color: '#E53935',
    descriptions: [
      '나는 빨간색이에요!\n불이 나면 출동해요!',
      '뿡뿡! 물을 뿌려서 불을 꺼요!',
      '사이렌을 울리며 달려가요!\n위이잉~ 위이잉~',
      '용감한 소방차예요!\n친구들을 구해줘요.'
    ]
  },
  {
    id: 'amber',
    name: '앰버',
    emoji: '🚑',
    type: '구급차',
    color: '#FF9800',
    descriptions: [
      '나는 하얀색이에요!\n아픈 친구를 도와줘요.',
      '삐뽀삐뽀! 병원에 가요!',
      '다친 친구를 치료해줘요!\n걱정 마세요~',
      '응급 상황에 출동해요!\n빠르게 달려가요.'
    ]
  },
  {
    id: 'heli',
    name: '헬리',
    emoji: '🚁',
    type: '헬리콥터',
    color: '#FF5722',
    descriptions: [
      '나는 하늘을 날아요!\n프로펠러가 돌아가요.',
      '위잉위잉~ 높이 날아요!',
      '하늘에서 친구들을 찾아요!\n멀리까지 볼 수 있어요.',
      '높은 곳에서 구조해요!\n내려다보면 다 보여요.'
    ]
  },
  {
    id: 'poli',
    name: '폴리',
    emoji: '🚔',
    type: '경찰차',
    color: '#1E88E5',
    descriptions: [
      '나는 파란색이에요!\n마을을 지켜요.',
      '삐용삐용! 경찰차 나가요!',
      '교통 정리를 도와줘요!\n안전하게 건너요~',
      '나쁜 사람을 잡아요!\n우리 마을을 지켜요.'
    ]
  },
  {
    id: 'schoolb',
    name: '스쿨비',
    emoji: '🚌',
    type: '버스',
    color: '#FFC107',
    descriptions: [
      '나는 노란색이에요!\n친구들을 태워요.',
      '빵빵! 학교에 가요!',
      '어린이 친구들을 태워요!\n안전하게 데려다줘요.',
      '노란 버스를 타세요!\n학교 갈 시간이에요~'
    ]
  },
  {
    id: 'marine',
    name: '마린',
    emoji: '🚤',
    type: '보트',
    color: '#00BCD4',
    descriptions: [
      '나는 바다에서 달려요!\n물 위를 쌩쌩~',
      '첨벙첨벙! 파도를 넘어요!',
      '바다에서 친구를 구해요!\n수영 못해도 괜찮아요.',
      '물 위의 영웅이에요!\n바다를 지켜요.'
    ]
  }
];

// Game Configuration
const GAME_CONFIG = {
  quiz: {
    totalQuestions: 5,
    optionsCount: 4
  },
  matching: {
    pairs: 4
  }
};

// Utility Functions
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomItems(array, count) {
  return shuffle(array).slice(0, count);
}

function getRandomDescription(character) {
  const index = Math.floor(Math.random() * character.descriptions.length);
  return character.descriptions[index];
}
