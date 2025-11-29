// Speed Touch Game - 빠른 터치 게임
class SpeedTouch {
  constructor() {
    this.score = 0;
    this.timeLeft = 15;
    this.timer = null;
    this.targetChar = null;
    this.isRunning = false;
  }

  init() {
    this.score = 0;
    this.timeLeft = 15;
    this.isRunning = true;
    this.updateStats();
    this.pickNewTarget();
    this.renderGrid();
    this.startTimer();
  }

  pickNewTarget() {
    this.targetChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const targetEl = document.getElementById('speed-target');
    targetEl.innerHTML = `
      <span class="target-emoji">${this.targetChar.emoji}</span>
      <span class="target-name">${this.targetChar.name}를 찾아요!</span>
    `;
  }

  renderGrid() {
    const grid = document.getElementById('speed-grid');
    grid.innerHTML = '';

    // Create 9 items (3x3 grid)
    const items = [];

    // Add 1-3 targets
    const targetCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < targetCount; i++) {
      items.push({ char: this.targetChar, isTarget: true });
    }

    // Get other characters (excluding target)
    const otherChars = CHARACTERS.filter(c => c.id !== this.targetChar.id);

    // Fill rest with random characters (allow duplicates)
    while (items.length < 9) {
      const randomChar = otherChars[Math.floor(Math.random() * otherChars.length)];
      items.push({ char: randomChar, isTarget: false });
    }

    // Shuffle and render
    shuffle(items).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'speed-item';
      div.textContent = item.char.emoji;
      div.onclick = () => this.handleTouch(div, item.isTarget);
      grid.appendChild(div);
    });
  }

  handleTouch(element, isTarget) {
    if (!this.isRunning) return;

    if (isTarget) {
      this.score++;
      element.classList.add('correct');
      app.playSound('correct');
      this.updateStats();

      // Quick refresh after correct touch
      setTimeout(() => {
        if (this.isRunning) {
          this.pickNewTarget();
          this.renderGrid();
        }
      }, 300);
    } else {
      element.classList.add('wrong');
      app.playSound('wrong');
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateStats();

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  updateStats() {
    document.getElementById('speed-score').textContent = this.score;
    document.getElementById('speed-timer').textContent = this.timeLeft;
  }

  endGame() {
    this.isRunning = false;
    clearInterval(this.timer);

    // Calculate stars based on score
    let stars;
    if (this.score >= 15) stars = 3;
    else if (this.score >= 10) stars = 2;
    else stars = 1;

    setTimeout(() => {
      app.showResult('speed', stars, 3, this.score);
    }, 500);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

const speedTouch = new SpeedTouch();
