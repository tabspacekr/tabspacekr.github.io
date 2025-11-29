// Color Quiz Game - 캐릭터 색깔 맞추기
class ColorQuiz {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.colors = [
      { name: '빨간색', hex: '#E53935' },
      { name: '파란색', hex: '#1E88E5' },
      { name: '노란색', hex: '#FFC107' },
      { name: '주황색', hex: '#FF5722' },
      { name: '하얀색', hex: '#FFFFFF' },
      { name: '초록색', hex: '#4CAF50' }
    ];
  }

  init() {
    this.questions = this.generateQuestions();
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.renderProgress();
    this.showQuestion();
  }

  generateQuestions() {
    const questions = [];
    const characters = shuffle([...CHARACTERS]);
    const count = Math.min(5, characters.length);

    for (let i = 0; i < count; i++) {
      const char = characters[i];
      const correctColor = this.getCharacterColor(char.id);
      const wrongColors = this.colors.filter(c => c.name !== correctColor.name);
      const options = shuffle([correctColor, ...getRandomItems(wrongColors, 3)]);

      questions.push({
        character: char,
        correctColor: correctColor,
        options: options
      });
    }

    return questions;
  }

  getCharacterColor(charId) {
    const colorMap = {
      'roy': { name: '빨간색', hex: '#E53935' },
      'amber': { name: '하얀색', hex: '#FFFFFF' },
      'heli': { name: '주황색', hex: '#FF5722' },
      'poli': { name: '파란색', hex: '#1E88E5' },
      'schoolb': { name: '노란색', hex: '#FFC107' },
      'marine': { name: '파란색', hex: '#1E88E5' }
    };
    return colorMap[charId] || { name: '빨간색', hex: '#E53935' };
  }

  renderProgress() {
    const container = document.getElementById('color-progress');
    container.innerHTML = '';
    for (let i = 0; i < this.questions.length; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = i < this.score ? '⭐' : '☆';
      if (i < this.score) star.classList.add('filled');
      container.appendChild(star);
    }
  }

  showQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.showResult();
      return;
    }

    this.isAnswered = false;
    const question = this.questions[this.currentIndex];

    document.getElementById('color-emoji').textContent = question.character.emoji;

    const optionsContainer = document.getElementById('color-options');
    optionsContainer.innerHTML = '';

    question.options.forEach(color => {
      const button = document.createElement('button');
      button.className = 'color-option';
      button.style.background = color.hex;
      button.style.borderColor = color.hex === '#FFFFFF' ? '#E0E0E0' : color.hex;
      button.style.color = color.hex === '#FFFFFF' || color.hex === '#FFC107' ? '#333' : 'white';
      button.textContent = color.name;
      button.onclick = () => this.selectAnswer(color.name, button);
      optionsContainer.appendChild(button);
    });
  }

  selectAnswer(selectedColor, button) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const question = this.questions[this.currentIndex];
    const isCorrect = selectedColor === question.correctColor.name;

    document.querySelectorAll('.color-option').forEach(btn => {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
    });

    if (isCorrect) {
      this.score++;
      button.classList.add('correct');
      button.style.opacity = '1';
      app.playSound('correct');
      this.showFeedback('정답! 🎉');
    } else {
      button.classList.add('wrong');
      app.playSound('wrong');
      this.showFeedback('다시 해볼까요? 💪');
    }

    this.renderProgress();

    setTimeout(() => {
      this.hideFeedback();
      this.currentIndex++;
      this.showQuestion();
    }, 1500);
  }

  showFeedback(message) {
    const feedback = document.getElementById('color-feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
  }

  hideFeedback() {
    document.getElementById('color-feedback').classList.add('hidden');
  }

  showResult() {
    app.showResult('color', this.score, this.questions.length);
  }
}

const colorQuiz = new ColorQuiz();
