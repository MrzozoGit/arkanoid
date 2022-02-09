class Entity {
    constructor(posx, posy, height, width, speed, health) {
        this.posx = posx;
        this.posy = posy;
        
        this.height = height;
        this.width = width;

        this.speed = speed;
        this.health = health;

        this.isAlive = true;
    }

    collision = function(posx, posy) {
        return posx >= this.posx && posx <= this.posx+this.width && posy >= this.posy && posy <= this.posy+this.height;
    }

    damage = function(amount) {
        this.health -= amount;
        if(this.health == 0)
            this.isAlive = false;
    }
}

class Player extends Entity {
    constructor(posx, posy, height, width, speed, health) {
        super();

        this.height = 10;
        this.width = 100;

        this.posx = (V.gameContainerWidth / 2) - (this.width / 2);
        this.posy = V.gameContainerHeight - this.height - 25;

        this.speed = 25;

        this.health = 3;

        this.bonus = [];
        this.malus = [];
    }

    // Check if collide on left side of game screen, then move
    moveLeft = function() {
        if(this.posx - this.speed >= 0)
            this.posx -= this.speed;
    }

    // Check if collide on right side of game screen, then move
    moveRight = function() {
        if(this.posx + this.speed + this.width <= V.gameContainerWidth)
            this.posx += this.speed;
    }
}

class Ball extends Entity {
    constructor() {
        super();

        this.height = 20;
        this.width = 20;
        this.radius = 10;

        this.posx = (V.gameContainerWidth / 2) - (this.width / 2);
        this.posy = V.gameContainerHeight - this.height - 50;

        this.isLaunched = false;

        this.speedx = 5;
        this.speedy = -5;
    }

    // Move the ball
    move = function() {
        this.posx += this.speedx;
        this.posy += this.speedy;
    }

    // Launch the ball
    launch = function() {
        this.isLaunched = true;
    }

    // Check if ball collide with walls
    checkWallCollision = function() {
        if (this.posx + this.speedx > V.gameContainerWidth - this.width || this.posx + this.speedx < 0) {
            this.speedx = -this.speedx;
        }
        
        if (this.posy + this.speedy < 0) {
            this.speedy = -this.speedy;
        }

        if (this.posy + this.speedy > V.gameContainerHeight - this.height) {
            this.isAlive = false;
        }
    }

    // Check if ball collide with player
    checkPlayerCollision = function(player) {
        if ((this.posy + this.speedy > player.posy - player.height - this.height/2) && (this.posx > player.posx && this.posx < player.posx + player.width)) {
            this.speedy = -this.speedy;
        }
    }

    // Reset ball properties after loosing a life
    resetBall = function(player) {
        //// Maybe put this in the constructor to have a "better" more dynamic instanciation ////
        this.posx = player.posx + (player.width / 2) - (this.width / 2);
        this.posy = V.gameContainerHeight - this.height - 50;

        this.speedx = 5;
        this.speedy = -5;

        this.isLaunched = false;
        this.isAlive = true;
    }
}

class Brick extends Entity {}

class Item extends Entity {}

class Bonus extends Item {}

class Malus extends Item {}

class Levelmap {
    constructor() {
        this.tileWidth = 64;
        this.tileHeight = 30;
        this.cols = V.gameContainerWidth/this.tileWidth;
        this.rows = V.gameContainerHeight/this.tileHeight;

        // TEST LEVEL
        this.testLevel = {
            name: "level test",
            map: []
        }

        // Get levels maps from json file
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.status == 200 && xhr.readyState == 4) {
                // console.log(JSON.parse(xhr.responseText));
                this.levels = JSON.parse(xhr.responseText);
            }
        }
        xhr.open('get', './levels.json')
        xhr.send();
    }
}

