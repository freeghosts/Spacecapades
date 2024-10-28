/******** 
 * Intermediate Web Programming
 * 
 * Filename:	game_functions.js
 * Date:	4.27.2017
 * Updated:	10.28.2024
 * Description:	JavaScript for Spacecapades/index.html
 ********/


addEvent(window, 'load', initPage, false);

function addEvent(object, evName, fnName, cap) {
if (object.attachEvent)
    object.attachEvent("on" + evName, fnName);
else if (object.addEventListener)
    object.addEventListener(evName, fnName, cap);
}

//access menu screens
var main = document.getElementById('main');
var menu = document.getElementById('menu');
var controller = document.getElementById('controller');
var credits = document.getElementById('credits');

// display main menu on page load
function initPage() {
	show(main);
}

// add click events to buttons
document.querySelectorAll('.play')[0].addEventListener('click', function() {
	hide(menu);
	startGame();
});

document.querySelectorAll('.controls')[0].addEventListener('click', function() {
	hide(menu);
	show(controller);
});

document.querySelectorAll('.back1')[0].addEventListener('click', function() {
	hide(controller);
	show(menu);
});

document.querySelectorAll('.credits')[0].addEventListener('click', function() {
	hide(menu);
	show(credits);
});

document.querySelectorAll('.back2')[0].addEventListener('click', function() {
	hide(credits);
	show(menu);
});

//hide element
function hide(el) {
	el.style.display = 'none';
}

//show element
function show(el) {
	el.style.display = 'block';
}

// game objects
var background;
var city;
var hero;	// player object
var score;
var gameOver;
var crashSound;	
var obstacleArray = [];	

// create new instances of game objects and start game
function startGame() {
	background = new GameObject(0, 0, 800, 800, 'background', 'images/background.png', 0);
	city = new GameObject(0, 0, 1200, 480, 'background', 'images/skyline.png', 0);
	hero = new GameObject(10, 120, 79, 40, 'player', 'images/ufo.png', 0);
	score = new GameObject(10, 25, '20px', 'Consolas', 'text', '#F9FC06', 0);
	gameOver = new GameObject(250, 150, '60px', 'Consolas', 'text', '#F9FC06', 0);
	crashSound = new Sound('Splat-SoundBible.com-1826190667.mp3');
	
	gameArea.start();
}

var gameArea = {
	start : function() {
		// set up canvas for drawing
		this.canvas = document.getElementById('gameCanvas');
		this.context = this.canvas.getContext('2d');
		// counter variable for frames 
		this.frameNo = 0;
		// run updateGameArea() function every 20th millisecond (50x/second)
		this.interval = setInterval(updateGameArea, 20);
		// add event handlers to key presses to make game interactive
		// use array to support diagonal movement
		// updated 28 Oct 2024 to replace deprecated KeyboardEvent.keyCode with KeyboardEvent.key 
		window.addEventListener('keydown', function(e) {
			gameArea.keys = (gameArea.keys || []);
			gameArea.keys[e.key] = true;
		})
		window.addEventListener('keyup', function(e) {
			gameArea.keys[e.key] = false;
		})
	},
	
	// clear entire canvas
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	// clear interval; used with crashWith function to stop game when game player object collides with obstacles
	stop : function() {
		clearInterval(this.interval);
	}
}

// constructor function for game objects
function GameObject(x, y, width, height, type, source, gravity) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.type = type;
	this.image = new Image();
	this.image.src = source;
	// gravity indicators
	this.gravity = gravity;
	this.gravitySpeed = 0;
	// speed indicators
	this.speedX = 0;
	this.speedY = 0;
	// draw object on canvas
	this.update = function() {
		ctx = gameArea.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		// draw background twice to give illusion of continuous image when panning
		if (this.type == 'background') {
			ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
		}
		if (this.type == 'text') {
			ctx.font = this.width + ' ' + this.height;
			ctx.fillStyle = source;
			ctx.fillText(this.text, this.x, this.y);
		}
	}
	// use speed and gravity indicators to update object's position
    this.newPos = function() {
    	this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed; 
        // loop back to beginning of background
        if (this.type == 'background') {
        	if (this.x == -(this.width)) {
        		this.x = 0;
        	}
        }
        this.hitEdges();
    }
    // detect when player and obstacle objects hit edges or go off-screen
    this.hitEdges = function() {
    	var right, bottom;
    	
    	if (this.type == 'obstacle') {
    		bottom = gameArea.canvas.height + this.height;
    		// stop obstacle's movement when it goes off-screen
    		if (this.y > bottom) {
    			this.speedX = 0;
    			this.speedY = 0;
    		}
    	}
    	if (this.type == 'player') {
    		right = gameArea.canvas.width - this.width;
    		bottom = gameArea.canvas.height - this.height;
    		// prevent player from going off-screen
    		if (this.x < 0) {
    			this.x = 0;
    		}
    		if (this.x > right) {
    			this.x = right;
    		}
    		if (this.y < 0) {
    			this.y = 0;
    		}
    		if (this.y > bottom) {
    			this.y = bottom;
    		}
    	}
    }
    // detect if one object collides with another
	this.crashWith = function(otherObj) {
		var left = this.x + (this.width/8);
		var right = (this.x + (this.width)) - (this.width/8);
		var top = this.y + (this.height/2);
		var bottom = (this.y + (this.height)) - (this.height/2);
		var otherLeft = otherObj.x;
		var otherRight = otherObj.x + (otherObj.width);
		var otherTop = otherObj.y;
		var otherBottom = otherObj.y + (otherObj.height);
		var crash = true;
		if ((bottom < otherTop) || 
				(top > otherBottom) || 
				(right < otherLeft) || 
				(left > otherRight)) {
			crash = false;
		}
		return crash;
	}
}

