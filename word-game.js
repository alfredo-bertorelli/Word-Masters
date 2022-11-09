async function getNewWord() {
    const promise = await fetch(newWordUrl);
    const processedResponse = await promise.json();
    originalWord = processedResponse.word;
    for (let i = 0; i < originalWord.length; i++) {
        wordToGuess[i] = originalWord.charAt(i).toUpperCase();
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function printLetter(letter) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    if (currentLetter < 5) {
        cell[currentLetter].innerText = letter.toUpperCase();
        currentWord.push(letter.toUpperCase());
        currentLetter++;
    } else {
        //do nothing
        return;
    }
}

function backspace() {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    if (currentLetter > 0) {
        cell[currentLetter - 1].innerText = "";
        for (let i = 0; i < 5; i++) {
            cell[i].classList.remove("not-valid");
        }
        cell[currentLetter - 1].classList.remove("not-valid");
        currentWord.pop();
        currentLetter--;
    }

}

async function enter() {
    let guesses;
    if (currentLetter < 5) {
        alert("Your word must be 5 letters long!")
    } else {
        let validation = await validateWord();
        if (isValid) {
            compareWord();
            if (correctLetterGuesses === 5) {
                setTimeout(() => alert(`You have guessed the correct word!
                
You've just won a trip to the Bahamas!!! 😎🏝`), 150)
                gameWon = true;
            }
        }
    }

    console.log("current row " + currentRow)
    if (currentRow > 6 && correctLetterGuesses < 5) {
        setTimeout(() => alert(`You lost! The word was ${originalWord.toUpperCase()}
        
Refresh the page to play again!`), 150)
        lostGame = 1;
    }
}

function compareWord() {
    console.log("This is the current word: " + currentWord)
    correctLetterGuesses = 0;
    let dummyWord = wordToGuess.slice();
    for (let i = 0; i < 5; i++) {
        let match = 0;
        for (let j = 0; j < 5; j++) {
            if (dummyWord[j] === currentWord[i]) {
                if (j === i) {
                    rightPosition(i);
                    dummyWord[j] = "";
                    match = 1;
                    correctLetterGuesses++;
                    break;
                } else {
                    wrongPosition(i);
                    dummyWord[j] = "";
                    match = 1;
                    break;
                }
            }
        }
        if (match === 0) {
            console.log(("The letter " + currentWord[i] + " is NOT in the word!"))
            letterNotFound(i);
        }
    }
    currentRow++;
    currentLetter = 0;
    currentWord = [];
    return;
}

function rightPosition(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("right-position");

}

function wrongPosition(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("wrong-position");
}

function letterNotFound(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("letter-not-found");
}

async function validateWord() {
    let wordToValidate = "";
    for (let i = 0; i < currentWord.length; i++) {
        wordToValidate += currentWord[i];
    }
    const promise = await fetch(validateWordUrl, {
        method: "POST",
        body: JSON.stringify({ word: wordToValidate })
    });
    const processedResponse = await promise.json();
    let isWordValid = processedResponse.validWord;
    console.log(isWordValid)
    if (!isWordValid) {
        invalidWord();
        isValid = false;
        console.log("inside invalid condition")
        return isValid;
    } else {
        //do nothing
        console.log("word is valid")
        isValid = true;
        return isValid;
    }
}

function invalidWord() {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    for (let i = 0; i < 5; i++) {
        cell[i].classList.add("not-valid");
    }
}


let originalWord;
let wordToGuess = [];
let currentRow = 1;
let currentLetter = 0;
let currentWord = [];
let lostGame = 0;
let gameWon = false;
let isValid = false;
let correctLetterGuesses = 0;
const newWordUrl = "https://words.dev-apis.com/word-of-the-day?random=1"
const validateWordUrl = "https://words.dev-apis.com/validate-word"

getNewWord();

document.addEventListener("keydown", (event) => {
    if (!gameWon && currentRow < 7) {
        if (isLetter(event.key)) {
            printLetter(event.key);
            console.log(event.key);
        } else if (event.key === "Backspace") {
            backspace();
        } else if (event.key === "Enter") {
            enter();
        }
        console.log(currentWord);
    } else if (lostGame === 1) {
        alert(`You've lost! The word was ${originalWord.toUpperCase()}
        
Refresh the page to play again!`)
    } else {
        alert(`You've already won!
        
Refresh the page to play again!`)
    }
})