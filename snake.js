/* CONSTANTS AND GLOBAL VARIABLES */
const GAME_SPEED_CONST = 80;
var GAME_SPEED = GAME_SPEED_CONST;
const SNAKE_PART_SIZE = 20;
const CANVAS_BORDER_COLOUR = 'black';
const CANVAS_BACKGROUND_COLOUR = "#a2d483";
const CANVAS_END_GAME_BACKGROUND_COLOUR = '#ff9e9e';
const SNAKE_HEAD_COLOUR = '#174f21';
const SNAKE_COLOUR1 = 'LimeGreen';
const SNAKE_COLOUR2 = 'LimeGreen';
const SNAKE_BORDER_COLOUR = 'darkgreen';
const FOOD_COLOUR = 'gold';
const BAD_FOOD_COLOUR = 'red';
const DEADLY_FOOD_COLOUR = 'black';
const FOOD_BORDER_COLOUR = 'red';
const gameCanvasWidth = document.getElementById("gameCanvas").width;
const gameCanvasHeight = document.getElementById("gameCanvas").height;

var badFoodCreated = false;
var deadlyFoodCreated = false;
var foodX = -1;
var foodY = -1;
var deadlyFoodX = -100;
var deadlyFoodY = -100;
var nbOfBadFood = 1;
var badFood_arr = [];
var endGame = false;

let snake = [
    {x: (gameCanvasWidth / 2),                          y: gameCanvasHeight / 2},
    {x: (gameCanvasWidth / 2) - SNAKE_PART_SIZE,        y: gameCanvasHeight / 2},
    {x: (gameCanvasWidth / 2) - SNAKE_PART_SIZE * 2,    y: gameCanvasHeight / 2},
    {x: (gameCanvasWidth / 2) - SNAKE_PART_SIZE * 3,    y: gameCanvasHeight / 2},
    {x: (gameCanvasWidth / 2) - SNAKE_PART_SIZE * 4,    y: gameCanvasHeight / 2}
];

let score = 0; // Game score
let changingDirection = false; // When set to true the snake is changing direction
let dx = SNAKE_PART_SIZE; // Horizontal velocity
let dy = 0; // Vertical velocity

var soundOn;
var sounds =
	{
		hurt: {
			sound: new Howl({
                urls: ['sounds/hurt.wav']
			})
		},
		pickup: {
			sound: new Howl({
				urls: ['sounds/pickup.wav'],
                volume: 0.7
			})
        },
        gameOver: {
			sound: new Howl({
				urls: ['sounds/gameOver.wav']
			})
        },
        turn: {
			sound: new Howl({
				urls: ['sounds/turn.wav']
			})
		}
	};

/** MAIN PART OF THE GAME CODE **/

// Check browser support for Storage
if (typeof(Storage) !== "undefined") {
    // Retrieve best score
    bestScore = localStorage.getItem("bestScore");
    document.getElementById("bestScore").innerHTML = 'BEST SCORE: ' + (bestScore || 0);

    // retrieve sound settings
    soundOn = localStorage.getItem("soundOn") == null ? true : localStorage.getItem("soundOn");
} 

