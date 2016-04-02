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

var square = 48;

var OBJECT_LOG = 1,
    OBJECT_PLAYER = 2,
    OBJECT_ENEMY = 4,
    WATER = 8,
    HOME = 16;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase()
  var groundLayer = new GameBoard();
  groundLayer.add(new Field(), 1);

  Game.setBoard(0, groundLayer);

  Game.setBoard(1,new TitleScreen("Frog","Press 'up' to start", playGame));
};


/*
*Metodo playgame, inicializa  los board y el escenario de juego
* */
var playGame = function() {

  var gameLayer = new GameBoard();

  gameLayer.add(new Home(), 1);
  gameLayer.add(new Water(), 1);

  for (var i = 1; i < 4; i++){

    var prototype = new Log(i,i+3,i%2)
    var spawner = new Log_spawner(prototype, i+5);
    gameLayer.add(prototype, 0);
    gameLayer.add(spawner, 0);
  }

  gameLayer.add(new Frog(), 1);

  for (var i = 1; i <=4; i++){
    prototype = new Car(i,i,i+2,i%2);
    spawner = new Car_spawner(prototype, 4);
    gameLayer.add(prototype, 1)
    gameLayer.add(spawner, 1);
  }


  Game.setBoard(1, gameLayer);

};

var winGame = function() {
  Game.setBoard(1,new TitleScreen("You win!",
                                  "Press up to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(1,new TitleScreen("You lose!",
                                  "Press up to play again",
                                  playGame));
};

/*clases que heredan de sprite(pueden representar niveles, objetos...) **********************************************************************
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

    var type = carType;
    var row = row;
    var vel = vel;
    var dir = dir;

    var t ="car"+carType;

    this.setup(t,{vx:vel*10, direction:dir});
    this.y=(Game.height-this.h)-row*square;
    this.x = (dir) ? Game.width : this.w * (-1);

    this.getType = function(){ return type };
    this.getRow = function(){ return row; };
    this.getVelocity = function(){ return vel; };
    this.getDirection = function(){ return dir; };

};

/* mecanismo de herencia Javascrit :*/
Car.prototype = new Sprite();

Car.prototype.type = OBJECT_ENEMY;
Car.prototype.step = function(dt){

        var movement = this.vx*dt;
        if (this.direction) movement = -movement;

        this.x += movement;


         //extremos
        if(this.x > Game.width || this.x < -this.w)
          this.board.remove(this);


        var collision = this.board.collide(this,OBJECT_PLAYER);

        if(collision)
          collision.hit();

};

Car.prototype.hit = function(){

};


var Log = function(row, vel, dir ){

  var row = row;
  var vel = vel;
  var dir = dir;

  this.setup('trunk',{vx:vel*10, direction:dir});
  this.y=square*row;
  this.x = (dir) ? Game.width : this.w * (-1);


  this.getRow = function(){ return row; };
  this.getVelocity = function(){ return vel; };
  this.getDirection = function(){ return dir; };
};
Log.prototype = new Sprite();
Log.prototype.type = OBJECT_LOG;

Log.prototype.step = function(dt){

  var movement = this.vx*dt;
  if (this.direction) movement = -movement;

  this.x += movement;

  //extremos
  if(this.x > Game.width || this.x < -this.w)
   this.board.remove(this);
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


var Home = function(){
  this.y = 0;
  this.w = Game.width;
  this.h = square;
  this.step = function(dt){
    var player = this.board.collide(this,OBJECT_PLAYER);

    if(player)
      setTimeout(winGame, 1000);

  };

  this.draw = function(){};
};

Home.prototype = new Sprite();
Home.prototype.type = HOME;


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


var Spawner = function (){
  this.t = 0;


};

Spawner.prototype.draw = function(){};
Spawner.prototype.step = function(dt){
  this.t+=dt;

  if (this.t >= this.spawn_time){
    this.t = 0;
    this.board.add(this.generate(), 0);

    console.log("working");
  }


};


var Car_spawner = function(prototype, time){

  this.spawn_time = time;

  this.generate = function(){

    var type = prototype.getType();
    var row = prototype.getRow();
    var vel = prototype.getVelocity();
    var dir = prototype.getDirection();

    return new Car(type, row, vel, dir);

  };

};

var Log_spawner = function(prototype, time){

  this.spawn_time = time;

  this.generate = function(){
    var row = prototype.getRow();
    var vel = prototype.getVelocity();
    var dir = prototype.getDirection();

    return new Log(row, vel, dir);
  };


};

Log_spawner.prototype = new Spawner();
Car_spawner.prototype = new Spawner();


/*
 * Fin Espacio de clases (sprites)
 * **************************************************************************************************************************
* */


//inizializa el juego:
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
