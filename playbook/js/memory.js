// Memory Game - 순서 기억하기 게임
class MemoryGame {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.sequence = [];
    this.userSequence = [];
    this.isShowingSequence = false;
    this.isUserTurn = false;
    this.characters = [];
  }

  init() {
    this.level = 1;
    this.score = 0;
    this.sequence = [];
    this.userSequence = [];
    this.isShowingSequence = false;
    this.isUserTurn = false;
    this.characters = getRandomItems(CHARACTERS, 6);
    this.updateStats();
    this.renderGrid();
    this.startLevel();
  }

  updateStats() {
    document.getElementById('memory-level').textContent = this.level;
    document.getElementById('memory-score').textContent = this.score;
  }

  renderGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    this.characters.forEach((char, index) => {
      const div = document.createElement('div');
      div.className = 'memory-item';
      div.textContent = char.emoji;
      div.dataset.index = index;
      div.onclick = () => this.handleUserInput(index);
      grid.appendChild(div);
    });
  }

  startLevel() {
    this.userSequence = [];
    this.isUserTurn = false;
    this.setInstruction('순서를 기억하세요!');

    // Add new item to sequence
    const newIndex = Math.floor(Math.random() * this.characters.length);
    this.sequence.push(newIndex);

    // Disable grid during sequence display
    this.setGridEnabled(false);

    // Show sequence
    setTimeout(() => this.showSequence(), 1000);
  }

  async showSequence() {
    this.isShowingSequence = true;
    const display = document.getElementById('memory-display');
    display.innerHTML = '';

    for (let i = 0; i < this.sequence.length; i++) {
      const charIndex = this.sequence[i];
      const char = this.characters[charIndex];

      // Show character
      const div = document.createElement('div');
      div.className = 'memory-show';
      div.textContent = char.emoji;
      display.appendChild(div);

      app.playSound('click');

      // Highlight in grid
      const gridItems = document.querySelectorAll('.memory-item');
      gridItems[charIndex].style.background = '#BBDEFB';

      await this.wait(800);

      // Reset grid item
      gridItems[charIndex].style.background = 'white';

      await this.wait(200);
    }

    // Clear display and start user turn
    display.innerHTML = '';
    this.isShowingSequence = false;
    this.isUserTurn = true;
    this.setInstruction('순서대로 터치하세요!');
    this.setGridEnabled(true);
  }

  handleUserInput(index) {
    if (!this.isUserTurn || this.isShowingSequence) return;

    const gridItems = document.querySelectorAll('.memory-item');
    const item = gridItems[index];

    this.userSequence.push(index);
    const currentPos = this.userSequence.length - 1;

    if (this.sequence[currentPos] === index) {
      // Correct!
      item.classList.add('correct');
      app.playSound('click');

      setTimeout(() => {
        item.classList.remove('correct');
      }, 300);

      // Check if sequence complete
      if (this.userSequence.length === this.sequence.length) {
        this.levelComplete();
      }
    } else {
      // Wrong!
      item.classList.add('wrong');
      app.playSound('wrong');
      this.gameOver();
    }
  }

  levelComplete() {
    this.isUserTurn = false;
    this.score += this.level * 10;
    this.level++;
    this.updateStats();

    app.playSound('correct');
    this.setInstruction('잘했어요! 🎉');

    setTimeout(() => {
      if (this.level <= 10) {
        this.startLevel();
      } else {
        // Max level reached!
        this.showResult();
      }
    }, 1500);
  }

  gameOver() {
    this.isUserTurn = false;
    this.setGridEnabled(false);
    this.setInstruction('게임 끝! 💪');

    setTimeout(() => {
      this.showResult();
    }, 1500);
  }

  showResult() {
    // Calculate stars based on level reached
    let stars;
    if (this.level >= 7) stars = 3;
    else if (this.level >= 4) stars = 2;
    else stars = 1;

    app.showResult('memory', stars, 3, this.level - 1);
  }

  setInstruction(text) {
    document.getElementById('memory-instruction').textContent = text;
  }

  setGridEnabled(enabled) {
    const gridItems = document.querySelectorAll('.memory-item');
    gridItems.forEach(item => {
      if (enabled) {
        item.classList.remove('disabled');
      } else {
        item.classList.add('disabled');
      }
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isUserTurn = false;
    this.isShowingSequence = false;
  }
}

const memoryGame = new MemoryGame();