$(function() {
    if (soundOn === true || soundOn === "true") {
        if ($("#volume").hasClass('fa-volume-off')) {
            $("#volume").removeClass('fa-volume-off').addClass('fa-volume-up');
        }
    }
    else {
        if ($("#volume").hasClass('fa-volume-up')) {
            $("#volume").removeClass('fa-volume-up').addClass('fa-volume-off');
        }
    }

	$('#volume').on('click', function() {
		if ($(this).hasClass('fa-volume-up')) {
			$(this).removeClass('fa-volume-up').addClass('fa-volume-off');
            soundOn = false;
            localStorage.setItem("soundOn", soundOn);
		} else if ($(this).hasClass('fa-volume-off')) {
			$(this).removeClass('fa-volume-off').addClass('fa-volume-up');
            soundOn = true;
            localStorage.setItem("soundOn", soundOn);
		}
	});
})

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

    // Check if head is touching food
    var didEatFood = snake[0].x === foodX && snake[0].y === foodY;
    var didEatBadFood = false;
    badFood_arr.forEach(function checkBadFood(bFood) {
        if (snake[0].x === bFood[0] && snake[0].y === bFood[1])
            didEatBadFood = true;
    });    

    if (didEatFood) {
        score += 1;
        document.getElementById('score').innerHTML = score;

        if (soundOn === true || soundOn === "true")
            sounds.pickup.sound.play();

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", score);
            document.getElementById("bestScore").innerHTML = 'BEST SCORE: ' + bestScore;
        }
        
        switch (getLevel()) {
            case 1:
                GAME_SPEED = GAME_SPEED_CONST;
                break;
            case 2:
                GAME_SPEED = GAME_SPEED_CONST * 0.8;
                nbOfBadFood = 2;
                badFoodCreated = false;
                createBadFood();
                break;
            case 3:
                GAME_SPEED = GAME_SPEED_CONST * 0.7;
                if (!deadlyFoodCreated) {
                    createDeadlyFood();
                    drawDeadlyFood();
                }
                break;
            case 4:
                GAME_SPEED = GAME_SPEED_CONST * 0.65;
                nbOfBadFood = 3;
                badFoodCreated = false;
                createBadFood();
                break;
            case 5:
                GAME_SPEED = GAME_SPEED_CONST * 0.6;
                nbOfBadFood = 4;
                badFoodCreated = false;
                createBadFood();
                break;
            case 6:
                GAME_SPEED = GAME_SPEED_CONST * 0.55;
                nbOfBadFood = 5;
                badFoodCreated = false;
                createBadFood();
                break;
            case 7:
                GAME_SPEED = GAME_SPEED_CONST * 0.50;
                nbOfBadFood = 6;
                badFoodCreated = false;
                createBadFood();
                break;
            case 8:
                GAME_SPEED = GAME_SPEED_CONST * 0.45;
                break;
            case 9:
                GAME_SPEED = GAME_SPEED_CONST * 0.4;
                break;
            default:
                GAME_SPEED = GAME_SPEED_CONST;
        }        

        createFood(); // create new food and dont pop snake's element => grow by one
    } else if (didEatBadFood) {
        badFoodCreated = false;
        score -= 2;
        badFood_arr = removeFood(badFood_arr, snake[0].x, snake[0].y);

        if (soundOn === true || soundOn === "true")
            sounds.hurt.sound.play();

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
    // Uncomment this, and comment gradient part, if you want more static look of the snake.
    // if (i == 0) // Draw head
    //     ctx.fillStyle = SNAKE_HEAD_COLOUR;
    // else if (i % 2 == 1)
    //     ctx.fillStyle = SNAKE_COLOUR1; // Set the colour of the snake part 1
    // else
    //     ctx.fillStyle = SNAKE_COLOUR2; // Set the colour of the snake part 2

    var gradient = ctx.createLinearGradient(0, 0, 400, 400);
    // Add three color stops
    gradient.addColorStop(0, 'green');
    gradient.addColorStop(.5, '#e5e515');
    gradient.addColorStop(1, 'green');
    ctx.fillStyle = gradient;
    
    // Set the border colour of the snake part
    ctx.strokeStyle = SNAKE_BORDER_COLOUR;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    ctx.fillRect(snakePart.x, snakePart.y, SNAKE_PART_SIZE, SNAKE_PART_SIZE);
    // Draw a border around the snake part
    ctx.strokeRect(snakePart.x, snakePart.y, SNAKE_PART_SIZE, SNAKE_PART_SIZE);
}

