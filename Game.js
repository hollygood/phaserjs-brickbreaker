BasicGame.Game = function(game) {

	this.game;		//	a reference to the currently running game
  this.add;		//	used to add sprites, text, groups, etc
  this.camera;	//	a reference to the game camera
  this.cache;		//	the game cache
  this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
  this.load;		//	for preloading assets
  this.math;		//	lots of useful common math operations
  this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
  this.stage;		//	the game stage
  this.time;		//	the clock
  this.tweens;	//	the tween manager
  this.world;		//	the game world
  this.particles;	//	the particle manager
  this.physics;	//	the physics manager
  this.rnd;		//	the repeatable random number generator

	this.countDown;
	this.countDownTime = 3;
	this.countDownTimeElapsed = 0;
	this.countDownInitialX = 120;
	this.countDownInitialY = 200;
	this.isCountDownOff = false;
	this.countDownTimeInterval = 1000;
	this.countDownsecondTick = 1;

	this.paddle;
  this.paddleSpeed = 200;

  this.isBallOnPaddle = true;
  this.ballOnPaddleOffset = 32;
  this.bigBallOnPaddleOffset = 40;
  this.balls;
  this.ballsCount = 0;
  this.ballSpeed = 750;
  this.initialDirection = 0.7;

  this.bigBallTimer;
  this.bigBallSeconds = 30;
  this.bigBallTimeEvent = 0;

  this.bricks;
  this.currentLevel = 0;
  this.scorePerBrick = 100;
  this.scorePerLevel = 1000;

  this.mouseControl = true;

  this.score = 0;
  this.scoreText;
  this.pauseLabel;
  this.livesText;
  this.levelText;
  this.timerEvent;
  this.currentTimer;
  this.seconds = 0;
  this.levelSeconds = 0;
  this.levelOneMilliseconds = 0;
  this.levelTwoMilliseconds = 0;
  this.levelTimer;
  this.timeElapsed;
  this.gameMessageText;

  this.titleStyle = {
  	font: 'AvenirNext',
  	fontSize: '18px',
  	fontWeight: '900',
  	fontStyle: 'italic',
  	fill: '#f15a24'
  },

  this.textStyle = {
		font: 'AvenirNext', 
		fontSize: '18px',
		fontWeight: '600',
		fill: '#ffffff',
		fontStyle: 'italic',
		align: 'left'
  };

  this.titleSize = 21;
  this.textSize = 20;

  this.hudTop = 10;

  this.breakoutLevels;

  this.firmUpMessageTimeout = null;
  this.firmUpMessageTime = 3000;

  this.scaleRatio = 1;
  that = this;

  this.currentForm = '#questionsForm-0';
  this.loadFormTimes = 1;
  this.questionId = 1;

  this.dropOffPenalty = 6;
  this.wrongAnswerPenalty = 6;

}

