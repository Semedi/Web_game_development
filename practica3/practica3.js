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
				frame: 0,
				speed: 125,
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
			this.add('2d, platformerControls');

		},

		step: function(dt) {


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
				frame: 0,
				vx: 75,
				x: 1500,
				y: 380
			});

			this.add('2d, aiBounce');

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
		} //step

	});


	Q.Sprite.extend("Bloopa",{
	// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
				frame: 0,
				vx: 75,
				x: 350,
				y: 500
			});

			this.add('2d, aiBounce');

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

	 }, //init

		step: function(dt) {
		} //step

	});



/*ESCENAS*/
/**********************************************************/
	Q.scene("level1",function(stage) {
		Q.stageTMX("level.tmx",stage);
		var player = stage.insert(new Q.Player());

		stage.insert(new Q.Goomba());
		stage.insert(new Q.Bloopa());
		stage.insert(new Q.Princess());

		stage.add("viewport").follow(stage.insert(player));
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 150;

	});


	Q.scene('endGame',function(stage) {
	  var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  }));

	  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                           label: "Play Again" }))
	  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
	                                        label: stage.options.label }));
	  button.on("click",function() {
	    Q.clearStages();
	    Q.stageScene('level1');
	  });
	  box.fit(20);
});
/*********************************************************************/


/* METODO DE CARGA DE RECUROS */
/*******************************************************************/
	Q.loadTMX("level.tmx, princess.png, mario_small.png, goomba.png, bloopa.png ,mario_small.json, goomba.json, bloopa.json", function(){

	 // this will create the sprite sheets snail, slime and fly
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");

		/*usamos sheet propio:*/
	//	Q.sheet("mario","mario_small.png", { tilew: 32, tileh: 32 });
		Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
		Q.stageScene("level1");

	});

/********************************************************************/




});
