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
    });



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

