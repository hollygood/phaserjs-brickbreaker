//constructor
BasicGame = {};

BasicGame.Boot = function(game) {

	pathWay = window.location.pathname.split( '/' );

	if(window.location.hostname == 'localhost')
		url = 'http://' + window.location.hostname + '/' + pathWay[1] + '/' +  pathWay[2] + '/img/';
	else 
		url = 'http://' + window.location.hostname + '/' + pathWay[1] + '/'  + '/img/';
};

BasicGame.Boot.prototype = {

	preload: function() {

		this.load.image('preloaderBar', url + 'preloaderBar.png');	

	},

	create: function() {
		
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	  this.game.scale.pageAlignHorizontally = true;
	  this.game.scale.pageAlignVertically = true;
	  
		/*
		need to play around this
		if(this.game.device.desktop) {
			this.game.stage.scale.pageAlignHorizontally = true;
		}

		else {
			//In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
			this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
	    this.game.stage.scale.minWidth = 320;
	    this.game.stage.scale.minHeight = 250;
	    this.game.stage.scale.maxWidth = 1024;
	    this.game.stage.scale.maxHeight = 768;
	    this.game.stage.scale.forceLandscape = true;
	    this.game.stage.scale.pageAlignHorizontally = true;
	    this.game.stage.scale.setScreenSize(true);
		}*/
	
		this.game.state.start('Preloader');
	}
};