//constructor function for sound effect(s)
function Sound(source) {
	this.sound = document.createElement('audio');
	this.sound.src = source;
	this.sound.setAttribute('preload', 'auto');
	this.sound.setAttribute('controls', 'none');
	this.sound.style.display = 'none';
	document.body.appendChild(this.sound);
	this.play = function() {
		this.sound.play();
	}
	this.stop = function() {
		this.sound.pause();
	}
}

function updateGameArea() {
	// variables for randomizing obstacles (asteroids)
	var x1, x2, minX, maxX, w1, w2, w3, w4, minWidth, maxWidth;
	
	// check if player object has crashed with obstacle
	for (var i=0; i<obstacleArray.length; i+=1) {
		if (hero.crashWith(obstacleArray[i])) {
			// play crash sound
			crashSound.play();
			// draw game over text on canvas 
			gameOver.text = 'GAME OVER!';
			gameOver.update();
			// stop game
			gameArea.stop();
			return;
		}
	}
	
	// clear canvas before redrawing game objects 
	gameArea.clear();
	
	// update background position and redraw it
	background.speedX = -1;	
	background.newPos();
	background.update();
	
	// update city position and redraw it
	city.speedX = -1.5;	
	city.newPos();
	city.update();
	
	// update frame number
	gameArea.frameNo += 1;
	
	// add obstacles every 150th frame
	if (gameArea.frameNo == 1 || everyInterval(150)) {
		// randomize obstacle's x-coordinate
		minX = 30;
		maxX = gameArea.canvas.width;
		x1 = Math.floor(Math.random() * (maxX-minX+1) + minX);
		x2 = Math.floor(Math.random() * (maxX-minX+1) + minX);
		
		// randomize obstacle's size
		minWidth = 30;
		maxWidth = 75;
		w1 = Math.floor(Math.random() * (maxWidth-minWidth+1) + minWidth);
		w2 = Math.floor(Math.random() * (maxWidth-minWidth+1) + minWidth);
		w3 = Math.floor(Math.random() * (maxWidth-minWidth+1) + minWidth);
		w4 = Math.floor(Math.random() * (maxWidth-minWidth+1) + minWidth);
		
		// add new obstacles to array
		obstacleArray.push(new GameObject(x1, -75, w1, w1, 'obstacle', 'images/asteroid.png', 0.05));	
		obstacleArray.push(new GameObject(x2, -75, w2, w2, 'obstacle', 'images/asteroid.png', 0.04));
		obstacleArray.push(new GameObject(x1+x2, -75, w3, w3, 'obstacle', 'images/asteroid.png', 0.05));
		obstacleArray.push(new GameObject(x1-x2, -75, w4, w4, 'obstacle', 'images/asteroid.png', 0.06));
	}
	
	// update obstacle's position then redraw it on canvas
	for (var i=0; i<obstacleArray.length; i+=1) {
		obstacleArray[i].speedX = -1;
		obstacleArray[i].newPos();
		obstacleArray[i].update();
	}
	
	// stop movement of player object if no keys are pressed
	hero.speedX = 0;
	hero.speedY = 0;
	
	// move player object in appropriate direction based on which key(s) is pressed
	// updated 28 Oct 2024 to replace deprecated KeyboardEvent.keyCode with KeyboardEvent.key 
	if (gameArea.keys && gameArea.keys['ArrowLeft']) {hero.speedX -= 3;}	// move left
    	if (gameArea.keys && gameArea.keys['ArrowRight']) {hero.speedX = 3;}	// move right
    	if (gameArea.keys && gameArea.keys['ArrowUp']) {hero.speedY -= 3;}	// move up
    	if (gameArea.keys && gameArea.keys['ArrowDown']) {hero.speedY = 3;}	// move down
    
    	// add score text to canvas and update score using frameNo
	score.text = 'SCORE: ' + gameArea.frameNo;
	score.update();
    
    	// update player object's position and redraw it
    	hero.newPos();
	hero.update();
}

//execute something at a given frame rate
function everyInterval(n) {
	// returns true if current frame number corresponds with given interval
	if ((gameArea.frameNo / n) % 1 == 0) {
		return true;
	}
	return false;
}
