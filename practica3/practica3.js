window.addEventListener("load",function() {

	/*
	Maximize this game to whatever the size of the browser is
	turn on default input controls and touch input (for UI)
	*/
	var Q  = Quintus().include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX").setup({
		width: 600, // Set the default width to 800 pixels
		height: 480, // Set the default height to 600 pixels
	}).controls().touch();



	Q.SPRITE_PLAYER = 1;
	Q.SPRITE_COLLECTABLE = 2;
	Q.SPRITE_ENEMY = 4;
	Q.SPRITE_DOOR = 8;




/*COMPONENTES*/
/****************************************************************************************************/
Q.component("defaultEnemy", {
	added: function() {


		var self = this;

		this.entity.on("bump.top", function(collision){

			if(collision.obj.isA("Player")){

				collision.obj.p.vy = -300;
				self.entity.play('dead');
				self.entity.p.dead = true;
				self.entity.p.deadTimer = 0;
			}
		});


		this.entity.on("hit.sprite", function(col){

			if(col.obj.isA("Player") &&  !self.entity.p.dead) {
				col.obj.trigger('enemy.hit', {"enemy":self.entity,"col":col});
				//Q.audio.play('hit.mp3');
			}

		});

	} //added

});

/***************************************************************************************************/




	Q.Sprite.extend("Player",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "marioR", // Setting a sprite sheet sets sprite width and height
				sprite: "mario_small",
				direction:"right",
				speed: 160,
				x: 150,
				y: 380,
				type: Q.SPRITE_PLAYER,
				collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_COLLECTABLE
			});
			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			// The `platformerControls` makes the player controllable by the
			// default input actions (left, right to move, up or action to jump)
			// It also checks to make sure the player is on a horizontal surface before
			// letting them jump.
			this.add('2d, platformerControls, animation');

			this.on("enemy.hit","enemyHit");

		},

		step: function(dt) {
			var processed = false;




			if (this.p.dead){
				this.play('die');
				this.p.y += this.p.vy * dt;

				processed = true;
			}

			if (this.p.canyon){

				if(Q.inputs['down']) {
					this.p.canyon.shoot();

       	}

			}



 /* CASO NORMAL: */
			if(!processed){
				/* Vamos hacia la derecha*/
				if(this.p.vx > 0) {

					if(this.p.landed > 0) {
						this.play("walk_right");
					}
					else {
						this.play("jump_right");
					}

					/*turning direction right*/
					this.p.direction = "right";
			 	}
				/* Vamos hacia la izquierda*/
				else if(this.p.vx < 0) {

					if(this.p.landed > 0) {
						this.play("walk_left");
					}
				 	else {
						this.play("jump_left");
					}

					/*turning direction left*/
					this.p.direction = "left";
	 	 		}
				/* Standing*/
				else // vx = 0
					this.play("stand_" + this.p.direction);
			} //procesado de animaciones


			if (this.p.x >= 1800 && this.p.y >= 600){
				Q.clearStages();
				Q.stageScene("level2");
				Q.stageScene('hud', 3);

			}


			if(this.p.y > 600 && this.p.x < 2000){
				Q.stageScene("endGame",1, { label: "Game over" });
				this.destroy();
			}

		},

		enemyHit: function(data) {

	    var col = data.col;
	    var enemy = data.enemy;

			this.p.dead = true;

			this.del('2d, platformerControls');
			this.p.vy = 200;
			this.stage.unfollow();
			Q.stageScene("endGame",1, { label: "Game over" });

  	},

		getCamera: function(){
			this.stage.follow(this);
			this.stage.viewport.offsetX = -200;
			this.stage.viewport.offsetY = 100;
		}

	}); //PLAYER


	Q.Sprite.extend("Princess",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				asset: "princess.png", // Setting a sprite sheet sets sprite width and height
				sensor: true,
				x: 2000,
				y: 452
			});

			this.on("sensor");

		},

		sensor: function(col) {

    	Q.stageScene("endGame",1, { label: "You won!" });
			col.stage.unfollow();

    },

	});


	Q.Sprite.extend("Canyon",{
		init: function(p) {
			this._super(p, {
				sheet: "canyon_off", // Setting a sprite sheet sets sprite width and height
				vx: 0,
				vy: 0,
				sensor: true
			});

			this.add("animation");
			this.on("sensor");

		},

		sensor: function(col) {

    	col.p.canyon = this;

    },

		shoot: function(){
			this.p.sheet="canyon_on";
			console.log("disparo!");
		}

	});



	Q.Sprite.extend("Enemy", {
	  init: function(p,defaults) {

	    this._super(p,Q._defaults(defaults||{},{
	      vx: 50,
	      defaultDirection: 'left',
	      type: Q.SPRITE_ENEMY,
	      collisionMask: Q.SPRITE_DEFAULT
	    }));

	    this.add('2d, aiBounce, animation, defaultEnemy');
	  },


	  step: function(dt) {

			var p = this.p;

	    if(p.dead) {
	      this.del('2d, aiBounce');
	      this.p.deadTimer++;
	      if (this.p.deadTimer > 24) {
	        // Dead for 24 frames, remove it.
	        this.destroy();
	      }
	      return;
	    }

			this.play('walk');



	    p.vx += p.ax * dt;
	    p.vy += p.ay * dt;

	    p.x += p.vx * dt;
	    p.y += p.vy * dt;
	  }

	});



	Q.Enemy.extend("Goomba",{
		init: function(p){
			this._super(p, {
				sheet: "goomba",
				sprite: "goomba"
			});

		}
	});

	Q.Enemy.extend("Bowser",{
		init: function(p){
			this._super(p, {
				sheet: "bowserR",
				sprite: "bowser"
			});

		},

		step: function(dt) {

			var p = this.p;

			if (p.vx > 0)
				this.play('walk_right');
			else
				this.play('walk_left');



	    p.vx += p.ax * dt;
	    p.vy += p.ay * dt;

	    p.x += p.vx * dt;
	    p.y += p.vy * dt;
	  }

	});


	Q.Enemy.extend("Bloopa",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
				sprite: "bloopa",
				gravity: 0,
				vy: 100,
				vx: 0,
				x: 450,
				y: 400
			});

			this.timeRange= 0;

	 }, //init

		step: function(dt) {

			var p = this.p;

	    if(p.dead) {
	      this.del('2d, aiBounce');
	      this.p.deadTimer++;
	      if (this.p.deadTimer > 24) {
	        // Dead for 24 frames, remove it.
	        this.destroy();
	      }
	      return;
	    }


			this.play('jump');
			this.timeRange+=dt;
			/**/
			if(p.vy == 0){
				this.timeRange=0;
				p.vy = -50;
			}

			if (this.timeRange >= 2)
				p.vy = 150;


		} //step

	});


	Q.Sprite.extend("Collectable", {
	  init: function(p, defaults) {
	    this._super(p, Q._defaults(defaults||{},{
	      type: Q.SPRITE_COLLECTABLE,
	      collisionMask: Q.SPRITE_PLAYER,
	      sensor: true,
	      vx: 0,
	      vy: 0,
	      gravity: 0
	    }));

	    this.add("animation");
	    this.on("sensor");
	  },

	  // When a Collectable is hit.
	  sensor: function(colObj) {
	    // Increment the score.
	    if (this.p.amount) {

				Q.state.inc("score", this.p.amount);
	    }
	    //Q.audio.play('coin.mp3');
	    this.destroy();
	  },

		step: function(dt) {
			this.play('main_anim');
		}

	}); //Collectable




	Q.Collectable.extend("Coin",{
		init: function(p){
			this._super(p, {
				sheet: "coin",
				sprite: "coin",
				x: 300,
				y: 500,
				amount: 1
			});

		}
	});








