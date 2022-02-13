// TD/ Gérer les gamestate
// TD/ Gérer le chagement de niveaux
// TD/ Gérer les bonus
// TD/ Gérer les malus

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

    checkBricksCollision = function(bricks) {
        bricks.forEach(brick => {
            // Check if collide
            if (this.posx + this.speedx < brick.posx + brick.width &&
                this.posx + this.width + this.speedx > brick.posx &&
                this.posy + this.speedy < brick.posy + brick.height &&
                this.height + this.posy + this.speedy > brick.posy) {
                    // Collide from left or right
                    if (this.posx + this.width - this.speedx <= brick.posx || this.posx - this.speedx >= brick.posx + brick.width) {
                        this.speedx = -this.speedx;
                    // Collide from above or below
                    } else { 
                        this.speedy = -this.speedy;
                    }
                    brick.health -= 1;
                    if (brick.health == 0) brick.isAlive = false;
            }
        })
    }

    // Reset ball properties after loosing a life
    resetBall = function(player) {
        // TD/ Maybe put this in the constructor to have a "better" more dynamic instanciation //
        this.posx = player.posx + (player.width / 2) - (this.width / 2);
        this.posy = V.gameContainerHeight - this.height - 50;

        this.speedx = 5;
        this.speedy = -5;

        this.isLaunched = false;
        this.isAlive = true;
    }
}

class Brick extends Entity {
    constructor(type, tileHeight, tileWidth, col, row, health, color) {
        super();

        this.height = tileHeight;
        this.width = tileWidth;

        this.posx = col * tileWidth;
        this.posy = row * tileHeight;

        this.health = health;

        this.color = color;
        this.type = type;
    }
}

class Item extends Entity {}

class Bonus extends Item {}

class Malus extends Item {}

class Levelmap {
    constructor() {
        this.tileWidth = 64;
        this.tileHeight = 30;
        this.cols = V.gameContainerWidth/this.tileWidth;
        this.rows = 15;

        // TEST LEVEL
        this.testLevel = {
            name: "level test",
            map: [  
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3],
                    [0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0],
                    [1,1,1,1,1,10,1,0,0,1,1,1,1,1,0,0],
                    [1,1,1,1,1,1,1,0,0,10,1,1,1,1,0,0],
                    [1,1,1,1,1,1,1,0,0,10,1,10,1,1,0,0],
                    [1,1,10,10,10,1,10,0,0,10,1,1,1,1,0,0],
                ]
        }

        // Get levels maps from json file
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.status == 200 && xhr.readyState == 4) {
                // console.log(JSON.parse(xhr.responseText));
                this.bonj = "onk"
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
        "empty": 0,
        "basicBrick": 1,
        "twohitBrick": 2,
        "threehitBrick": 3,
        "unbreackableBrick": 10
    },

    sprites: [],

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

        // Build the map
        M.buildMap(M.levelmap.testLevel);
    },

    // checkPlayerBallCollision: function() {
    //     if(M.player.collision(M.ball.posx, M.ball.posy)) {
    //         M.ball.speedy = -M.ball.speedy;
    //     }
    // },

    // Create Bricks and push them into sprites array to render
    spritePusher: function (tileName, col, row, health, color) {
        tileName = new Brick(tileName, M.levelmap.tileHeight, M.levelmap.tileWidth, col, row, health, color);
        M.sprites.push(tileName);
    },

    // Build map
    buildMap: function (map) {
        // Go througth level map
        for (let row = 0; row < M.levelmap.rows; row++) {
            for (let col = 0; col < M.levelmap.cols; col++) {
                let currentTile = map.map[row][col];

                // Create Bricks
                switch (currentTile) {
                    case M.levelDictionnary['empty']:
                        break
                    
                    // BRICKS
                    case M.levelDictionnary['basicBrick']:
                        M.spritePusher('basic', col, row, 1, 'red');
                        break

                    case M.levelDictionnary['twohitBrick']:
                        M.spritePusher('twohit', col, row, 2, 'yellow');
                        break

                    case M.levelDictionnary['threehitBrick']:
                        M.spritePusher('threehit', col, row, 3, 'green');
                        break

                    case M.levelDictionnary['unbreackableBrick']:
                        M.spritePusher('unbreackable', col, row, -1, 'grey');
                        break
                }
            }
        }
    },

    updateSprites: function() {
        // Filter bricks
        M.sprites = M.sprites.filter( function(sprite){ return sprite.isAlive==true;} );

        // Set bricks type & colors
        M.sprites.forEach(sprite => {
            switch (sprite.health) {
                case 1: sprite.type = 'basic'; break;
                case 2: sprite.type = 'twohit'; break;
                case 3: sprite.type = 'threehit'; break;
            }
        })
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

        // Filter & update elements
        M.updateSprites();

        // Move entities & Check collisions
        if(M.ball.isLaunched && M.ball.isAlive) {
            M.ball.checkWallCollision();
            M.ball.checkPlayerCollision(M.player);
            M.ball.checkBricksCollision(M.sprites);
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
        modelDataset = { player: M.player, ball: M.ball, map: M.sprites };

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

        // Render map
        V.renderMap(modelDataset.map);
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
    },

    renderMap: function (sprites) {
        sprites.forEach(sprite => {
            var brickDiv = document.createElement("div");

            brickDiv.style.position = "absolute";
            brickDiv.style.left = sprite.posx + "px";
            brickDiv.style.top = sprite.posy + "px";
            brickDiv.style.width = sprite.width - 4 + "px";
            brickDiv.style.height = sprite.height - 4 + "px";
            brickDiv.classList.add(sprite.type);

            V.gameContainer.append(brickDiv);
        })
    },
}

C.init();