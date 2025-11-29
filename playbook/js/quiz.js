// Quiz Game Class
class QuizGame {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
  }

  // Initialize game
  init() {
    this.questions = this.generateQuestions();
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.renderProgress();
    this.showQuestion();
  }

  // Generate quiz questions
  generateQuestions() {
    const questions = [];
    const characters = shuffle([...CHARACTERS]);
    const count = Math.min(GAME_CONFIG.quiz.totalQuestions, characters.length);

    for (let i = 0; i < count; i++) {
      const correctChar = characters[i];
      const wrongChars = characters.filter(c => c.id !== correctChar.id);
      const options = shuffle([
        correctChar,
        ...getRandomItems(wrongChars, GAME_CONFIG.quiz.optionsCount - 1)
      ]);

      questions.push({
        character: correctChar,
        description: getRandomDescription(correctChar),
        options: options
      });
    }

    return questions;
  }

  // Render progress stars
  renderProgress() {
    const container = document.getElementById('quiz-progress');
    container.innerHTML = '';

    for (let i = 0; i < this.questions.length; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = i < this.score ? '⭐' : '☆';
      if (i < this.score) star.classList.add('filled');
      container.appendChild(star);
    }
  }

  // Show current question
  showQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.showResult();
      return;
    }

    this.isAnswered = false;
    const question = this.questions[this.currentIndex];

    // Update description
    document.getElementById('quiz-description').textContent = question.description;

    // Update options
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    question.options.forEach(char => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.innerHTML = `
        <span class="option-emoji">${char.emoji}</span>
        <span class="option-name">${char.name}</span>
      `;
      button.onclick = () => this.selectAnswer(char.id, button);
      optionsContainer.appendChild(button);
    });
  }

  // Handle answer selection
  selectAnswer(selectedId, button) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const question = this.questions[this.currentIndex];
    const isCorrect = selectedId === question.character.id;

    // Disable all buttons
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

      // Show correct answer
      document.querySelectorAll('.option-button').forEach(btn => {
        const name = btn.querySelector('.option-name').textContent;
        if (name === question.character.name) {
          btn.classList.add('correct');
        }
      });
    }

    this.renderProgress();

    // Next question after delay
    setTimeout(() => {
      this.hideFeedback();
      this.currentIndex++;
      this.showQuestion();
    }, 1500);
  }

  // Show feedback message
  showFeedback(message) {
    const feedback = document.getElementById('quiz-feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
  }

  // Hide feedback message
  hideFeedback() {
    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.add('hidden');
  }

  // Show result screen
  showResult() {
    app.showResult('quiz', this.score, this.questions.length);
  }
}

// Global quiz instance
const quizGame = new QuizGame();