/*ESCENAS*/
/**********************************************************/
	Q.scene("level1",function(stage) {

		Q.stageTMX("level.tmx",stage);

		Q.state.reset({ score: 0});
		var player = stage.insert(new Q.Player());

		stage.insert(new Q.Bloopa());
		stage.insert(new Q.Goomba({x: 1500, y: 380}));

		stage.insert(new Q.Princess());
		stage.insert(new Q.Coin({y: 500}));
		stage.insert(new Q.Coin({y: 450}));


		stage.add("viewport").follow(player);
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 150;

	});

	Q.scene("level2",function(stage) {

	  Q.stageTMX("level2.tmx",stage);

		var player = stage.insert(new Q.Player({y:-200}));

		stage.add("viewport").centerOn(300,300);

		setTimeout(function(){
			player.getCamera();
		}, 2000);

	});


	Q.scene('endGame',function(stage) {

	  var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  }));

	  var button = box.insert(new Q.UI.Button({ x: 0,
																							y: 0, fill: "#CCCCCC",
	                                           label: "Play Again" }));


	  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
	                                        label: stage.options.label }));
	  button.on("click",function() {
	    Q.clearStages();
	    Q.stageScene('tittle');
	  });
	  box.fit(20);
	});



	Q.scene('tittle', function(stage){

		stage.insert(new Q.UI.Button({
									asset: "mainTitle.png",
									y: Q.height/2,
									x: Q.width/2
								}, function() {
										Q.clearStages();
										Q.stageScene("level2");
										Q.stageScene('hud', 3);
								}, { keyActionName: 'confirm' }));


		var container = stage.insert(new Q.UI.Container({ x: 0, y: 0}));
		var label = container.insert(new Q.UI.Text({x:150,
																								y: 40,
																								label: "Press Enter to start",
																								color: "red"
																							}));
		container.fit(20);



	});




	Q.UI.Text.extend("Score",{
		init: function(p) {
			this._super({
				color: "red",
				label: "score: 0",
				x: 150,
				y: 40
			});

			Q.state.on("change.score",this,"score");
		},
		score: function(score) {
			this.p.label = "score: " + score;
		}
	});


	Q.scene('hud',function(stage) {

	  var container = stage.insert(new Q.UI.Container({
	    x: 50, y: 0
	  }));

	  var label = container.insert(new Q.Score());

	  container.fit(20);

	});



