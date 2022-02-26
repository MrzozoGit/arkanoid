// TD/ Gérer les gamestate
    // CHECK/ menu
    // CHECK/ pause
    // CHECK/ loose
    // CHECK/ win
    // CHECK/ buildmap (gérer le changement de niveaux)
        // CHECK/ bien récup les lvl
        // CHECK/ générer le lvl en fonction du lvl selectionné
        // CHECK/ si loose -> recommencer le même niveau, si win -> on passe au suivant
    // CHECK/ Afficher le menu de win final + retour au menu possible
// CHECK/ Désactiver les controles quand dans les menus
// CHECK/ Augmenter un peu la hitbox du joueur sur les côtés
// CHECK/ Briques bombe -> regarder les mutations sur les ballons
// CHECK/ Gérer les bonus
// CHECK/ Gérer les malus
// CHECK/ Ajouter une couleur aux items
// CHECK/ Fix les déplacements
// CHECK/ Faire plusieurs malus
// CHECK/ Reset les controls inversés lors du game over
// CHECK/ Factoriser et mieux nommer le CSS
// TD/ Faire plusieurs bonus
// TD/ Reset les bonus/malus au game over
// TD/ Clear les timeout des bonus/malus au game over
// TD/ Factoriser le js
// TD/ Commenter le code

// TD/ BONUS -> menu de selection des niveaux
// TD/ BONUS -> musique et sons

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

    damage = function(amount) {
        this.health -= amount;
        if(this.health == 0) {
            this.act();
            this.isAlive = false;
        }        
    }

    act = function() {}
}

