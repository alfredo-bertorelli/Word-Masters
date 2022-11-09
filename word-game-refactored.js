function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

async function getNewWord() {
    const promise = await fetch(newWordUrl);
    const res = await promise.json();
    correctWord = res.word.toUpperCase();
    correctArray = correctWord.split("");
}

function makeMap(correctWord) {
    wordMap.clear();
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (!wordMap.has(correctWord.charAt(i))) {
            wordMap.set(correctWord.charAt(i), 1)
        } else {
            let value = wordMap.get(correctWord.charAt(i))
            wordMap.set(correctWord.charAt(i), value + 1)
        }
    }
}

function addLetter(letter) {
    let letterBox = document.querySelector(".row" + currentRow).children
    if (currentGuess.length < ANSWER_LENGTH) {
        letterBox[currentGuess.length].innerText = letter;
        currentGuess += letter.toUpperCase();
    } else {
        alert("The guess must be 5 letters long!")
    }
}

function backspace() {
    let letterBox = document.querySelector(".row" + currentRow).children
    if (currentGuess.length) {
        letterBox[currentGuess.length - 1].innerText = "";
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    } else {
        //do nothing
    }
}

async function compareWord(word) {
    let guessArray = currentGuess.split("");
    let correctLetters = 0;

    loading("on");
    const promise = await fetch(validateWordUrl, {
        method: "POST",
        body: JSON.stringify({ word: currentGuess })
    });
    const res = await promise.json();
    let isWordValid = res.validWord;
    loading("off");

    if (isWordValid) {
        // do nothing
        console.log("word is valid")
    } else {
        console.log("word is NOT valid")
        invalidWord();
        return;
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (guessArray[i] === correctArray[i]) {
            correctLetters++;
            correctPosition(i);
        }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
        let value = wordMap.get(currentGuess.charAt(i));
        if (value > 0 && guessArray[i] !== correctArray[i]) {
            wrongPosition(i);
        }
        else {
            letterNotFound(i);
        }
    }

    // Logic to determine if word was guessed correctly (game won)
    if (correctLetters === 5) {
        game = "Won";
        setTimeout(() => alert(`You have guessed the correct word!
                
You've just won a trip to the Bahamas!!! 😎🏝`), 50)
    } else if (currentRow < 6) {
        currentRow++;
        currentGuess = "";
    } else {
        game = "Lost";
        setTimeout(() => alert(`You lost! The word was ${correctWord.toUpperCase()}
        
Refresh the page to play again!`), 50)
    }

}

function correctPosition(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("right-position");
    let value = wordMap.get(correctWord.charAt(position))
    wordMap.set(correctWord.charAt(position), value - 1)
}

function wrongPosition(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("wrong-position");
    let value = wordMap.get(currentGuess.charAt(position))
    wordMap.set(currentGuess.charAt(position), value - 1)
}

function letterNotFound(position) {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    cell[position].classList.add("letter-not-found");
}

function invalidWord() {
    let row = ".row" + currentRow;
    let cell = document.querySelector(row).children
    for (let i = 0; i < 5; i++) {
        cell[i].classList.remove("invalid");
    }
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            cell[i].classList.add("invalid");
        }
    }, 10)
}

function loading(string) {
    let loading = document.querySelector(".loading");
    if (string === "on") {
        loading.style.visibility = "visible";
    } else {
        loading.style.visibility = "hidden";
    }
}

async function init() {

    await getNewWord();
    loading("off");

    document.addEventListener("keydown", async function (event) {

        if (game !== "Won" && game !== "Lost") {
            if (isLetter(event.key)) {
                addLetter(event.key);
            } else if (event.key === "Backspace") {
                backspace();
            } else if (event.key === "Enter") {
                if (currentGuess.length === ANSWER_LENGTH) {
                    makeMap(correctWord);
                    await compareWord(currentGuess);
                } else {
                    alert("Your guess must be 5 letters long!");
                }
            } else {
                event.preventDefault();
            }
        } else if (game === "Won") {
            alert(`You've already won!
        
Refresh the page to play again!`)
        } else if (game === "Lost") {
            alert(`You've lost! The word was ${correctWord.toUpperCase()}
        
Refresh the page to play again!`)
        }
    });

}

let body = document.querySelector("body");
let elements = document.querySelectorAll("section:not(.no-dark)");
let cells = document.querySelectorAll(".cell");
let currentRow = 1;
let wordMap = new Map();
let currentGuess = "";
let game = "";
let correctWord;
let correctArray;
const ANSWER_LENGTH = 5;
const newWordUrl = "https://words.dev-apis.com/word-of-the-day?random=1"
const validateWordUrl = "https://words.dev-apis.com/validate-word"

document.querySelector(".slider").addEventListener("click", () => {

    setTimeout(() => {
        if (elements[0].classList.contains("dark-theme")) {
            elements.forEach(element => {
                element.classList.remove("dark-theme");
            });
            cells.forEach(element => {
                element.classList.remove("dark-theme-font");
            });
            body.style.backgroundColor = "white";
        } else {
            elements.forEach(element => {
                element.classList.add("dark-theme");
            });
            cells.forEach(element => {
                element.classList.add("dark-theme-font");
            });
            body.style.backgroundColor = "black";
        }
    }, 150);
});

init();

