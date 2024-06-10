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
let cards = []; // array for cards html.
const board = document.getElementById('board'); // container to put html cards in 

// Read card data from 
fetch("../../data.json")
    .then((response) => response.json())
    .then((json) => {
        
        cards = [...json, ...json];
        shuffleArray(cards);
        renderBoard();
    });

    /**
 * Render Card html
 * 
 */
function renderBoard() {
    for (let card of cards) {
        const cardItem = document.createElement('div');
        cardItem.classList.add('card');
        cardItem.setAttribute('data-slug', slugify(card.name)); // convert name to slug for clean data attribute
        cardItem.innerHTML = `
            <div class="front">
                <img class="card__img" src="${card.image}" width="60" height="60" alt="${card.name}">
            </div>
            <div class="back"></div>
        `;
        board.appendChild(cardItem);
    }
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
