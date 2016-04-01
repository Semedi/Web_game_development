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
			if(this.p.y > 600)
				Q.stageScene("level1");
		}

	});



	Q.scene("level1",function(stage) {
		Q.stageTMX("level.tmx",stage);
		var player = stage.insert(new Q.Player());

		stage.add("viewport").follow(player);
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 150;

	});



/* METODOS DE CARGA DE RECUROS */
/*******************************************************************/
	Q.loadTMX("level.tmx, mario_small.png,mario_small.json", function(){

	 // this will create the sprite sheets snail, slime and fly
		Q.compileSheets("mario_small.png","mario_small.json");
	//	Q.sheet("mario","mario_small.png", { tilew: 32, tileh: 32 });
		Q.stageScene("level1");

	});

/********************************************************************/




});
