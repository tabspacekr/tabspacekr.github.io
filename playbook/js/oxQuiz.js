// OX Quiz Game - 참/거짓 퀴즈
class OXQuiz {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
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
    const templates = [
      { template: (c) => `${c.name}는 ${c.type}이에요`, correct: true },
      { template: (c) => `${c.emoji}는 ${c.name}이에요`, correct: true },
      { template: (c, other) => `${c.name}는 ${other.type}이에요`, correct: false },
      { template: (c, other) => `${c.emoji}는 ${other.name}이에요`, correct: false }
    ];

    const characters = shuffle([...CHARACTERS]);
    const count = Math.min(5, characters.length);

    for (let i = 0; i < count; i++) {
      const char = characters[i];
      const otherChar = characters[(i + 1) % characters.length];
      const template = templates[Math.floor(Math.random() * templates.length)];

      let questionText, isCorrect;

      if (template.correct) {
        questionText = template.template(char);
        isCorrect = true;
      } else {
        questionText = template.template(char, otherChar);
        isCorrect = false;
      }

      questions.push({
        character: char,
        question: questionText,
        isCorrect: isCorrect
      });
    }

    return questions;
  }

  renderProgress() {
    const container = document.getElementById('ox-progress');
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

    document.getElementById('ox-emoji').textContent = question.character.emoji;
    document.getElementById('ox-question').textContent = question.question;

    // Enable buttons
    document.querySelectorAll('.ox-button').forEach(btn => {
      btn.classList.remove('disabled');
    });
  }

  answer(userAnswer) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const question = this.questions[this.currentIndex];
    const isCorrect = userAnswer === question.isCorrect;

    // Disable buttons
    document.querySelectorAll('.ox-button').forEach(btn => {
      btn.classList.add('disabled');
    });

    if (isCorrect) {
      this.score++;
      app.playSound('correct');
      this.showFeedback('정답! 🎉');
    } else {
      app.playSound('wrong');
      const correctAnswer = question.isCorrect ? '맞아요 ⭕' : '아니에요 ❌';
      this.showFeedback(`틀렸어요! 정답은 "${correctAnswer}"`);
    }

    this.renderProgress();

    setTimeout(() => {
      this.hideFeedback();
      this.currentIndex++;
      this.showQuestion();
    }, 1500);
  }

  showFeedback(message) {
    const feedback = document.getElementById('ox-feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
  }

  hideFeedback() {
    document.getElementById('ox-feedback').classList.add('hidden');
  }

  showResult() {
    app.showResult('ox', this.score, this.questions.length);
  }
}

const oxQuiz = new OXQuiz();