var M = {
    levelmap: null,
    player: null,
    ball: null,
    level: null,
    bonus: null,
    malus: null,

    levelDictionnary: {
        1: "basicBrick",
        2: "twohitBrick",
        3: "threehitBrick",
        10: "unbreackableBrick"
    },

    init: function() {
        // Instantiate the levelmap
        M.levelmap = new Levelmap();

        this.gameStart();
    },

    gameStart: function() {
        // Instantiate the player
        M.player = new Player();

        // Instantiate the ball
        M.ball = new Ball();
    },

    checkPlayerBallCollision: function() {
        if(M.player.collision(M.ball.posx, M.ball.posy)) {
            M.ball.speedy = -M.ball.speedy;
        }
    }
}

var C = {
    gameloopId: undefined,
    gamestate: 0,

    gamestateDictionnary: {
        0: "load",
        1: "builmap",
        2: "game",
        3: "pause",
        10: "menu",
        11: "levelmenu",
        12: "menumap"
    },

    init: function() {
        V.init();
        M.init();
        C.globalHandlerControl();
        C.gameloop();
    },

    gameloop: function() {
        gameLoopId = window.requestAnimationFrame(C.gameloop);

        // Move entities & Check collisions
        if(M.ball.isLaunched && M.ball.isAlive) {
            M.ball.checkWallCollision();
            M.ball.checkPlayerCollision(M.player);
            M.ball.move();
        } else if (!M.ball.isAlive) {
            M.player.health -= 1;
            if (M.player.health == 0) {
                // TD/ Switch to Game Over screen state
                window.alert("Game Over!");
                window.cancelAnimationFrame(gameLoopId);
            }
            M.ball.resetBall(M.player);
        }

        // Duplicate model dataset for view
        modelDataset = { player: M.player, ball: M.ball };

        // Clear game container
        V.clear();

        // Render view
        V.renderAll(modelDataset);
    },

    globalHandlerControl: function() {
        window.addEventListener("keydown", ev => {
            switch(ev.code) {
                case 'ArrowLeft':
                    M.player.moveLeft();
                    if(!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
                    break;
                
                case 'ArrowRight':
                    M.player.moveRight();
                    if(!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
                    break;

                case 'Space':
                    M.ball.launch();
                    break;
                
                case 'Enter':
                    // Start the level
            }
        });
    },
}

var V = {
    gameContainer: undefined,
    gameContainerWidth: undefined,
    gameContainerHeight: undefined,
    healthAmountContainer: undefined,

    init: function() {
        V.gameContainer = document.querySelector(".game-container");
        V.healthAmountContainer = document.querySelector(".healthamount");
        V.gameContainerWidth = V.gameContainer.offsetParent.clientWidth;
        V.gameContainerHeight = V.gameContainer.offsetParent.clientHeight;
    },

    clear: function() {
        V.gameContainer.innerHTML = "";
    },

    renderAll: function(modelDataset) {
        // Render player
        V.renderPlayer(modelDataset.player);

        // Render player health
        V.renderHealth(modelDataset.player.health);

        // Render ball
        V.renderBall(modelDataset.ball);
    },

    renderPlayer: function(player) {
        var playerDiv = document.createElement("div");

        playerDiv.style.position = "absolute";
        playerDiv.style.left = player.posx + "px";
        playerDiv.style.top = player.posy + "px";
        playerDiv.style.width = player.width + "px";
        playerDiv.style.height = player.height + "px";
        playerDiv.classList.add("player");

        V.gameContainer.append(playerDiv);
    },

    renderBall: function(ball) {
        var ballDiv = document.createElement("div");

        ballDiv.style.position = "absolute";
        ballDiv.style.left = ball.posx + "px";
        ballDiv.style.top = ball.posy + "px";
        ballDiv.style.width = ball.width + "px";
        ballDiv.style.height = ball.height + "px";
        ballDiv.style.borderRadius = ball.radius + "px";
        ballDiv.classList.add("ball");

        V.gameContainer.append(ballDiv);
    },

    renderHealth: function(health) {
        V.healthAmountContainer.textContent = health;
    }
}

C.init();