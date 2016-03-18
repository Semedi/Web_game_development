var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 288, sy: 383, w: 142, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 }
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10,
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10,
              B: 75, C: 1, E: 100, missiles: 2  },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10,
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20,
              B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 }
};

var square = 48;

var OBJECT_LOG = 1,
    OBJECT_PLAYER = 2,
    OBJECT_ENEMY = 4,
    WATER = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase()
  var groundLayer = new GameBoard();
  groundLayer.add(new Field());

  Game.setBoard(0, groundLayer);

  Game.setBoard(1,new TitleScreen("Frog","Press 'up' to start", playGame));
};




var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];


/*
*Metodo playgame, inicializa  los board y el escenario de juego
* */
var playGame = function() {

  var gameLayer = new GameBoard();

  gameLayer.add(new Water());
  gameLayer.add(new Log(1,1,1%2));
  gameLayer.add(new Log(2,2,2%2));
  gameLayer.add(new Log(3,3,3%2));
  gameLayer.add(new Frog());

  for (var i = 1; i <=4; i++){
    gameLayer.add(new Car(i,i,i+2,i%2));
  }


  Game.setBoard(1, gameLayer);

  /*
  var board = new GameBoard();
  board.add(new PlayerShip());
  board.add(new Level(level1,winGame));
  Game.setBoard(3,board);
  Game.setBoard(5,new GamePoints(0));
  */
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!",
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(1,new TitleScreen("You lose!",
                                  "Press up to play again",
                                  playGame));
};

/*clases que heredan de sprite(pueden representar niveles, objetos...)
* Practica 2: Frog*/
var Field = function (){

  this.setup('bg',{x:0, y:0});
  this.w = Game.width;
  this.h = Game.height;

  this.step = function(dt){

  };
};
Field.prototype = new Sprite();

var Frog = function(){

    this.setup('frog',{vx:0, vy:0});
    this.x = Game.width/2-15;
    this.y = Game.height - this.h;

    var grounded = true;
    var fixedTime = 0.1050;
    var time = 0;
    var movement = square;


    this.step = function(dt){
        time+=dt;


        if(Game.keys['left'])
          this.vx = -movement;
        else if(Game.keys['right'])
          this.vx = movement;
        else if (Game.keys['up'])
          this.vy = -movement;
        else if (Game.keys['down'])
          this.vy = movement;


        if (time > fixedTime){
          time = 0;
          this.x+=this.vx;
          this.y+=this.vy;
        }

        if(this.x < 0) this.x = 0;
        else if(this.x > Game.width-this.w/2)
          this.x = Game.width-this.w/2;

        if(this.y < 0) this.y = 0;
        else if (this.y > Game.height - this.h)
          this.y = Game.height - this.h;


        this.vx= 0;
        this.vy= 0;

    };

    this.die = function(){
      this.board.add(new Death(this.x + this.w/2,this.y + this.h/2));
      this.board.remove(this);
      setTimeout(loseGame, 1000);

    };

    this.onLog = function(velocity){
      grounded=true;
      this.x+= velocity;
    };

    this.onWater = function(){
      this.die();
    };

    this.isGrounded = function(){
      return grounded;
    };

    this.hit = function(){
      this.die();
    };



};


Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_PLAYER;




/*direction:
*   value 0: hacia la derecha
*   value 1: hacia la izquierda
* */
var Car = function(carType,row, vel, dir){
    var t ="car"+carType;
    this.setup(t,{vx:vel*10, direction:dir});
    this.y=(Game.height-this.h)-row*square;
    this.x=Game.width*dir;

};

/* mecanismo de herencia Javascrit :*/
Car.prototype = new Sprite();

Car.prototype.type = OBJECT_ENEMY;
Car.prototype.step = function(dt){

        var movement = this.vx*dt;
        if (this.direction) movement = -movement;

        this.x += movement;

        //extremo izquierdo
        if(this.x < -this.w) {
          this.x = Game.width;
         }

         //extremo derecho
        else if(this.x > Game.width) {
            this.x = 0-this.w;
        }

        var collision = this.board.collide(this,OBJECT_PLAYER);

        if(collision)
          collision.hit();

};

Car.prototype.hit = function(){

};


var Log = function(vel, row, dir ){

  this.setup('trunk',{vx:vel*10, direction:dir});
  this.y=square*row;
  this.x=Game.width*dir;

};
Log.prototype = new Sprite();
Log.prototype.type = OBJECT_LOG;

Log.prototype.step = function(dt){

  var movement = this.vx*dt;
  if (this.direction) movement = -movement;

  this.x += movement;

  //extremo izquierdo
  if(this.x < -this.w) {
    this.x = Game.width;
   }

   //extremo derecho
  else if(this.x > Game.width) {
      this.x = 0-this.w;
  }
  var collision = this.board.collide(this,OBJECT_PLAYER);

  if(collision)
    collision.onLog(movement, this.x);



};

var Water = function(){
  this.y = square;
  this.w = Game.width;
  this.h = 3*square;
  this.step = function(dt){

    var player = this.board.collide(this,OBJECT_PLAYER);

    if(player && !player.board.collide(player, OBJECT_LOG))
        player.onWater();

  };

  this.draw = function(){};
};

Water.prototype = new Sprite();
Water.prototype.type = WATER;


var Death = function(centerX, centerY){

  this.setup('death', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Death.prototype = new Sprite();

Death.prototype.step = function(dt) {
  this.frame++;
  if(this.frame > 4) {
    this.board.remove(this);
  }
};




/*
 * Fin Espacio de clases (sprites)
 * ********************************************
* */

var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width;
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set,
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.fillRect(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     2,
                     2);
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };

  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

var PlayerShip = function() {
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) {
      this.x = Game.width - this.w;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_LOG;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) {
      this.board.remove(this);
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0,
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75,
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit();
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2,
                                   this.y + this.h/2));
    }
  }
};

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = WATER;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER)
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this);
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
