/*
  Practica 1

  Sergio Semedi Barranco
  Desarrollo de Videojuegos (DVI)

*/


/*
	Algoritmo shuffle, recibe un array y lo ordena aleatoriamente
	usado para colocar de forma aleatoria el array que se crea en initGame
*/
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/*
	Enumerado usado para indicar el estado de las cartas
		DOWN: habia abajo
		UP: Al descubierto
		FOUND: su pareja ya ha sido encontrada
*/
var statusEnum = {"DOWN": 1, "UP": 2, "FOUND": 2,};



/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
	this.pair = {ready: false, pos: 0};
	this.message="Memory Game";
	this.cards = new Array();
	this.n = 16;
	this.matchs = 0;
};

/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGame.Card = function(id) {


	//this.statusEnum = { "DOWN": 1,"UP": 2, "FOUND": 3,};
	this.id = id;
	this.status =statusEnum.DOWN;

};
MemoryGame.Card.prototype = {
  /* draw: funcion que pinta en el canvas de la pantalla usando el micromotor "auxiliar"*/
	draw : function(gs, pos){
		var id_status = "back";
		if (this.status != statusEnum.DOWN){
			id_status = this.id;
		}
		gs.draw(id_status, pos);
	},
  /*cambia el estado de la carta */
	flip : function(){
		if (this.status == statusEnum.DOWN)
	    this.status=statusEnum.UP;
		else
			this.status = statusEnum.DOWN;
	},
  /* cambio el estado de la carta a encontrada*/
	found: function(){
		this.status = statusEnum.FOUND;
	},
  /*
    devuelve true si las cartas son iguales
  */
	compareTo: function(otherCard){
		return (this.id == otherCard)

	}
};

MemoryGame.prototype = {
	initGame: function(){

		/* Creamos el array de cartas (no aleatorio)*/
		var type = ["8-ball", "potato", "dinosaur", "kronos", "rocket", "unicorn", "guy", "zeppelin"];
		var t = -1;

		for (var i = 0; i < this.n; i++){
			if (i%2 == 0)
				t++;
			this.cards[i]= new MemoryGame.Card(type[t]);
		}

		/* random array transformation*/
		this.cards = shuffleArray(this.cards);

		/* Gameloop */
		this.loop();

	},

/*
  pinta el mensaje de juego y llama a la funcion pintar de la carta ya definida anteriormente

*/
	draw: function(){
		gs.drawMessage(this.message);
		var i = 0;

		for (var i; i < this.n; i++){
			this.cards[i].draw(gs, i);
		}

	},

//GAMELOOP ==>
	loop: function(){

		var self = this;

    /*
      el objeto gameLoop contiene la lógica necesaria para no seguir ejecutandose
      en caso de que ganemos el juego
    */
    var gameLoop = function() {
      self.draw();
      if (self.matchs >= self.n/2)
        clearInterval(intervalId);
    }

    var intervalId = setInterval(gameLoop, 16);
  },

	onClick: function(cardId){

    /* cogemos la carta en la que hemos pinchado*/
		var card = this.cards[cardId];

    /* click fuera del tablón de juego o la carta no esta ya esta arriba,
    */
		if (cardId < 0 || cardId === null ||card.status != statusEnum.DOWN)
			return;

    /*
     ready solo esta activo en las jugadas impares (no pair)
     */
		this.pair.ready = !(this.pair.ready);

    //volteamos la carta
		card.flip();

    //jugada impar (no tenemos pareja) = guarda tu pos
		if (this.pair.ready)
			this.pair.pos = cardId;

    //jugada par (tenemos pair)
		else {
      //carta ya UP
			var card2 = this.cards[this.pair.pos];

      /*No son iguales:
        permitimos a los jugadores muy rapidos que puedan seguir realizando otras jugadas a la vez que comprueban parejas
        el juego no se rompera igualmente
      */
			if (!card.compareTo(card2.id)){

        var failure = function(){
	        card.flip();
	        card2.flip();
        };

				setTimeout(failure, 1000);
				this.message ="Try again";
			}
      /*
        se produce un acierto:
      */
			else{
				this.matchs++; //aumentamos aciertos
        //cambiamos el mensaje por pantalla si ganamos
				if (this.matchs == this.n/2)
					this.message = "You win";
				else
					this.message = "Match found!!";

			}
		}
	}
};
