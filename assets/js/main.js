/*
Irish bird song pairs function list:
- Initialise (Read card data, shuffle then render)
- Shuffle
- Render board
- Flip card on click
- Check for match (once 2nd card flipped)
- Lock matched cards
- Unflip when no match
- Reset to enable next turn
- New Game (Restart)
- Switch audio play mode
- Display Moves made
- Display Bird name
- Slugify helper
*/

// Set up some variables
let cards = [], card1, card2; // array for cards html & cards in play.
let inPlay = true; // set to false after each turn
let movesMade = 0; 
let birdSong = false; // whether to play bird song or not
let showImage = true; // whether image displayed or not

// add some event listeners to buttons
const restartBtn = document.getElementById('restart');
restartBtn.addEventListener('click', newGame); // Button to restart / reset game
const audioControl = document.getElementById('audio-control');
audioControl.addEventListener('click', switchAudio); // use to control audio / play modes
const board = document.getElementById('board'); // container to put html cards in 

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
 * Shuffle Array 
 * - using Fisher-Yates Sorting Algorithm:
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
 * Render Board 
 * - assemble card html from cards array and attach to the board
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
 * Flip 
 * - only flip card if turn is active play
 */
function flip() {
    if (inPlay){ // turn in play 'til 2 cards flipped
        if (this === card1 ) return; // do nothing & exit if card1 clicked again.
        this.classList.add('active'); // in play so set to active to flip card
        // get name from alt tag and set as name of current bird
        if (showImage) displayBirdName(this.querySelector('.card__img').getAttribute('alt'));
        // play current song if audio enabled.
        if (birdSong) {
            const currentSong = document.getElementById('bird-song');
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
 * - once 2 cards are flipped / active, check if card1 & card2 slugs are same
 */
function checkForMatch() {
    // if data slugs match disable clicks else unflip.
    if (card1.dataset.slug === card2.dataset.slug) {
        lockMatched();
    } else {
        unFlip();
    }
    // increment & update moves made
    displayMoves(++movesMade);
}

/**
 * Lock Matched 
 *  - replace active class with match class (pointer-events set to none to disable click)
 */
function lockMatched() {
    card1.classList.replace('active', 'match');
    card2.classList.replace('active', 'match');
    resetTurn(); // reset for next turn
}

/**
 * Unflip 
 * - when no match by removing active class after 1 second delay
 */
function unFlip() {
    setTimeout(() => {
        card1.classList.remove('active');
        card2.classList.remove('active');
        resetTurn();
    }, 1000);
}

/**
 * Reset Turn
 * - enables next turn after pair matched or unflipped by clearing pair in play
 */
function resetTurn() {
    [card1, card2] = [null, null];
    inPlay = true;
}

/**
 * New Game (called from Restart button click)
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
        displayMoves(movesMade); 
        displayBirdName('');
    }, 500);
}

/**
 * Switch Audio
 * - clicking the bird icon cycles to the next play modes: 
 * 1) audio off (image only)
 * 2) audio on (sound and image)
 * 3) audio only!
 * -  updates bird icon state, audio play mode & image display state 
 */
function switchAudio() {
    if (this.classList.contains('audio-off')) {
        // switch to audio on 
        this.classList.replace('audio-off', 'audio-on');
        birdSong = true;
        showImage = true;
    } else if (this.classList.contains('audio-on')) {
        // switch to audio only
        this.classList.replace('audio-on', 'audio-only');
        board.classList.add('images-off');
        birdSong = true;
        showImage = false;
        displayBirdName('???'); // hide bird names

    } else if (this.classList.contains('audio-only')) {
        // switch to audio off
        this.classList.replace('audio-only', 'audio-off');
        board.classList.remove('images-off');
        birdSong = false;
        showImage = true;
    }
}

/**
 * Display Moves
 * - update move made in game UI 
 * - put display update into function to avoid leaving variable in global scope
 */
function displayMoves(value) {
    const moves = document.getElementById('moves');
    moves.innerHTML = value;
}

/**
 * Display Bird name
 * - update last clicked bird in game UI 
 * - put display update into function to avoid leaving variable in global scope
 */
function displayBirdName(value) {
    const currentBird = document.getElementById('bird');
    currentBird.innerHTML = value;
}


// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Slugify
 * - convert name to lowercase, hyphenated slug for data attributes
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