class Player extends Entity {
    constructor(posx, posy, height, width, speed, health) {
        super();

        this.height = 10;
        this.width = 100;

        this.posx = (V.gameContainerWidth / 2) - (this.width / 2);
        this.posy = V.gameContainerHeight - this.height - 25;

        this.speed = 6;

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

    // Check if collision with items or ball
    checkCollision = function(collidable) {
        const betterGameplayPadding = 3;
        let speed = 0;

        if (collidable.speedy) speed = collidable.speedy;
        else speed = collidable.speed;

        return ((collidable.posy + speed > this.posy - this.height - collidable.height/2 - betterGameplayPadding)
            && (collidable.posx > this.posx - betterGameplayPadding && collidable.posx < this.posx + this.width + betterGameplayPadding)
            && speed>0)
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
                    brick.damage(1);
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

class BombBrick extends Brick {
    act = function() {
        M.items.push(new Bomb(this.posx, this.posy, 20, 20, 3, 1, 'bomb'));
        this.isAlive = false;
    }
}

class MalusBrick extends Brick {
    act = function() {
        M.items.push(new Malus(this.posx, this.posy, 10, 10, 3, 1, 'malus'));
        this.isAlive = false;
    }
}

class BonusBrick extends Brick {
    act = function() {
        M.items.push(new Bonus(this.posx, this.posy, 10, 10, 3, 1, 'bonus'));
        this.isAlive = false;
    }
}

class Item extends Entity {
    constructor(posx, posy, height, width, speed, health, type) {
        super(posx, posy, height, width, speed, health);
        this.type = type;
    }

    move = function() {
        this.posy += this.speed;
        if (this.posy + this.speed > V.gameContainerHeight - this.height) {
            this.isAlive = false;
        }
    }
}

class Bomb extends Item {
    act = function() {
        M.player.damage(1);
    }
}

class Bonus extends Item {
    constructor(posx, posy, height, width, speed, health, type) {
        super(posx, posy, height, width, speed, health, type);

        // TD/ Faire de nouvelles classes pour chaque bonus/malus avec une fonction act propre, et mettre la selection aléatoire dans BonusBrick/MalusBrick
        const randomNumber = Math.random().toFixed(2) * 100;
        if (randomNumber <= 25) {

            this.act = function() {
                // Increase player width
                M.player.width = M.player.width*2;

                // Wait 20s, then decrease player width
                setTimeout(() => {
                    M.player.width = M.player.width/2;
                }, 20000);
            }

        } else if (randomNumber > 25 && randomNumber <= 50) {

            this.act = function() {
                console.log("bonus 2")
            }

        } else if (randomNumber > 50 && randomNumber <= 75) {

            this.act = function() {
                console.log("bonus 3")
            }

        } else if (randomNumber > 75 && randomNumber <= 100) {

            this.act = function() {
                // Increase player speed
                M.player.speed = M.player.speed*2;

                // Wait 30s, then decrease player speed
                setTimeout(() => {
                    M.player.speed = M.player.speed/2;
                }, 30000);
            }

        }
    }
}

class Malus extends Item {
    constructor(posx, posy, height, width, speed, health, type) {
        super(posx, posy, height, width, speed, health, type);

        const randomNumber = Math.random().toFixed(2) * 100;

        if (randomNumber <= 25) {

            this.act = function() {
                console.log("decrease width");

                M.player.width = M.player.width/2;

                // Wait 20s, then increase player width
                setTimeout(() => {
                    M.player.width = M.player.width*2;
                }, 20000);
            }

        } else if (randomNumber > 25 && randomNumber <= 50) {

            this.act = function() {
                console.log("invert controls")

                // Invert controls
                const tempControl = C.controls[0];
                C.controls[0] = C.controls[1];
                C.controls[1] = tempControl;

                // Wait 15s, then revert controls
                setTimeout(() => {
                    C.controls[1] = C.controls[0];
                    C.controls[0] = tempControl;
                }, 15000);
            }

        } else if (randomNumber > 50 && randomNumber <= 75) {

            this.act = function() {
                console.log("decrease player speed");

                // Decrease player speed
                M.player.speed = M.player.speed*0.6;

                // Wait 30s, then increase player speed
                setTimeout(() => {
                    M.player.speed = M.player.speed/0.6;
                }, 30000);
            }

        } else if (randomNumber > 75 && randomNumber <= 100) {

            this.act = function() {
                console.log("increase ball speed");

                // Increase ball speed
                M.ball.speedx = M.ball.speedx * 1.5;
                M.ball.speedy = M.ball.speedy * 1.5;

                // Wait 20s, then decrease ball speed
                setTimeout(() => {
                    M.ball.speedx = M.ball.speedx / 1.5;
                M.ball.speedy = M.ball.speedy / 1.5;
                }, 30000);
            }
            
        }
    }
}

class Levelmap {
    constructor() {
        this.tileWidth = 64;
        this.tileHeight = 30;
        this.cols = V.gameContainerWidth/this.tileWidth;
        this.rows = 15;

        // Get levels maps from json file
        let levels = null;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.status == 200 && xhr.readyState == 4) {
                levels = JSON.parse(xhr.responseText);
            }
        }
        xhr.open('get', './levels.json', false)
        xhr.send();
        this.levels = levels;
    }
}

var M = {
    levelmap: null,
    player: null,
    ball: null,
    level: 1,

    sprites: [],
    items: [],

    levelDictionnary: {
        "empty": 0,
        "basicBrick": 1,
        "twohitBrick": 2,
        "threehitBrick": 3,
        "unbreackableBrick": 10
    },

    init: function() {
        // Instantiate the levelmap
        M.levelmap = new Levelmap();
    },

    gameStart: function() {
        // Instantiate the player
        M.player = new Player();

        // Instantiate the ball
        M.ball = new Ball();

        // Build the map
        M.buildMap(M.levelmap.levels[M.level]);
    },

    // Create Bricks and push them into sprites array to render
    spritePusher: function (tileName, col, row, health, color) {
        if (tileName != 'unbreackableBrick') {
            const randomNumber = Math.random().toFixed(2) * 100;
            if (randomNumber <= 5) {
                tileName = new BonusBrick(tileName, M.levelmap.tileHeight, M.levelmap.tileWidth, col, row, health, color);
            } else if (randomNumber > 5 && randomNumber <= 10) {
                tileName = new MalusBrick(tileName, M.levelmap.tileHeight, M.levelmap.tileWidth, col, row, health, color);
            } else if (randomNumber > 10 && randomNumber <= 20) {
                tileName = new BombBrick(tileName, M.levelmap.tileHeight, M.levelmap.tileWidth, col, row, health, color);
            } else {
                tileName = new Brick(tileName, M.levelmap.tileHeight, M.levelmap.tileWidth, col, row, health, color);
            }
        }
        
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

    checkPlayerBallCollision: function() {
        if (M.player.checkCollision(M.ball)) {
            console.log("cc")
            M.ball.speedy = -M.ball.speedy;
        }
    },

    // A VERIFIER
    checkPlayerItemsCollision: function() {
        M.items.forEach(item => {
            if (M.player.checkCollision(item)) {
                item.damage(1);
            }
        });
    },

    updatePlayerPosition: function(keys) {
        if (keys.left) {
            M.player.moveLeft();
            if (!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
        }
        if (keys.right) {
            M.player.moveRight();
            if (!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
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
    },

    updateItems: function() {
        M.items = M.items.filter( function(item){ return item.isAlive==true;} );
    },

    moveItems: function() {
        M.items.forEach(item => {
            item.move();
        })
    },

    clearAll: function() {
        // M.player = null;
        // M.ball = null;
        M.items = [];
        M.sprites = [];
    }
}

var C = {
    gameloopId: undefined,
    gamestate: 0,
    controls: ["ArrowLeft", "ArrowRight"],

    keys: {
        left: false,
        right: false,
        space: false
    },

    gamestateDictionnary: {
        "load": 0,
        "builmap": 1,
        "game": 2,
        "pause": 3,
        "loose": 4,
        "win": 5,
        "finalwin": 6,
        "menu": 10,
        "levelmenu": 11,
        "menumap": 12
    },

    init: function() {
        V.init();
        M.init();
        C.gameloop();
    },

    gameloop: function() {
        gameLoopId = window.requestAnimationFrame(C.gameloop);

        // Handling game states
        switch(C.gamestate) {
            case C.gamestateDictionnary['load']:
                console.log('loading...');
                C.gamestate = C.gamestateDictionnary['menu'];
                break;
            
            case C.gamestateDictionnary['menu']:
                break;
            
            case C.gamestateDictionnary['pause']:
                break;
            
            case C.gamestateDictionnary['buildmap']:
                C.controls = ["ArrowLeft", "ArrowRight"];
                V.hideElement(V.menuContainer);
                V.hideElement(V.winContainer);
                V.hideElement(V.looseContainer);
                M.clearAll();
                M.gameStart();
                C.gamestate = C.gamestateDictionnary['game'];
                break;
            
            case C.gamestateDictionnary['levelmenu']:
                break;

            case C.gamestateDictionnary['game']:
                // Filter & update elements
                M.updatePlayerPosition(C.keys);
                M.updateSprites();
                M.updateItems();

                M.moveItems();

                // Move entities & Check collisions
                M.checkPlayerItemsCollision();
                if(M.ball.isLaunched && M.ball.isAlive && M.player.isAlive) {
                    M.ball.checkWallCollision();
                    M.ball.checkBricksCollision(M.sprites);
                    M.checkPlayerBallCollision();
                    M.ball.move();

                    // TD/ mettre dans une fonction checkWin
                    if (M.sprites.length == 0) {
                        // TD/ mettre dans une fonction/ailleurs
                        V.showElement(V.winContainer);
                        if(Object.keys(M.levelmap.levels).length != M.level) {
                            M.level += 1;
                            C.gamestate = C.gamestateDictionnary['win'];
                        } else {
                            C.gamestate = C.gamestateDictionnary['finalwin'];
                        }
                        
                        // TD/ Mettre dans une fonction
                        M.clearAll();
                        V.clearGameView();
                    }
                } else if (!M.ball.isAlive) {
                    M.player.damage(1);
                    M.ball.resetBall(M.player);
                }

                C.isPlayerAlive();

                // Duplicate model dataset for view
                modelDataset = { player: M.player, ball: M.ball, map: M.sprites, items: M.items };

                // Clear game container
                V.clear();

                // Render view
                V.renderAll(modelDataset);
                break;
            
            case C.gamestateDictionnary['loose']:
                break;
            
            case C.gamestateDictionnary['win']:
                break;
            
            case C.gamestateDictionnary['finalwin']:
                V.winTextContainer.textContent = "YOU WON!\nPRESS ENTER TO GO BACK TO MENU";
                break;
        }
    },

    globalHandlerControl: function(ev) {
        let keyState = (ev.type == "keydown") ? true : false

        switch(ev.code) {
            case C.controls[0]:
                C.keys.left = keyState;
                // if (C.gamestate == C.gamestateDictionnary['game']) {
                //     M.player.moveLeft();
                //     if (!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
                // }
                break;
            
            case C.controls[1]:
                C.keys.right = keyState;
                // if (C.gamestate == C.gamestateDictionnary['game']) {
                //     M.player.moveRight();
                //     if (!M.ball.isLaunched) M.ball.posx = M.player.posx + (M.player.width / 2) - (M.ball.width / 2);
                // }
                break;

            case 'Space':
                if (C.gamestate == C.gamestateDictionnary['game']) {
                    M.ball.launch();
                }
                break;
            
            case 'Enter':
                if (C.gamestate == C.gamestateDictionnary['menu']) {
                    C.gamestate = C.gamestateDictionnary['buildmap'];
                } else if (C.gamestate == C.gamestateDictionnary['loose']) {
                    C.gamestate = C.gamestateDictionnary['buildmap'];
                    // V.hideElement(V.looseContainer);
                } else if (C.gamestate == C.gamestateDictionnary['win']) {
                    // TD/ Change level
                    C.gamestate = C.gamestateDictionnary['buildmap'];
                    // V.hideElement(V.winContainer);
                } else if (C.gamestate == C.gamestateDictionnary['finalwin']) {
                    M.level = 1;
                    V.hideElement(V.winContainer);
                    V.showElement(V.menuContainer);
                    C.gamestate = C.gamestateDictionnary['menu'];
                }
                break;
            
            case 'Escape':
                if (C.gamestate == C.gamestateDictionnary['game']) {
                    V.showElement(V.pauseContainer);
                    C.gamestate = C.gamestateDictionnary['pause'];
                } else if (C.gamestate == C.gamestateDictionnary['pause']) {
                    V.hideElement(V.pauseContainer);
                    C.gamestate = C.gamestateDictionnary['game'];
                }
                break;
        }
    },

    isPlayerAlive: function() {
        if (!M.player.isAlive) {
            // TD/ Mettre dans une fonction
            M.clearAll();
            V.clearGameView();

            V.showElement(V.looseContainer);
            C.gamestate = C.gamestateDictionnary['loose'];
        }
    }
}

var V = {
    gameContainer: undefined,
    gameContainerWidth: undefined,
    gameContainerHeight: undefined,
    healthAmountContainer: undefined,
    menuContainer: undefined,
    pauseContainer: undefined,
    looseContainer: undefined,
    winContainer: undefined,
    winTextContainer: undefined,

    init: function() {
        V.gameContainer = document.querySelector(".game-container");
        V.healthAmountContainer = document.querySelector(".healthamount");
        V.gameContainerWidth = V.gameContainer.offsetParent.clientWidth;
        V.gameContainerHeight = V.gameContainer.offsetParent.clientHeight;
        V.menuContainer = document.querySelector(".menu");
        V.pauseContainer = document.querySelector(".pause");
        V.looseContainer = document.querySelector(".loose");
        V.winContainer = document.querySelector(".win");
        V.winTextContainer = document.querySelector(".win__text");

        V.bindEvents();
    },

    clear: function() {
        V.gameContainer.innerHTML = "";
    },

    bindEvents: function() {
        // V.menuContainer.addEventListener("");
        window.addEventListener("keydown", C.globalHandlerControl);
        window.addEventListener("keyup", C.globalHandlerControl);
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

        V.renderItems(modelDataset.items);
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

    renderItems: function(items) {
        items.forEach(item => {
            var itemDiv = document.createElement("div");

            itemDiv.style.position = "absolute";
            itemDiv.style.left = item.posx + "px";
            itemDiv.style.top = item.posy + "px";
            itemDiv.style.width = item.width + "px";
            itemDiv.style.height = item.height + "px";
            itemDiv.style.borderRadius = item.radius + "px";
            itemDiv.classList.add(item.type);

            V.gameContainer.append(itemDiv);
        })
    },

    showElement: function(element) {
        element.style.display = 'flex';
    },

    hideElement: function (element) {
        element.style.display = 'none';
    },

    clearGameView: function() {
        V.gameContainer.innerHTML = "";
    }
}

C.init();