BasicGame.Game.prototype = {

	create: function() {

		this.setScaleRatio();
		this.initGameVars();
		this.loadLevels();

		//reset some game vars
    this.ballsCount = 0;
   
    this.score = 0;
    this.countDownTime = 3;
    this.countDownTimeElapsed = 0;

    //what this line do?
    this.game.camera.setSize(this.game.world.width, this.game.world.height);

    //remove the camera bounds so we can shake it later
    this.game.camera.bounds = null;
	
    this.createHUD();
    this.createPaddle();
    this.bricks = this.game.add.group();
    this.populateLevel(this.currentLevel);
    this.balls = this.game.add.group(); 
    this.createBall();
    this.createCounter();

	},

	update: function() {

		this.countDownUpdate();
		this.updatePaddle();

		if(this.isCountDownOff) {
			this.balls.forEachAlive(this.ballUpdate, this);
			this.currentTimer.resume();

		} else {
			this.currentTimer.pause();

			if(this.isBallOnPaddle)
				this.balls.forEachAlive(this.ballOnPaddle, this);
			
			if(this.seconds != 0) 
				this.timerEvent.setText('TIME: PAUSED'); 
		}

		this.game.physics.arcade.collide(this.balls, this.balls, this.ballHitBallHandler, this.ballHitBallProcess, this);
		this.game.physics.arcade.collide(this.paddle, this.balls, this.paddleHitBallHandler, this.paddleHitBallProcess, this);

		if(this.balls.checkAll('frameName', 'ball', true))
			this.game.physics.arcade.collide(this.balls, this.bricks, this.ballHitBrickHandler, this.ballHitBrickProcess, this);
		else
			this.game.physics.arcade.overlap(this.balls, this.bricks, this.ballHitBrickHandler, this.ballHitBrickProcess, this);
	},

	setScaleRatio: function() {

		//this.scaleRatio = (window.devicePixelRatio > 2) ? 2 : window.devicePixelRatio;
		this.scaleRatio = window.devicePixelRatio;
		var width = $(window).width();
		var height = $(window).height();

		if(!this.game.device.desktop) {

			this.scaleRatio = window.devicePixelRatio / 2;

			if(this.game.device.android) {

				//nexus 6 or lower
				if(width <= 960 && height >= 600) 
					this.scaleRatio = window.devicePixelRatio / 2;
				
				//nexus 10 / 7
				if(width <= 1280 && height >= 800) 
					this.scaleRatio = window.devicePixelRatio / 1.2;
			}

			if(this.game.device.iPad) {
				this.scaleRatio = window.devicePixelRatio / 1.4;
				this.titleSize = 46 * this.scaleRatio;
				this.textSize = 46 * this.scaleRatio;
			}

			this.titleSize = 28 * this.scaleRatio;
			this.textSize = 28 * this.scaleRatio;
			
		} else {
		
			if(width <= 1366 && height <= 768) {
				this.scaleRatio = window.devicePixelRatio / 2;
				this.titleSize = 15;
				this.textSize = 14;
			}

			else if(width <= 1600)
				this.scaleRatio = window.devicePixelRatio / 1.6;

			else if(width <= 1920)
				this.scaleRatio = window.devicePixelRatio / 1.5;
		}

		this.ballSpeed *= this.scaleRatio;
		this.ballOnPaddleOffset *= this.scaleRatio;
		this.bigBallOnPaddleOffset *= this.scaleRatio;
	},

	//Custom functions
	initGameVars: function() {

    this.score = 0;
    this.currentLevel = 0;
    this.initLevelVars();

	},

	initLevelVars: function() {

		this.countDownTime = 3;
    this.countDownTimeElapsed = 0;
    this.countDownsecondTick = 1;
    this.isCountDownOff = false;

	},

	loadLevels: function() {

		var b = 'blue',
		    g = 'grey-square',
		    f = 'firm-up',
			  X = null;

		this.brickInfo = {
			width: 88 * this.scaleRatio,
			height: 33 * this.scaleRatio,
			offset: {
				top: 80 * this.scaleRatio,
			},
			padding: 0
		}

		this.breakoutLevels = [
			{
				name: 'Level 1',
				bricks: [
					[X, b, b, b, b, X],
					[b, b, b, b, b, b],
					[b, b, X, X, b, b],
					[X, b, b, f, b, X],
					[X, b, b, X, b, X],
					[b, X, b, b, X, b],
					[X, X, X, X, X, X],
					//[X, X, X, X, f, X] // test level
				],
			},

			{
				name: 'Level 2',
				bricks: [
					[b, X, X, X, X, X],
					[b, b, X, X, X, X],
					[X, b, b, X, X, X],
					[b, b, b, b, X, X],
					[b, X, b, X, b, X],
					[X, b, b, b, X, b],
					[X, b, X, f, b, b],
					[X, b, b, X, b, X],
					[X, X, b, b, X, b],
					[X, X, b, X, b, X],
					//[X, X, X, X, X, b]
				],
			},
		];
	}, //loadLevels

	populateLevel: function(level) {

    //reset bricks
    this.bricks.destroy();
    this.bricks = this.game.add.group();
    var levelBricks = this.breakoutLevels[level];

    this.generateBricks(levelBricks);

	},

	generateBricks: function(levelBricks) {

		var topOffet = this.brickInfo.offset.top,
				brickWidth = this.brickInfo.width,
				brickHeight = this.brickInfo.height,
				padding = this.brickInfo.padding;

		for(var y = 0; y < levelBricks.bricks.length; y++) {
			for(var x = 0; x < levelBricks.bricks[y].length; x++) {
				
				var type = levelBricks.bricks[y][x],
						leftOffet = ( this.game.world.width - levelBricks.bricks[y].length * (brickWidth + padding)) / 2,
						brickX = x * (brickWidth + padding) + leftOffet,
						brickY = y * (brickHeight + padding) + topOffet;

				if(type) {
					
					var tempBrick;
					tempBrick = this.game.add.sprite(brickX, brickY, 'tiles', type + '-brick');

					if(type == 'firm-up') {
						tempBrick.health = 1;
					} 
					else {	
						tempBrick.health = 2;
					}

					tempBrick.scale.setTo(this.scaleRatio, this.scaleRatio);
					tempBrick.name = type;
					this.enablePhysics(tempBrick);
					tempBrick.body.bounce.setTo(1);
          tempBrick.body.immovable = true;
        	this.bricks.add(tempBrick);
        }
			}
		}
	}, //generateBricks 

	createHUD: function() {

		this.pauseGame();

		//this.levelText = this.game.add.text(100 * this.scaleRatio, this.hudTop, 'LEVEL ' + (this.currentLevel + 1), this.titleStyle);
		this.levelText = this.game.add.bitmapText(100 * this.scaleRatio, this.hudTop, 
			'AvenirNextTitle', 'LEVEL ' + (this.currentLevel + 1), this.titleSize); 
		this.levelText.anchor.setTo(0.5, 0);

		//this.timerEvent = this.game.add.text(this.game.world.width - 210 * this.scaleRatio, this.hudTop, 'TIME: 00:00', this.textStyle);
		this.timerEvent = this.game.add.bitmapText(this.game.world.width - 210 * this.scaleRatio, this.hudTop, 
			'AvenirNextDemi', 'TIME: 00:00', this.textSize); 
		this.currentTimer = this.game.time.create(false);
		this.currentTimer.loop(Phaser.Timer.SECOND, this.updateTimer, this);
    this.currentTimer.start();

	},

	pauseGame: function() {

		var button = $('#button'),
				message = $('#message');

		$('#pauseButton').on('click', function(e) {
			e.preventDefault();

			if(that.game.paused) {
				that.game.paused = false;
				$(this).html('Pause');
			} else {
				that.game.paused = true;
				$(this).html('Resume');
			}
		});

	},

	createCounter: function() {

		this.countDown = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + 160 * this.scaleRatio, 'tiles', 'two');
		this.countDown.scale.setTo(this.scaleRatio);
		this.countDown.anchor.setTo(0.5);
		this.countDown.animations.add('counter_three', ['three'], 10, false, false);
		this.countDown.animations.add('counter_two', ['two'], 10, false, false);
    this.countDown.animations.add('counter_one', ['one'], 10, false, false);
		this.countDown.play('counter_three');
    this.countDown.name = 'counter';
	
	},

	countDownUpdate: function() {

		this.countDownTimeElapsed += this.game.time.elapsed;

		if(!this.isCountDownOff) {

			if(this.countDownTimeElapsed > this.countDownTimeInterval * this.countDownsecondTick) {
				this.countDownTime -= 1;
				this.countDownsecondTick +=1;
			}

			if (this.countDownTime == 2) {
        this.countDown.play('counter_two', 10);
      } else if (this.countDownTime == 2) {
        this.countDown.play('counter_one', 10);
      } else if (this.countDownTime == 1) {
        this.countDown.play('counter_one', 10);
      } else if (this.countDownTime <= 0) {
        this.setBallInitialVelocity();
        this.isCountDownOff = true;

        this.countDown.kill();
      }
		}

	},

	resetCountDown: function() {

		this.countDown.revive();
    this.countDown.play("counter_three");
    this.countDownTime = 3;
    this.countDownTimeElapsed = 0;
    this.countDownsecondTick = 1;
    this.isCountDownOff = false;

    if(this.game.paused) {
    	if(this.isCountDownOff) {
    		this.game.paused = false;
    	}
    } 

	},

	createPaddle: function() {

		this.paddle = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 60 * this.scaleRatio, 'tiles', 'paddle');
		this.paddle.scale.setTo(this.scaleRatio, this.scaleRatio);
    this.paddle.anchor.setTo(0.5, 0); 

    this.enablePhysics(this.paddle);
    this.paddle.body.immovable = true;

	},

	updatePaddle: function() {
		this.paddle.x = this.game.input.x || this.game.world.centerX;
	},

	createBall: function(newBall) {

		var tempBall,
				tempBallCount = 0;

		tempBall = this.game.add.sprite(this.game.world.centerX, this.paddle.y - this.ballOnPaddleOffset / 2, 'tiles', 'ball');
		tempBall.scale.setTo(this.scaleRatio, this.scaleRatio);
		tempBall.anchor.setTo(0.5);

		if(this.balls.countLiving() > 0) {
			tempBallCount = this.balls.countLiving();
		}

		this.enablePhysics(tempBall);
		tempBall.body.collideWorldBounds = true;
		tempBall.body.bounce.set(1);
		tempBall.checkWorldBounds = true;
		this.game.physics.arcade.checkCollision.down = false;

		if(newBall) {
			this.setBallVelocity(tempBall);
		}

		this.ballsCount += 1;
		this.balls.add(tempBall);

	},

 	setBallInitialVelocity: function() {
 		this.balls.forEach(this.setBallVelocity, this);
 	},

	setBallVelocity: function (tempBall) {

    tempBall.body.velocity.x = this.initialDirection * this.ballSpeed;
    tempBall.body.velocity.y = -1 * this.ballSpeed;

	},

	ballOnPaddle: function(ball) {
		ball.body.x = this.paddle.x - ball.body.halfWidth;
	},

	ballUpdate: function(ball) {

		if (ball.body.y > this.game.world.height + ball.body.height) {
	    ball.body.x = this.game.world.centerX;
	    ball.body.y = this.paddle.y - this.ballOnPaddleOffset;
	    ball.body.velocity.x = 0;
	    ball.body.velocity.y = 0;
	    ball.kill();
	    this.ballsCount -= 1;

	    if(this.ballsCount <= 0) {
	    	if(this.bricks.countLiving() > 0) {
	    		this.giveOneLife();
	    	}
	    }

		}

	},

	resetBall: function(tempBall, active) {

		if(active) {
			this.setBallVelocity(tempBall);
		} else {
			tempBall.body.velocity.x = 0;
			tempBall.body.velocity.y = 0;
		}

		if(tempBall.frameName == 'firm-up-ball') {
			tempBall.frameName = 'ball';
		}

		tempBall.revive();
		tempBall.body.x = this.paddle.x - tempBall.body.halfWidth;
		tempBall.body.y = this.paddle.y - 32 * this.scaleRatio;
	},

	resetBalls: function() {

		this.balls.callAll('kill');
		this.ballsCount = 0;
		var tempBall = this.balls.getFirstDead();

		if(tempBall) 
			this.resetBall(tempBall);
	},

	bigBall: function(ball) {

		if(ball.frameName == 'ball')
			ball.frameName = 'firm-up-ball';
	},

	updatebigBallTimer: function() {
		this.bigBallSeconds--;
	},

	setBigBallCountdown: function(timen, pause, callback, _ball) {

		var timeout;
		time = timen;
		_ball.frameName = 'firm-up-ball';

		if(timen == 0) 
			_ball.frameName = 'ball';
		else {
			clearTimeout(timeout);
      timeout = setTimeout(function(){
        that.setBigBallCountdown(timen - 1, pause, that.ballToNormal(_ball), _ball);
      }, pause);
		}
	},

	ballToNormal: function(_ball) {
		_ball.frameName = 'ball';
	},

	giveOneLife: function() {

		if(this.balls.countLiving() == 0) {
			
			this.isBallOnPaddle = true;

			var firstDeadBall = this.balls.getFirstDead();
			firstDeadBall.body.x = this.paddle.body.x - firstDeadBall.body.halfWidth;

			if(firstDeadBall.frameName == 'firm-up-ball') {
				firstDeadBall.body.y = this.paddle.body.y - this.bigBallOnPaddleOffset;
			}
			else {
				firstDeadBall.body.y = this.paddle.body.y - this.ballOnPaddleOffset;
			}

			firstDeadBall.revive();
			this.ballsCount += 1;
			this.resetCountDown();

			//Add 5 second time-penalty for lost ball
			this.incrementTime(this.dropOffPenalty);
		}

	},

	incrementTime: function(seconds) {

		this.seconds += seconds;
		this.levelSeconds += 1000 * seconds;

	},

	firmUpMessage: function() {
		
		this.game.paused = true;
		popup = this.game.add.sprite(this.game.world.centerX, 250 * this.scaleRatio, 'tiles', 'firm-up');
    popup.anchor.set(0.5);
    popup.scale.setTo(1 * this.scaleRatio);

    $('#pauseButton').hide();

    setTimeout(function() {
    	popup.scale.setTo(0);
    	that.loadQuestionForm();
   	}, this.firmUpMessageTime); 

	},

	updateTimer: function() {

    this.seconds++;

    var minutes = 0,
    		seconds = 0;

    minutes = (Math.floor(this.seconds / 60) < 10) ? 
    '0' + Math.floor(this.seconds / 60) : Math.floor(this.seconds / 60);
    seconds = (this.seconds % 60 > 9) ? this.seconds % 60 : '0' + this.seconds % 60;

    this.timeElapsed = minutes + ':' + seconds;

    this.timerEvent.setText('TIME: ' + this.timeElapsed);
	},

	//============================ HANDLE COLLISION =============================

	ballHitBallHandler: function() {

	},

	ballHitBallProcess: function(ball1, ball2) {

		//converse the ball direction when two balls collide
		if (ball1.body.velocity.y > 0 && ball2.body.velocity.y < 0) {
      ball1.body.velocity.y *= -ball1.body.bounce.y;
      ball2.body.velocity.y *= -ball2.body.bounce.y;
    }
    if (ball1.body.velocity.x > 0 && ball2.body.velocity.x < 0) {
      ball1.body.velocity.x *= -ball1.body.bounce.x;
      ball2.body.velocity.x *= -ball2.body.bounce.x;
    }

	},
		
	paddleHitBallHandler: function (paddle, ball) {
    //just an empty handler
	},

	paddleHitBallProcess: function (paddle, ball) {

		ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);

	},

	ballHitBrickHandler: function (_ball, _brick) {

		if(_ball.frameName == 'firm-up-ball') 
			_brick.health = 0;
		
		else 
			_brick.health--;
		

		if(_brick.health == 1) {
			if(_brick.name == 'blue')
				_brick.frameName = 'blue-brick-broke';
		}

		if(_brick.name == 'firm-up') {
			_ball.body.velocity.y = 0;
			_ball.body.velocity.x = 0;
			this.isBallOnPaddle = false;
			this.bigBall(_ball);
			this.shakeGame(); 
			this.firmUpMessage();
		}
		
		if(_brick.health == 0) 
			_brick.kill();
		
		this.gameComplete();

	},

	ballHitBrickProcess: function (_ball, _brick) {

	},

	//============================== GAME COMPLETE ===============================

	gameComplete: function() {

		//IF THE LAST BRICK IS FIRM UP BUG
		if(this.bricks.countLiving() == 0) 
			this.nextLevel();

	},

	nextLevel: function() {

		this.saveGameTime();
		this.isBallOnPaddle = true;
		this.currentLevel += 1;

		if(this.currentLevel > 1) {
			this.gameOver();
			
		} else {
			this.initLevelVars();
			this.populateLevel(this.currentLevel);
			this.resetCountDown();
			this.resetBalls();

			this.game.paused = true;
			this.showFormWrap();
			$('#button').hide();
			$('#formWrap').append('<h2 style="margin-top: 45%">Level 2 Final Level</h2>');

			setTimeout(function(){
				$('#formWrap h2').remove();
				that.hideFormWrap();
				that.game.paused = false;
				$('#button').show();
			}, 5000);
		}

		this.levelText.setText('Level ' + (this.currentLevel + 1));

	},

	//============================== OTHERS & AJAX ==================================

	showFormWrap: function() {
		$('#gameArea').css({'z-index': -1, 'opacity': 0});
		$('#formWrap').css({'z-index': 99, 'opacity': 1});
	},

	hideFormWrap: function() {
		$('#gameArea').css({'z-index': 99, 'opacity': 1});
		$('#formWrap').css({'z-index': -1, 'opacity': 0});
	},

	loadQuestionForm: function() {

		var questionId = this.questionId;
		this.showFormWrap();

		$.ajax({
      dataType: 'json',
      type: 'POST',
      url: ajaxQuestion,
      data: {
      	id: this.questionId
      },
    })
    .success(function(data){
    	
    	var answers = '',
    			congratulationPoints = '';

    	for(option in data['answers']) {
    		answers += '<div class="input radio"><label for="answer-'+ option +'">' +
    			'<input type="radio" id="answer-' + option + '" value="' + option + '" name="answer"> ' +
    			data['answers'][option] + '</label></div>'
    	}

    	if(!isSubmitted) {
    		congratulationPoints = '<h4>Answer the following questions<br>to earn ' + data['points'] * multiplier + ' points!</h4>';
    	}

    	$('#congratulation').html('<h2>Congratulations!</h2>' +
    		'<h3>You have <span>FIRMED UP</span></h3>' +
    		congratulationPoints
    	);

    	$('#forms').append('<form id="questionsForm">' + 
	    		'<p>' + data['question_' + lang] + '</p>' +
	    		answers +
	    		'<input name="id" value="' + data['id'] + '" type="hidden" />' +
	    		'<div class="submit"><input type="submit" value="Submit"></div>' +
	    		
	    	'</form>');
    })
    .complete(function(){
    	that.submitQuestionForm();
    	that.loadFormTimes++;
    	that.questionId++;

    	if(that.questionId > countQuestions)
    		that.questionId = 1;
    })
    .error(function(){
    	alert('Your session expires. Please go back to the welcome page.');
    	$('#formWrap').append('<a class="btn" href="/"></a>')
    });

	},

	submitQuestionForm: function() {
		var submitTimes = 1;
		var ifSuccess = false;
		var currentForm = '#' + $('#forms').find('form').attr('id');
		var loads = this.loadFormTimes;

		$(currentForm).find('.radio').on('click', function(e) {
  		
  		if(submitTimes <= 2 && !ifSuccess) {
				$('label').removeClass('checked');

				if($('input[type="radio"]', this).is(':checked')) {
					$('label', this).addClass('checked');
					$(currentForm).submit();
				}
			} else {
				e.preventDefault();
				return;
			}
		});

		$(currentForm).submit(function(e){
			e.preventDefault();
			var userAnswer = $(this).serialize();

			$.ajax({
        type: 'post',
        url: ajaxAnswer,
        data: userAnswer + '&submitTimes=' + submitTimes,
      })
      .error(function(){
	    	alert('Your session expires. Please go back to the welcome page.');
    		$('#formWrap').append('<a class="btn" href="/">Main Page</a>');
	    })
      .success(function(response){

      	ifSuccess = response['success'];
      	var correctMessage = '',
      			incorrectMessage = '6 seconds have been added to your total time.',
      			congratulationPoints = '';

      	if(!isSubmitted) {
      		congratulationPoints = ' to earn ' + 100 * multiplier + ' points!</h2>';
      	}

      	if(!ifSuccess) {
      		$('#congratulation').html('<h2>Try again' + congratulationPoints);

      		$('#response').html('<span>' 
	      		+ response['message'] + '</span><br>'
	      		+ incorrectMessage 
	      	);

	      	that.incrementTime(that.wrongAnswerPenalty);
      	} else {

      		if(!isSubmitted) 
      			correctMessage = 'You\'ve earned ' + response['points'] + ' RBH Connect Points!';

      		$('#response').html('<span>' 
	      		+ response['message'] + '</span><br>'
	      		+ correctMessage
	      	);
      	}

      	if(submitTimes == 2 && !ifSuccess) {
      		$('#response').html('<span>' + response['message'] + '</span><br>'
      			+ incorrectMessage);

      		if(typeof response['correctAnswer'] != undefined) {
      			$(currentForm).find('.radio').each(function(){
	      			$('label', this).removeClass('checked');
	      			var answer = $('input[type="radio"]', this).attr('value');

	      			if(answer == response['correctAnswer']) 
	      				$('label', this).addClass('checked').css('color', '#ff6a00');
	      		});
      		}	

      		ifSuccess = true;
      	}

      	if(ifSuccess) { 

      		if(loads < 2) {
      			//Load another question
      			setTimeout(function(){
      				$('#congratulation, #forms, #response').empty();
      				that.loadQuestionForm();
      			}, 3000);
      		}
      		else {
      			//RENDER CONTINUE BUTTON
      			$('#message').append('<a id="button" class="button big-button" href="#">Continue</a>');

      			$('#button').on('click', function(e){
      				e.preventDefault();
		      		that.hideFormWrap();
		      		$('#congratulation, #forms, #response').empty();
		      		$(this).remove();
		      		$('#pauseButton').show();
		      		that.loadFormTimes = 1;
		      		that.game.paused = false;
		      	});
      		}
      	} //ifSuccess

      	submitTimes++;
      	that.resetCountDown();

      })
		}); 
	},

	saveGameTime: function() {

		if(this.levelOneMilliseconds == 0)
			this.levelOneMilliseconds = this.currentTimer.ms + this.levelSeconds;
		else 
			this.levelTwoMilliseconds = this.currentTimer.ms + this.levelSeconds - this.levelOneMilliseconds;

  	$.ajax({
      data: {
      	gameTime: this.timeElapsed,
      	levelOneMilliseconds: this.levelOneMilliseconds,
      	levelTwoMilliseconds: this.levelTwoMilliseconds,
      },

      dataType: 'json',
      type: 'POST',
      url: ajaxSaveGameData
    });

  },

  gameOver: function() {

  	this.game.paused = true;

  	setTimeout(function(){
  		window.location.href = ajaxGameOver;
  	}, 3000);
  	
  },

  shakeGame: function () {
    $("#wrap").effect('shake');
	},

	enablePhysics: function(element) {
		this.game.physics.enable(element, Phaser.Physics.ARCADE);
	},


}