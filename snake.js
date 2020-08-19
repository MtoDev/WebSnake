/* CONSTANTS AND GLOBAL VARIABLES */
const GAME_SPEED_CONST = 100;
var GAME_SPEED = GAME_SPEED_CONST;
const CANVAS_BORDER_COLOUR = 'black';
const CANVAS_BACKGROUND_COLOUR = "white";
const CANVAS_END_GAME_BACKGROUND_COLOUR = '#ff9e9e';
const SNAKE_HEAD_COLOUR = '#174f21';
const SNAKE_COLOUR1 = 'LimeGreen';
const SNAKE_COLOUR2 = 'LimeGreen';
  const SNAKE_BORDER_COLOUR = 'darkgreen';
  const FOOD_COLOUR = 'red';
  const BAD_FOOD_COLOUR = 'blue';
const FOOD_BORDER_COLOUR = 'darkred';
  const gameCanvasWidth = document.getElementById("gameCanvas").width;
const gameCanvasHeight = document.getElementById("gameCanvas").height;

var badFoodCreated = false;
var foodX = -1;
var foodY = -1;
var badFoodX = -1;
var badFoodY = -1;
var endGame = false;

let snake = [
    {x: (gameCanvasWidth / 2), y: gameCanvasHeight / 2},  	// 150, 150
    {x: (gameCanvasWidth / 2) - 10, y: gameCanvasHeight / 2},	// 140, 150
    {x: (gameCanvasWidth / 2) - 20, y: gameCanvasHeight / 2},	// 130, 150
    {x: (gameCanvasWidth / 2) - 30, y: gameCanvasHeight / 2},	// 120, 150
    {x: (gameCanvasWidth / 2) - 40, y: gameCanvasHeight / 2}	// 110, 150
];

// game score
let score = 0;
// When set to true the snake is changing direction
let changingDirection = false;
// Horizontal velocity
let dx = 10;
// Vertical velocity
let dy = 0;



/** MAIN PART OF THE GAME CODE **/

document.addEventListener("keydown", changeDirection)

// Get the canvas element
var gameCanvas = document.getElementById("gameCanvas");
// Return a two dimensional drawing context
var ctx = gameCanvas.getContext("2d");
//  Select the colour to fill the canvas
ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
//  Select the colour for the border of the canvas
ctx.strokestyle = CANVAS_BORDER_COLOUR;
// Draw a "filled" rectangle to cover the entire canvas
ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
// Draw a "border" around the entire canvas
ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);

// Check browser support for Storage
if (typeof(Storage) !== "undefined") {
    // Retrieve best score
    bestScore = localStorage.getItem("bestScore");
    document.getElementById("bestScore").innerHTML = 'Best score: ' + (bestScore || 0);
}

createFood();
main();



/** FUNCTIONS **/

/**
* Advances the snake by changing the x-coordinates of its parts
* according to the horizontal velocity and the y-coordinates of its parts
* according to the vertical veolocity
*/
function advanceSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    // check if head is touching food
    const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
    const didEatBadFood = snake[0].x === badFoodX && snake[0].y === badFoodY;
    if (didEatFood) {
        score += 1;
        document.getElementById('score').innerHTML = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", score);
            document.getElementById("bestScore").innerHTML = 'Best score: ' + bestScore;
        }

        if (score == 5)
            GAME_SPEED = GAME_SPEED_CONST * 0.9;
        else if (score == 10)
            GAME_SPEED = GAME_SPEED_CONST * 0.8;
        else if (score == 15)
            GAME_SPEED = GAME_SPEED_CONST * 0.7;
        else if (score == 20)
            GAME_SPEED = GAME_SPEED_CONST * 0.6;
        else if (score == 30)
            GAME_SPEED = GAME_SPEED_CONST * 0.5;

        createFood(); // create new food and dont pop snake's elemnet => grow by one
    } else if (didEatBadFood) {
        badFoodCreated = false;
        score -= 2;
        if (score <= 0) {
            score = 0;
            endGame = true;
        }
        document.getElementById('score').innerHTML = score;

        snake.pop();	// take two parts away
        snake.pop();
        snake.pop();
    } else {
        snake.pop();
    }
}

