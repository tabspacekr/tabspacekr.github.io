// Matching Game Class
class MatchingGame {
  constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.isLocked = false;
  }

  // Initialize game
  init() {
    this.cards = this.generateCards();
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.isLocked = false;
    this.updateStats();
    this.renderCards();
  }

  // Generate cards (emoji + name pairs)
  generateCards() {
    const selectedChars = getRandomItems(CHARACTERS, GAME_CONFIG.matching.pairs);
    const cards = [];

    selectedChars.forEach(char => {
      // Emoji card
      cards.push({
        id: `${char.id}-emoji`,
        charId: char.id,
        type: 'emoji',
        content: char.emoji,
        name: char.name
      });

      // Name card
      cards.push({
        id: `${char.id}-name`,
        charId: char.id,
        type: 'name',
        content: char.name,
        emoji: char.emoji
      });
    });

    return shuffle(cards);
  }

  // Update stats display
  updateStats() {
    document.getElementById('matching-moves').textContent = this.moves;
    document.getElementById('matching-pairs').textContent = this.matchedPairs;
  }

  // Render cards to grid
  renderCards() {
    const grid = document.getElementById('matching-grid');
    grid.innerHTML = '';

    this.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'matching-card';
      cardEl.dataset.index = index;

      if (card.matched) {
        cardEl.classList.add('flipped', 'matched');
      }

      cardEl.innerHTML = `
        <div class="matching-card-inner">
          <div class="matching-card-front">❓</div>
          <div class="matching-card-back">
            ${card.type === 'emoji'
              ? `<span class="card-emoji">${card.content}</span>
                 <span class="card-name">${card.name}</span>`
              : `<span class="card-name" style="font-size: 20px;">${card.content}</span>`
            }
          </div>
        </div>
      `;

      cardEl.onclick = () => this.flipCard(index);
      grid.appendChild(cardEl);
    });
  }

  // Flip card
  flipCard(index) {
    if (this.isLocked) return;

    const card = this.cards[index];
    const cardEl = document.querySelectorAll('.matching-card')[index];

    // Can't flip already flipped or matched cards
    if (card.flipped || card.matched) return;
    // Can't flip same card twice
    if (this.flippedCards.length === 1 && this.flippedCards[0].index === index) return;

    // Flip the card
    card.flipped = true;
    cardEl.classList.add('flipped');
    app.playSound('click');

    this.flippedCards.push({ index, card });

    // Check for match when 2 cards are flipped
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateStats();
      this.checkMatch();
    }
  }

  // Check if two flipped cards match
  checkMatch() {
    this.isLocked = true;

    const [first, second] = this.flippedCards;
    const isMatch = first.card.charId === second.card.charId;

    if (isMatch) {
      // Match found!
      this.handleMatch(first, second);
    } else {
      // No match
      this.handleMismatch(first, second);
    }
  }

  // Handle matching cards
  handleMatch(first, second) {
    first.card.matched = true;
    second.card.matched = true;
    this.matchedPairs++;
    this.updateStats();

    const cards = document.querySelectorAll('.matching-card');
    cards[first.index].classList.add('matched');
    cards[second.index].classList.add('matched');

    app.playSound('correct');

    this.flippedCards = [];
    this.isLocked = false;

    // Check for game completion
    if (this.matchedPairs === GAME_CONFIG.matching.pairs) {
      setTimeout(() => this.showResult(), 500);
    }
  }

  // Handle non-matching cards
  handleMismatch(first, second) {
    app.playSound('wrong');

    setTimeout(() => {
      first.card.flipped = false;
      second.card.flipped = false;

      const cards = document.querySelectorAll('.matching-card');
      cards[first.index].classList.remove('flipped');
      cards[second.index].classList.remove('flipped');

      this.flippedCards = [];
      this.isLocked = false;
    }, 1000);
  }

  // Show result screen
  showResult() {
    // Calculate stars based on moves
    // Perfect: pairs count moves, Good: 2x, etc.
    const perfectMoves = GAME_CONFIG.matching.pairs;
    let stars;

    if (this.moves <= perfectMoves + 2) {
      stars = 3;
    } else if (this.moves <= perfectMoves * 2) {
      stars = 2;
    } else {
      stars = 1;
    }

    app.showResult('matching', stars, 3, this.moves);
  }
}

// Global matching instance
const matchingGame = new MatchingGame();
