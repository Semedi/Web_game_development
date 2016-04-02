window.addEventListener("load",function() {
	/*
	Maximize this game to whatever the size of the browser is
	turn on default input controls and touch input (for UI)
	*/
	var Q  = Quintus().include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX").setup({
		width: 320, // Set the default width to 800 pixels
		height: 480, // Set the default height to 600 pixels
	}).controls().touch();



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
				y: 380
			});
			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			// The `platformerControls` makes the player controllable by the
			// default input actions (left, right to move, up or action to jump)
			// It also checks to make sure the player is on a horizontal surface before
			// letting them jump.
			this.add('2d, platformerControls, animation');

		},

		step: function(dt) {
			var processed = false;

			if(!processed){
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
				else // vx = 0
					this.play("stand_" + this.p.direction);



			}

			if(this.p.y > 600){
				Q.stageScene("endGame",1, { label: "Game over" });
				this.destroy();
			}
		},

	});


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

		sensor: function() {

    	Q.stageScene("endGame",1, { label: "You won!" });

    },

	});

	Q.Sprite.extend("Goomba",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "goomba", // Setting a sprite sheet sets sprite width and height
				sprite: "goomba",
				vx: 75,
				x: 1500,
				y: 380
			});

			this.add('2d, aiBounce, animation');

			this.on("bump.left,bump.right,bump.bottom",function(collision) {
	 			if(collision.obj.isA("Player")) {
		 			//Q.stageScene("endGame",1, { label: "You Died" });
		 			collision.obj.destroy();
					Q.stageScene("level1");
	 			}
 			});

		 this.on("bump.top",function(collision) {
			 if(collision.obj.isA("Player")) {
				 this.destroy();
				 collision.obj.p.vy = -300;
			 }
		 });

	 }, //init

		step: function(dt) {
			this.play('walk');
		} //step

	});


	Q.Sprite.extend("Bloopa",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
				sprite: "bloopa",
				gravity: 0,
				vy: 100,
				x: 450,
				y: 400
			});
			this.timeRange= 0;
			this.add('2d, aiBounce, animation');

			this.on("bump.left,bump.right,bump.bottom",function(collision) {
	 			if(collision.obj.isA("Player")) {
		 			Q.stageScene("endGame",1, { label: "Game over" });
		 			collision.obj.destroy();
	 			}
 			});

		 this.on("bump.top",function(collision) {
			 if(collision.obj.isA("Player")) {
				 this.destroy();
				 collision.obj.p.vy = -300;
			 }
		 });

		 this.play('jump');
	 }, //init

		step: function(dt) {

			this.timeRange+=dt;
			/**/
			if(this.p.vy == 0){
				this.timeRange=0;
				this.p.vy = -50;
			}

			if (this.timeRange >= 2)
				this.p.vy = 150;


		} //step

	});



/*ESCENAS*/
/**********************************************************/
	Q.scene("level1",function(stage) {
		Q.stageTMX("level.tmx",stage);
		var player = stage.insert(new Q.Player());

		stage.insert(new Q.Bloopa());
		stage.insert(new Q.Goomba());

		stage.insert(new Q.Princess());

		stage.add("viewport").follow(player);
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 150;

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
										Q.stageScene("level1");
								}, { keyActionName: 'confirm' }));


		var container = stage.insert(new Q.UI.Container({ x: 0, y: 0}));
		var label = container.insert(new Q.UI.Text({x:150,
																								y: 40,
																								label: "Press Enter to start",
																								color: "red"
																							}));
		container.fit(20);



	});










/*********************************************************************/


/* METODO DE CARGA DE RECUROS */
/*******************************************************************/
	Q.loadTMX("level.tmx, mainTitle.png,  princess.png, mario_small.png, goomba.png, bloopa.png ,mario_small.json, goomba.json, bloopa.json", function(){

	 // this will create the sprite sheets snail, slime and fly
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");

		Q.animations("mario_small", {
			walk_right: { frames: [0,1,2], rate: 1/10, flip: false, loop: true },
			walk_left: { frames:  [0,1,2], rate: 1/10, flip:"x", loop: true },
			jump_right: { frames: [4], rate: 1/9, flip: false },
			jump_left: { frames:  [4], rate: 1/9, flip: "x" },
			stand_right: { frames:[0], rate: 1/9, flip: false },
			stand_left: { frames: [0], rate: 1/9, flip:"x" },
			duck_right: { frames: [6], rate: 1/9, flip: false },
			duck_left: { frames:  [6], rate: 1/9, flip: "x" },
			die: { frames:  [12], rate: 1/9, flip: false }
		});

		Q.animations("bloopa", {
			jump: { frames: [0,1], rate: 1/2, loop: true },
			dead: { frames: [2], rate: 1/8 }
		});

		Q.animations("goomba", {
			walk: { frames: [0,1], rate: 1/3, loop: true },
			dead: { frames: [2], rate: 1/8 }
		});



		/*usamos sheet propio:*/
		//Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
		Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
		Q.stageScene("tittle");

	});

/********************************************************************/




});