/**
* Draws the snake on the canvas
*/
function drawSnake() {
    // loop through the snake parts drawing each part on the canvas
    snake.forEach(drawSnakePart)
}

/**
* Draws a part of the snake on the canvas
* @param { object } snakePart - The coordinates where the part should be drawn
*/
function drawSnakePart(snakePart, i) {
    if (i == 0) // Draw head
        ctx.fillStyle = SNAKE_HEAD_COLOUR;
    else if (i % 2 == 1)
        ctx.fillStyle = SNAKE_COLOUR1; // Set the colour of the snake part 1
    else
        ctx.fillStyle = SNAKE_COLOUR2; // Set the colour of the snake part 2
    
    // Set the border colour of the snake part
    ctx.strokeStyle = SNAKE_BORDER_COLOUR;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
    // Draw a border around the snake part
    ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

/**
* addEventListener on document
*/
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const ENTER_KEY = 13;

    const keyPressed = event.keyCode;
    const goingUp = dy === -10;
    const goingDown = dy === 10;
    const goingRight = dx === 10;
    const goingLeft = dx === -10;

    if (keyPressed === ENTER_KEY) // Restart game (refresh page)
        window.location.reload();

    if (changingDirection) return; // return if we try change direction too quickly (before GAME_SPEED)

    changingDirection = true;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -10;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -10;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 10;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 10;
    }
}

function clearCanvas() {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
    ctx.strokeStyle = CANVAS_BORDER_COLOUR;

    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function main() {
    if (didGameEnd()) {
        document.getElementById('theEnd').style.visibility = 'visible';
        ctx.fillStyle = CANVAS_END_GAME_BACKGROUND_COLOUR;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawFood();
        drawBadFood();
        drawSnake();
        return;
    }

    setTimeout(function onTick() {
        changingDirection = false;
        clearCanvas();
        drawFood();

        if (!badFoodCreated) {
            createBadFood();
                                
        }
        drawBadFood();	

        advanceSnake();
        drawSnake();

        // Call main again
        main();
    }, GAME_SPEED)
}

//* CREATE FOOD
function randomTen(min, max) {
    return Math.round((Math.random() * (max-min) + min) / 10) * 10;
}

function createFood() {
    foodX = randomTen(0, gameCanvasWidth - 10);
    foodY = randomTen(0, gameCanvasHeight - 10);

    snake.forEach(function isFoodOnSnake(part) {
        const foodIsOnSnake = part.x == foodX && part.y == foodY
        if (foodIsOnSnake)
            createFood();
    });
}

function drawFood() {
    ctx.beginPath();
    ctx.arc(foodX + 5, foodY + 5, 5, 0, 2 * Math.PI, false);				
    ctx.fillStyle = FOOD_COLOUR;
    ctx.strokestyle = FOOD_BORDER_COLOUR;
    ctx.fill();
    ctx.stroke();
}

function createBadFood() {
    if (!badFoodCreated) {
        badFoodX = randomTen(0, gameCanvasWidth - 10);
        badFoodY = randomTen(0, gameCanvasHeight - 10);

        snake.forEach(function isFoodOnSnake(part) {
            const foodIsOnSnake = part.x == badFoodX && part.y == badFoodY;
            const badFoodOnGoodFood = badFoodX == foodX ||badFoodY == foodY;
            if (foodIsOnSnake || badFoodOnGoodFood)
                createBadFood();
        });
        badFoodCreated = true;
    }
}

function drawBadFood() {
    ctx.beginPath();
    ctx.arc(badFoodX + 5, badFoodY + 5, 5, 0, 2 * Math.PI, false);				
    ctx.fillStyle = BAD_FOOD_COLOUR;
    ctx.strokestyle = FOOD_BORDER_COLOUR;
    ctx.fill();
    ctx.stroke();
}

function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y;

        if (didCollide)
            return true
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > gameCanvas.width - 10;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > gameCanvas.height - 10;

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall ||endGame
}