/*
Function list:
1. Shuffle deck
2. Render cards
3. Flip card on click
4. Check for match (Once more than 1 card flipped )
5. No match > unflip 
6. Match > stayed flipped & disable click
7. Flip next pair
8. Start / Restart Game
*/

// Set up some variables
let cards = [], card1, card2; // array for cards html & cards in play.
let inPlay = true; // set to false after each turn
let movesMade = 0;
const moves = document.getElementById('moves');
const currentBird = document.getElementById('bird');
let birdSong = true; // whether to play bird song or not
const currentSong = document.getElementById('bird-song');
const board = document.getElementById('board'); // container to put html cards in 
const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', newGame);

/**
 * Initialise with immediatley invoked function / IFFE
 * - Read raw card data from githubusercontent as relative paths don't work with github pages
 */  
(function () {
    fetch("https://raw.githubusercontent.com/bristlebird/irish-bird-song-pairs/main/data.json")
    .then((response) => response.json())
    .then((json) => {        
        cards = [...json, ...json];
        shuffleArray(cards);
        renderBoard();
    });
})();

/**
 * Render Card html from cards array and attach to the board
 * 
 */
function renderBoard() {
    for (let card of cards) {
        const cardItem = document.createElement('div');
        cardItem.classList.add('card');
        cardItem.setAttribute('data-slug', slugify(card.name)); // convert name to slug for clean data attribute
        let webp120 = card.image.replace('.webp', '-120.webp'), webp240 = card.image.replace('.webp', '-240.webp'), webp480 = card.image.replace('.webp', '-480.webp'), jpg240 = card.image.replace('.webp', '-240.jpg');
        cardItem.innerHTML = `
            <figure class="front">
                <picture>
                    <source srcset="${card.image} 60w, ${webp120} 120w, ${webp240} 240w, ${webp480} 480w" sizes="23vw" type="image/webp">
                    <img class="card__img" src="${card.image}" srcset="${jpg240} 240w" sizes="23vw" width="60" height="60" alt="${card.name}">
                </picture>            
            </figure>
            <div class="back"></div>
        `;
        cardItem.addEventListener('click', flip);
        board.appendChild(cardItem);
    }
}

/**
 * Flip - only flip if turn is active
 * 
 */
function flip() {
    if (inPlay){ // turn in play 'til 2 cards flipped
        if (this === card1 ) return; // do nothing & exit if card1 clicked again.
        this.classList.add('active'); // in play so set to active to flip card
        // get name from alt tag and set as name of current bird
        currentBird.innerHTML = this.querySelector('.card__img').getAttribute('alt');
        // play current song if audio enabled.
        if (birdSong) {
            currentSong.setAttribute('src', 'assets/audio/' + this.dataset.slug + '.mp3');
            currentSong.play();
        }
        if (!card1) { // pass card1 to this object if card1 not already set then exit to wait for next card
            card1 = this;
            return;
        } 
        card2 = this; // pass this object to card 2 for class switching & comparisons
        inPlay = false; // pause play after second card turned to prevent further card being turned
        checkForMatch();
    }
}

/**
 * Check for Match
 * once 2 cards are flipped / active - check if 1st 2 array items passed are same
 */
function checkForMatch() {
    console.log('checking for match');
    // if data slugs match disable clicks else unflip.
    let isMatch = card1.dataset.slug === card2.dataset.slug;
    isMatch ? lockMatched() : unFlip();
    // increment & update moves made
    moves.innerHTML = ++movesMade;
}

/**
 * Unflip Cards when no match by removing active class after 1 second delay
 * 
 */
function unFlip() {
    setTimeout(() => {
        card1.classList.remove('active');
        card2.classList.remove('active');
        resetTurn();
    }, 1000);
}

/**
 * Lock Matched Cards - replace active class with match 
 * -> has pointer-events set to none to disabe clicks
 */
function lockMatched() {
    card1.classList.replace('active', 'match');
    card2.classList.replace('active', 'match');
    resetTurn(); // reset for next turn
}

/**
 * Reset for next turn by clearing pair in play
 * 
 */
function resetTurn() {
    [card1, card2] = [null, null];
    inPlay = true;
}

/**
 * New Game (called from reset button click)
 * - turn cards face down, shuffle deck in array, 
 * empty the board then render shuffled cards & reset variables
 */
function newGame() {
    // remove match class from cards
    const matchedCards = document.getElementsByClassName('card');
    for (let card of matchedCards) {
        if (card.classList.contains('match')) card.classList.remove('match');
        // & in case half way through a turn:
        if (card.classList.contains('active')) card.classList.remove('active');
    }
    shuffleArray(cards);
    setTimeout(() => {
        board.innerHTML = '';  
        renderBoard();  
        resetTurn();
        movesMade = 0;
        moves.innerHTML = 0; 
        currentBird.innerHTML = '';   
    }, 500);
}
// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Shuffle Array using Fisher-Yates Sorting Algorithm
 * https://medium.com/@khaledhassan45/how-to-shuffle-an-array-in-javascript-6ca30d53f772
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // random index of remaining items
        [arr[i], arr[j]] = [arr[j], arr[i]]; // swap contents of current index i with random index j.
    }
    return arr;
}

/**
 * Slugify
 * https://byby.dev/js-slugify-string
 */
function slugify(str) {
    return String(str)
      .normalize('NFKD') // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
      .trim() // trim leading or trailing whitespace
      .toLowerCase() // convert to lowercase
      .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens
}