//DUDAS
/*
pasar de spritesheet a JSON mas facil, spriter necesita estar descompuesto en distintas imagenes
Aprovechar el sheet del JSON de verdad para las animaciones

tiled: objeto de mas de un tile

Activar el LoadTMX cuando quiera

*/





/*********************************************************************/


/* METODO DE CARGA DE RECUROS */
/*******************************************************************/
	Q.loadTMX("level.tmx, level2.tmx, mainTitle.png, princess.png, mario_small.png, goomba.png, bloopa.png, coin.png, bowser.png, canyon.png , mario_small.json, goomba.json, bloopa.json, coin.json, bowser.json, canyon.json", function(){

	 // this will create the sprite sheets snail, slime and fly
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.compileSheets("bowser.png", "bowser.json");
		Q.compileSheets("canyon.png", "canyon.json");

		Q.animations("bowser", {
			walk_right: { frames: [0,1,2,3], rate: 1/5, flip: false, loop: true },
			walk_left: { frames:  [0,1,2,3], rate: 1/5, flip:"x", loop: true },
			stand_right: { frames:[0], rate: 1/9, flip: false },
			stand_left: { frames: [0], rate: 1/9, flip:"x" }
		});

		Q.animations("mario_small", {
			walk_right: { frames: [0,1,2], rate: 1/5, flip: false, loop: true },
			walk_left: { frames:  [0,1,2], rate: 1/5, flip:"x", loop: true },
			jump_right: { frames: [4], rate: 1/9, flip: false },
			jump_left: { frames:  [4], rate: 1/9, flip: "x" },
			stand_right: { frames:[0], rate: 1/9, flip: false },
			stand_left: { frames: [0], rate: 1/9, flip:"x" },
			duck_right: { frames: [6], rate: 1/9, flip: false },
			duck_left: { frames:  [6], rate: 1/9, flip: "x" },
			die: { frames:  [12], flip: false }
		});

		Q.animations("bloopa", {
			jump: { frames: [0,1], rate: 1/2, loop: true },
			dead: { frames: [2]}
		});




		Q.animations("goomba", {
			walk: { frames: [0,1], rate: 1/3, loop: true },
			dead: { frames: [2], rate: 1/8 }
		});

		Q.animations("coin", {
			main_anim: { frames: [0,1,2], rate: 1/3, loop: true }
		});



		/*usamos sheet propio:*/
		//Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
		Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
		Q.stageScene("tittle");

	});

/********************************************************************/




});