/**
* addEventListener on document
*/
function changeDirection(event) {
    // IMPORTANT! If you use arrow keys then sounds don't work due to play method is not allowed by the user agent or the platform in the current context, possibly because the user denied permission
    // const LEFT_KEY = 37;    // A 65
    // const RIGHT_KEY = 39;   // D 68
    // const UP_KEY = 38;      // W 87
    // const DOWN_KEY = 40;    // S 83

    const ENTER_KEY = 13;
    const SHIFT_KEY = 16;
    const LEFT_KEY = 65;    // A 65
    const RIGHT_KEY = 68;   // D 68
    const UP_KEY = 87;      // W 87
    const DOWN_KEY = 83;    // S 83

    const keyPressed = event.keyCode;
    const goingUp = dy === -SNAKE_PART_SIZE;
    const goingDown = dy === SNAKE_PART_SIZE;
    const goingRight = dx === SNAKE_PART_SIZE;
    const goingLeft = dx === -SNAKE_PART_SIZE;    

    if (keyPressed === ENTER_KEY || keyPressed === SHIFT_KEY) // Restart game (refresh page)
        window.location.reload();

    if (changingDirection) return; // return if we try change direction too quickly (before GAME_SPEED)

    if (soundOn === true || soundOn === "true")
        sounds.turn.sound.play();

    changingDirection = true;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -SNAKE_PART_SIZE;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -SNAKE_PART_SIZE;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = SNAKE_PART_SIZE;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = SNAKE_PART_SIZE;
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
        if (soundOn === true || soundOn === "true")
            sounds.gameOver.sound.play();
    
        document.getElementById('theEnd').style.visibility = 'visible';
        ctx.fillStyle = CANVAS_END_GAME_BACKGROUND_COLOUR;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawFood();
        drawBadFood();
        drawDeadlyFood();
        drawSnake();
        return;
    }

    setTimeout(function onTick() {
        changingDirection = false;
        clearCanvas();
        drawFood();

        if (!badFoodCreated)
            createBadFood();

        drawBadFood();
        drawDeadlyFood();	
        advanceSnake();
        drawSnake();

        main(); // Call main again
    }, GAME_SPEED)
}

//* CREATE FOOD
function randomNum(min, max) {
    return Math.round((Math.random() * (max-min) + min) / SNAKE_PART_SIZE) * SNAKE_PART_SIZE;
}

function createFood() {
    foodX = randomNum(0, gameCanvasWidth - SNAKE_PART_SIZE);
    foodY = randomNum(0, gameCanvasHeight - SNAKE_PART_SIZE);

    var goodFoodIsOnBadFood = false;
    badFood_arr.forEach(function checkBadFood(bFood) {
        if (foodX === bFood[0] && foodY === bFood[1])
            goodFoodIsOnBadFood = true;
    });
    
    var goodFoodIsOnDeadlyFood = foodX == deadlyFoodX && foodY == deadlyFoodY;

    snake.forEach(function isFoodOnSnake(part) {
        var foodIsOnSnake = part.x == foodX && part.y == foodY

        if (foodIsOnSnake || goodFoodIsOnBadFood || goodFoodIsOnDeadlyFood)
            createFood();
    });
}

function createBadFood() {
    var tmp_badFood_arr = badFood_arr;
    for (var i = 0; tmp_badFood_arr.length < nbOfBadFood && i < 400; i++) {
        if (!badFoodCreated) {
            var badFoodX = randomNum(0, gameCanvasWidth - SNAKE_PART_SIZE);
            var badFoodY = randomNum(0, gameCanvasHeight - SNAKE_PART_SIZE);            
            var badFoodIsOnGoodFood = badFoodX == foodX && badFoodY == foodY;
            var badFoodIsOnDeadlyFood = badFoodX == deadlyFoodX && badFoodY == deadlyFoodY;

            snake.forEach(function isFoodOnSnake(part) {
                var foodIsOnSnake = part.x == badFoodX && part.y == badFoodY;

                if (foodIsOnSnake || badFoodIsOnGoodFood || badFoodIsOnDeadlyFood)
                    createBadFood();
            });

            tmp_badFood_arr.push([badFoodX, badFoodY]);
        }
    }
    badFood_arr = tmp_badFood_arr;
    badFoodCreated = true;
}

