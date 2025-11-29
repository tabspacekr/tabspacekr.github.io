// Type Quiz Game - 차량 타입 맞추기
class TypeQuiz {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.types = ['소방차', '구급차', '헬리콥터', '경찰차', '버스', '보트'];
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
      const correctType = char.type;
      const wrongTypes = this.types.filter(t => t !== correctType);
      const options = shuffle([correctType, ...getRandomItems(wrongTypes, 3)]);

      questions.push({
        character: char,
        correctType: correctType,
        options: options
      });
    }

    return questions;
  }

  renderProgress() {
    const container = document.getElementById('type-progress');
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

    document.getElementById('type-emoji').textContent = question.character.emoji;

    const optionsContainer = document.getElementById('type-options');
    optionsContainer.innerHTML = '';

    question.options.forEach(type => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.innerHTML = `
        <span class="option-emoji">${this.getTypeEmoji(type)}</span>
        <span class="option-name">${type}</span>
      `;
      button.onclick = () => this.selectAnswer(type, button);
      optionsContainer.appendChild(button);
    });
  }

  getTypeEmoji(type) {
    const emojiMap = {
      '소방차': '🔥',
      '구급차': '🏥',
      '헬리콥터': '🌤️',
      '경찰차': '👮',
      '버스': '🏫',
      '보트': '🌊'
    };
    return emojiMap[type] || '🚗';
  }

  selectAnswer(selectedType, button) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const question = this.questions[this.currentIndex];
    const isCorrect = selectedType === question.correctType;

    document.querySelectorAll('.option-button').forEach(btn => {
      btn.classList.add('disabled');
    });

    if (isCorrect) {
      this.score++;
      button.classList.add('correct');
      app.playSound('correct');
      this.showFeedback('정답! 🎉');
    } else {
      button.classList.add('wrong');
      app.playSound('wrong');
      this.showFeedback('다시 해볼까요? 💪');

      document.querySelectorAll('.option-button').forEach(btn => {
        if (btn.querySelector('.option-name').textContent === question.correctType) {
          btn.classList.add('correct');
        }
      });
    }

    this.renderProgress();

    setTimeout(() => {
      this.hideFeedback();
      this.currentIndex++;
      this.showQuestion();
    }, 1500);
  }

  showFeedback(message) {
    const feedback = document.getElementById('type-feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
  }

  hideFeedback() {
    document.getElementById('type-feedback').classList.add('hidden');
  }

  showResult() {
    app.showResult('type', this.score, this.questions.length);
  }
}

const typeQuiz = new TypeQuiz();
