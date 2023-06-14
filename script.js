const gameContainer = document.getElementById("game");

const COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "red",
  "blue",
  "green",
  "orange",
  "purple"
];

const COLOR2ICON = {
  "red": "breathe-clean-air.svg",
  "blue": "bride.svg",
  "green": "llama.svg",
  "orange": "noodles.svg",
  "purple": "pattern.svg"
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

let shuffledColors = shuffle(COLORS);
const cardStateMap = new Map();
let openingCards = new Set();

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");
    newDiv.classList.add('card');

    newDiv.innerHTML = `
      <div class="front"><img src="assets/card-game.svg"/></div>
      <div class="back"><img src="assets/${COLOR2ICON[color]}"/></div>
    `;

    // give it a class attribute for the value we are looping over
    newDiv.setAttribute("data-color", color);

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);

    cardStateMap.set(newDiv, new StateMachine(newDiv))
  }
}

// TODO: Implement this function!
function handleCardClick(event) {
  // you can use event.target to see which element was clicked
  const ele = event.currentTarget;
  const stateMachine = cardStateMap.get(ele)
  if (openingCards.size >= 2) return;
  openingCards.add(ele)
  stateMachine.send("click")
  
  setTimeout(() => {
    stateMachine.send("timeout")
    openingCards.delete(ele)
  }, 1000);

  if (openingCards.size === 2) {
    const [card1, card2] = [...openingCards.values()]
    if (card1.dataset["color"] === card2.dataset["color"]) {
      cardStateMap.get(card1).send("match")
      cardStateMap.get(card2).send("match")
      openingCards.clear()
      gameCheck()
    }    
  }
}



/** State Machine */
function StateMachine ($ele) {
  this.state = "DOWN"
  this.$ele = $ele
  this.stateTree = {
    "DOWN": {
      "click": {
        target: "UP",
        onTransition() {
          $ele.classList.add("up")
        }
      }
    },
    "UP": {
      "timeout": {
        target: "DOWN",
        onTransition() {
          $ele.classList.remove("up")
        }
      },
      "match": {
        target: "MATCHED",
        onTransition() {
          $ele.classList.add("up")
          $ele.classList.add("matched")
        }
      }
    },
    "MATCHED": {}
  }
}

StateMachine.prototype.send = function (eventName) {
  if (!this.canTransition(eventName)) return;
  const nextState = this.stateTree[this.state][eventName].target;
  this.stateTree[this.state][eventName].onTransition();
  this.state = nextState
}

StateMachine.prototype.canTransition = function (eventName) {
  return eventName in this.stateTree[this.state]
}

/**
 * Game logic
 */

/** @type HTMLDialogElement */
const $finalModal = document.getElementById("final-modal");
/** @type HTMLDialogElement */
const $starterModal = document.getElementById("starter-modal");
const $restart = document.getElementById("restart");
const $start = document.getElementById("start");

$starterModal.showModal({leyboard: false})
$starterModal.addEventListener("cancel", (e) => {e.preventDefault()}, true);
$finalModal.addEventListener("cancel", (e) => {e.preventDefault()}, true);

$start.addEventListener('click', () => {
  startGame()
  $starterModal.close()
})
$restart.addEventListener('click', () => {
  $finalModal.close()
  startGame()
})

function gameCheck() {
  const isAllMatched = 
    [...cardStateMap.values()]
    .every(machine => machine.state === 'MATCHED');
  if (isAllMatched) {
    endGame()
  }
}

function startGame() {
  shuffledColors = shuffle(COLORS)
  //clean up game container 
  while(gameContainer.childElementCount > 0) {
    gameContainer.removeChild(gameContainer.lastChild)
  }
  // when the DOM loads
  createDivsForColors(shuffledColors);
}

function endGame() {
  $finalModal.showModal();

}