function createDeadlyFood() {
    if (!deadlyFoodCreated) {
        deadlyFoodX = randomNum(0, gameCanvasWidth - SNAKE_PART_SIZE);
        deadlyFoodY = randomNum(0, gameCanvasHeight - SNAKE_PART_SIZE);

        var deadlyFoodIsOnBadFood = false;
        badFood_arr.forEach(function checkBadFood(bFood) {
            if (foodX === bFood[0] && foodY === bFood[1])
                goodFoodIsOnBadFood = true;
        });

        var deadlyFoodIsOnGoodFood = deadlyFoodX == foodX && deadlyFoodY == foodY;

        snake.forEach(function isFoodOnSnake(part) {
            var foodIsOnSnake = part.x == deadlyFoodX && part.y == deadlyFoodY

            if (foodIsOnSnake || deadlyFoodIsOnBadFood || deadlyFoodIsOnGoodFood)
                createDeadlyFood();
        });

        deadlyFoodCreated = true;
    }
}

function drawFood() {
    ctx.beginPath();
    ctx.arc(foodX + (SNAKE_PART_SIZE / 2), foodY + (SNAKE_PART_SIZE / 2), (SNAKE_PART_SIZE / 2), 0, 2 * Math.PI, false);				
    ctx.fillStyle = FOOD_COLOUR;
    ctx.strokestyle = FOOD_BORDER_COLOUR;
    ctx.fill();
    ctx.stroke();
}

function drawBadFood() {
    badFood_arr.forEach(function drawBFood(bFood) {
        ctx.beginPath();
        ctx.arc(bFood[0] + (SNAKE_PART_SIZE / 2), bFood[1] + (SNAKE_PART_SIZE / 2), SNAKE_PART_SIZE / 2, 0, 2 * Math.PI, false);				
        ctx.fillStyle = BAD_FOOD_COLOUR;
        ctx.strokestyle = FOOD_BORDER_COLOUR;
        ctx.fill();
        ctx.stroke();
    });
}

function drawDeadlyFood() {
    ctx.beginPath();
    ctx.arc(deadlyFoodX + (SNAKE_PART_SIZE / 2), deadlyFoodY + (SNAKE_PART_SIZE / 2), (SNAKE_PART_SIZE / 2), 0, 2 * Math.PI, false);				
    ctx.fillStyle = DEADLY_FOOD_COLOUR;
    ctx.strokestyle = FOOD_BORDER_COLOUR;
    ctx.fill();
    ctx.stroke();
}

function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y;

        if (didCollide)
            return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > gameCanvas.width - SNAKE_PART_SIZE;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > gameCanvas.height - SNAKE_PART_SIZE;
    const hitDeadlyFood = snake[0].x == deadlyFoodX && snake[0].y == deadlyFoodY;

    if (hitLeftWall || hitRightWall || hitToptWall || hitBottomWall || hitDeadlyFood) {
        if (soundOn === true || soundOn === "true")
            sounds.hurt.sound.play();
    }

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall || hitDeadlyFood || endGame;
}

function playAgain() {
    window.location.reload();
}

function getLevel() {
    var lvl = 1;

    if (score >= 5 && score < 10)
        lvl = 2;
    else if (score >= 10 && score < 15)
        lvl = 3;
    else if (score >= 15 && score < 20)
        lvl = 4;
    else if (score >= 20 && score < 25)
        lvl = 5;
    else if (score >= 25 && score < 30)
        lvl = 6;
    else if (score >= 30 && score < 35)
        lvl = 7;
    else if (score >= 35 && score < 40)
        lvl = 8;
    else if (score >= 40)
        lvl = 9;

    return lvl;
}

function removeFood(arr, x, y) {
    var index = -1;
    for (var k = 0; k < arr.length; k++){
        if (arr[k][0] == x && arr[k][1] == y){
            index = k;
            break;
        }
    }

    var spl = arr.splice(index, 1); // This has to be like this! Do not do return arr.splice(index, 1);!
    return arr;
}