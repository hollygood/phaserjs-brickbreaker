BasicGame.Preloader = function(game) {

	this.preloaderBar = null;

}

BasicGame.Preloader.prototype = {

	preload: function() {

		this.preloaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloaderBar');
		
		this.preloaderBar.anchor.setTo(0.5);
		this.load.setPreloadSprite(this.preloaderBar);
		this.load.atlas('tiles', url + 'blaster.png', url + 'blaster.json');
		//this.game.add.text(100, 20, 'LEVEL', {font: 'AvenirNext'}); 
		this.game.load.bitmapFont('AvenirNextTitle', url + 'titleText.png', url + 'titleText.fnt');
		this.game.load.bitmapFont('AvenirNextDemi', url + 'demiText.png', url + 'demiText.fnt');
	},

	create: function() {

		this.preloaderBar.cropEnabled = false;
		this.game.physics.startSystem(Phaser.Physics.ARCADE); 
		this.game.state.start('Game'); 
		 
	},

}