// Emoji set for the cards
const EMOTICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// Game State
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;

// DOM Elements
const grid = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const finalMovesEl = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');

function initGame() {
    // Reset state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;

    // Update UI
    movesEl.textContent = moves;
    matchesEl.textContent = matchedPairs;
    victoryModal.classList.remove('show');
    grid.innerHTML = '';

    // Create deck (2 of each emoticon)
    const deck = [...EMOTICONS, ...EMOTICONS];

    // Shuffle deck securely
    deck.sort(() => Math.random() - 0.5);

    // Generate DOM
    deck.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;

        const faceBack = document.createElement('div');
        faceBack.classList.add('face', 'back');

        const faceFront = document.createElement('div');
        faceFront.classList.add('face', 'front');
        faceFront.textContent = emoji;

        card.appendChild(faceBack);
        card.appendChild(faceFront);

        card.addEventListener('click', () => flipCard(card));

        grid.appendChild(card);
        cards.push(card);
    });
}

function flipCard(card) {
    // Prevent flipping if board is locked, card is already flipped/matched
    if (isLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesEl.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    isLocked = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        // Match!
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            matchesEl.textContent = matchedPairs;

            checkVictory();

            flippedCards = [];
            isLocked = false;
        }, 500);
    } else {
        // No match!
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');

            flippedCards = [];
            isLocked = false;
        }, 1000);
    }
}

function checkVictory() {
    if (matchedPairs === EMOTICONS.length) {
        setTimeout(() => {
            finalMovesEl.textContent = moves;
            victoryModal.classList.add('show');
        }, 500);
    }
}

// Event Listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Start game on load
initGame();
