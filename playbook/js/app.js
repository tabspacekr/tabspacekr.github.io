// Main App Class
class App {
  constructor() {
    this.currentScreen = 'home';
    this.currentGame = null;
    this.soundEnabled = true;
    this.audioContext = null;
  }

  // Initialize app
  init() {
    this.loadSoundSettings();
    this.initSounds();
    this.updateSoundUI();
  }

  // Initialize sound effects (using Web Audio API for simple beeps)
  initSounds() {
    // Create audio context on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    }, { once: true });
  }

  // Play sound effect
  playSound(type) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      switch (type) {
        case 'correct':
          this.playTone(ctx, [523.25, 659.25, 783.99], 0.1, 0.3);
          break;

        case 'wrong':
          this.playBuzz(ctx, 200, 0.2);
          break;

        case 'click':
          this.playTone(ctx, [800], 0.05, 0.15);
          break;

        case 'complete':
          this.playFanfare(ctx);
          break;
      }
    } catch (e) {
      console.log('Sound error:', e);
    }
  }

  // Play ascending tones
  playTone(ctx, frequencies, interval, volume) {
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * interval;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + interval + 0.1);

      osc.start(startTime);
      osc.stop(startTime + interval + 0.15);
    });
  }

  // Play buzz sound for wrong answer
  playBuzz(ctx, freq, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  // Play victory fanfare
  playFanfare(ctx) {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Toggle sound
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveSoundSettings();
    this.updateSoundUI();

    if (this.soundEnabled) {
      this.playSound('click');
    }
  }

  // Update sound button UI
  updateSoundUI() {
    document.getElementById('sound-icon').textContent = this.soundEnabled ? '🔊' : '🔇';
    document.getElementById('sound-text').textContent = this.soundEnabled ? '소리 켜기' : '소리 끄기';
  }

  // Save sound settings
  saveSoundSettings() {
    try {
      localStorage.setItem('soundEnabled', this.soundEnabled);
    } catch (e) {}
  }

  // Load sound settings
  loadSoundSettings() {
    try {
      const saved = localStorage.getItem('soundEnabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    } catch (e) {}
  }

  // Switch screen
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    this.currentScreen = screenId;
  }

  // Start quiz game
  startQuiz() {
    this.currentGame = 'quiz';
    this.showScreen('quiz-screen');
    quizGame.init();
  }

  // Start matching game
  startMatching() {
    this.currentGame = 'matching';
    this.showScreen('matching-screen');
    matchingGame.init();
  }

  // Start color quiz game
  startColorQuiz() {
    this.currentGame = 'color';
    this.showScreen('color-screen');
    colorQuiz.init();
  }

  // Start type quiz game
  startTypeQuiz() {
    this.currentGame = 'type';
    this.showScreen('type-screen');
    typeQuiz.init();
  }

  // Start speed touch game
  startSpeedTouch() {
    this.currentGame = 'speed';
    this.showScreen('speed-screen');
    speedTouch.init();
  }

  // Start OX quiz game
  startOXQuiz() {
    this.currentGame = 'ox';
    this.showScreen('ox-screen');
    oxQuiz.init();
  }

  // Start memory game
  startMemory() {
    this.currentGame = 'memory';
    this.showScreen('memory-screen');
    memoryGame.init();
  }

  // Show result screen
  showResult(gameType, score, total, extra = null) {
    this.playSound('complete');

    // Stop any running games
    if (typeof speedTouch !== 'undefined') speedTouch.stop();
    if (typeof memoryGame !== 'undefined') memoryGame.stop();

    // Calculate stars based on game type
    let stars = 0;
    if (['quiz', 'color', 'type', 'ox'].includes(gameType)) {
      const ratio = score / total;
      if (ratio >= 0.8) stars = 3;
      else if (ratio >= 0.6) stars = 2;
      else stars = 1;
    } else {
      stars = score; // For matching, speed, memory - score is already stars
    }

    // Update result UI
    const messages = {
      3: { emoji: '🎉', text: '최고예요!' },
      2: { emoji: '😊', text: '잘했어요!' },
      1: { emoji: '💪', text: '다시 도전해요!' }
    };

    const result = messages[stars];
    document.getElementById('result-emoji').textContent = result.emoji;
    document.getElementById('result-message').textContent = result.text;

    // Show stars
    const starsContainer = document.getElementById('result-stars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.textContent = i < stars ? '⭐' : '☆';
      star.style.opacity = i < stars ? '1' : '0.3';
      starsContainer.appendChild(star);
    }

    // Show detail based on game type
    let detail = '';
    if (['quiz', 'color', 'type', 'ox'].includes(gameType)) {
      detail = `${total}문제 중 ${score}개 정답!`;
    } else if (gameType === 'matching') {
      detail = `${extra}번 만에 성공!`;
    } else if (gameType === 'speed') {
      detail = `${extra}점 획득!`;
    } else if (gameType === 'memory') {
      detail = `레벨 ${extra} 달성!`;
    }
    document.getElementById('result-detail').textContent = detail;

    // Show confetti for 3 stars
    if (stars === 3) {
      this.showConfetti();
    }

    this.showScreen('result-screen');
  }

  // Restart current game
  restart() {
    switch (this.currentGame) {
      case 'quiz': this.startQuiz(); break;
      case 'matching': this.startMatching(); break;
      case 'color': this.startColorQuiz(); break;
      case 'type': this.startTypeQuiz(); break;
      case 'speed': this.startSpeedTouch(); break;
      case 'ox': this.startOXQuiz(); break;
      case 'memory': this.startMemory(); break;
    }
  }

  // Go to home screen
  goHome() {
    // Stop any running games
    if (typeof speedTouch !== 'undefined') speedTouch.stop();
    if (typeof memoryGame !== 'undefined') memoryGame.stop();

    this.currentGame = null;
    this.showScreen('home-screen');
  }

  // Show confetti animation
  showConfetti() {
    const emojis = ['🎉', '🎊', '⭐', '✨', '🌟', '💫'];

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
      }, i * 100);
    }
  }
}

// Initialize app
const app = new App();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
