class pacman
{
	constructor(params)
	{
		//уровни
		this.levels = params.levels;
		//DOM контейнер для генерации игры
		this.container = document.getElementById(params.container);

		//добавление элементов управления в контейнер
		this.startButton = document.createElement("button");
		this.startButton.innerHTML = "Start";
		this.startButton.setAttribute("style","position:absolute");
		this.startButton.setAttribute("onClick","pacmanGame.startPressed()");
		this.container.appendChild(this.startButton);

		this.pauseButton = document.createElement("button");
		var pausePlace = params.width - 45;
		this.pauseButton.innerHTML="Pause";
		this.pauseButton.setAttribute("style","position:absolute; left:" + pausePlace + "px");
		this.pauseButton.setAttribute("onClick","pacmanGame.pausePressed()");
		this.container.appendChild(this.pauseButton);

		this.scoreContainer = document.createElement("div");
		this.scoreContainer.innerHTML = "";
		var scorePlace = params.hight + 30;
		this.scoreContainer.setAttribute("style","position:absolute; top:" + scorePlace + "px");		
		this.container.appendChild(this.scoreContainer);

		this.lifeContainer = document.createElement("div");
		this.lifeContainer.innerHTML = "";
		this.lifeContainer.setAttribute("style","position:absolute; top:" + scorePlace + "px; left:" + params.width/2 + "px;");		
		this.container.appendChild(this.lifeContainer);

		this.renderer= new pacmanRenderer({
			"pathToSpriteSheet" : params.pathToSpriteSheet,
			"spriteSheetWidth" : params.spriteSheetWidth,
			"spriteSheetHight" : params.spriteSheetHight,
			"spriteSheetWidthSprites" : params.spriteSheetWidthSprites,
			"spriteSheetHightSprites" : params.spriteSheetHightSprites,
			"spriteSheetBorderLeft" : params.spriteSheetBorderLeft,
			"spriteSheetBorderTop" : params.spriteSheetBorderTop,
			"spriteSheetBorderBottom" : params.spriteSheetBorderBottom,
			"spriteSheetBorderRight" : params.spriteSheetBorderRight,
			"lifeMax" : params.lifeMax,
			"width" : params.width,
			"hight" : params.hight,
			"scoreContainerHight" : params.scoreContainerHight,
			"levels":this.levels,
			"playerSpritesLocations" : params.playerSpritesLocations,
			"playerDeathSpritesLocations" : params.playerDeathSpritesLocations,
			"container" : "pacman-container"
		});

		this.canvas = this.renderer.returnContainer();

		this.startExtraLives = params.startExtraLives || 2;
		this.extraLives = this.startExtraLives;

		//стейт машина
		this.stateMachine = new pacmanStateMachine();

		//контроллер
		this.keycon = new keyboardController();
		this.keycon.attach(this.canvas);
		addKeyToController("left",[37],this.keycon);
		addKeyToController("right",[39],this.keycon);
		addKeyToController("up",[38],this.keycon);
		addKeyToController("down",[40],this.keycon);
		addKeyToController("x",[88],this.keycon);
		addKeyToController("d",[68],this.keycon);

		function addKeyToController(name,keys,keycon)
		{
			var key={
				name: name,
				keys: keys,
				active: true
			};
			keycon.bindActions(key);
		}

		this.score = 0;
		this.leftActive = false;
		this.rightActive = false;
		this.downActive = false;
		this.upActive = false;
		this.canvas.addEventListener("controls:activate",
			this.activateListenerActions.bind(this));
		this.canvas.addEventListener("controls:deactivate",
			this.deactivateListenerActions.bind(this));
		this.currentLevelNumber = -1;

		document.addEventListener("Pacman: game start", this.startPlaying.bind(this));
		document.addEventListener("Pacman: ready screen", this.readyScreen.bind(this));
		document.addEventListener("Pacman: game paused", this.pauseHandler.bind(this));
		document.addEventListener("Pacman: new game", this.gameStart.bind(this));
		document.addEventListener("Pacman: player death animation finished", this.deathAnimationFinishedHandler.bind(this));
		document.addEventListener("Pacman: resetting", this.reset.bind(this));
		document.addEventListener("Pacman: resetting finished", this.handleFinishedResetting.bind(this));
		document.addEventListener("Pacman: level clear", this.handleLevelClear.bind(this));
	}
/*
██╗     ██╗███████╗        █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
██║     ██║██╔════╝       ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
██║     ██║███████╗       ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
██║     ██║╚════██║       ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
███████╗██║███████║██╗    ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
╚══════╝╚═╝╚══════╝╚═╝    ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
*/
	activateListenerActions(event)
	{
		if (this.stateMachine.state == 10)
		{
			this.stateMachine.setPlaying();
		}
		switch(event.detail.action)
		{
			case "left": this.leftActive = true; break;
			case "right": this.rightActive = true; break;
			case "down": this.downActive = true; break;
			case "up": this.upActive = true; break;
		}
	}

	deactivateListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "left": this.leftActive = false; break;
			case "right": this.rightActive = false; break;
			case "down": this.downActive = false; break;
			case "up": this.upActive = false; break;
			case "x": this.currentLevelFood = 1; break;
			case "d": this.playerDeath(); break;
		}
		
	}
/*
 ██████╗  █████╗ ███╗   ███╗███████╗███████╗████████╗ █████╗ ██████╗ ████████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
██║  ███╗███████║██╔████╔██║█████╗  ███████╗   ██║   ███████║██████╔╝   ██║   
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║   ██║   ██║  ██║██║  ██║   ██║   
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝ 
*/
	gameStart()
	{
		console.log("start");
		clearInterval(this.currentGameInterval);
		this.score = 0;
		this.scoreContainer.innerHTML="Score: 0";
		this.extraLives = this.startExtraLives;
		this.lifeContainer.innerHTML="Lives: "+this.extraLives;
		this.currentLevelNumber = -1;
		this.stateMachine.setReadyScreen();
	}

	startPlaying()
	{
		this.currentGameInterval = setInterval(this.gameStep.bind(this),40);
	}
/*
███╗   ██╗███████╗██╗  ██╗████████╗    ██╗     ███████╗██╗   ██╗███████╗██╗     
████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝    ██║     ██╔════╝██║   ██║██╔════╝██║     
██╔██╗ ██║█████╗   ╚███╔╝    ██║       ██║     █████╗  ██║   ██║█████╗  ██║     
██║╚██╗██║██╔══╝   ██╔██╗    ██║       ██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     
██║ ╚████║███████╗██╔╝ ██╗   ██║       ███████╗███████╗ ╚████╔╝ ███████╗███████╗
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚══════╝
*/

	nextLevel()
	{
		console.log(333);
		this.renderer.boundDestroyLevel(true);
		this.currentLevelNumber++;
		if (this.currentLevelNumber == this.levels.length)
		{
			this.currentLevelNumber = 0;
		}

		this.currentLevelFood = 0;

		this.currentLevel = JSON.parse(JSON.stringify(this.levels[this.currentLevelNumber]));
		this.currentLevel[this.currentLevel.length] = [];
		for (var i=0; i<this.currentLevel.length;i++)
		{
			for (var j=0; j<this.currentLevel[0].length;j++)
			{
				if (this.currentLevel[i][j] == 6)
				{
					this.player = new character ({
							"isPlayer" : true,
							"x" : j,
							"y" : i,
							"originX" : j,
							"originY" : i,
							"renderer" : this.renderer,
							"eatsDots" : true,
							"score" : this.score
							});
				}
				if (this.currentLevel[i][j] == 2)
				{
					this.currentLevelFood++; 
				}
			}
		}
		this.renderer.boundDraw(this.currentLevelNumber);
		this.newDirection = -1;
		this.newdx = 0;
		this.newdy = 0;
		this.moveTimer = 0;
	}
/*
 ██████╗  █████╗ ███╗   ███╗███████╗███████╗████████╗███████╗██████╗ 
██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██║  ███╗███████║██╔████╔██║█████╗  ███████╗   ██║   █████╗  ██████╔╝
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║   ██║   ██╔══╝  ██╔═══╝ 
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║   ██║   ███████╗██║     
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝   ╚══════╝╚═╝     

*/
	gameStep()
	{
		var oldscore = this.score;

		if (this.leftActive)
		{
			this.newDirection = 0;
			this.newdx = -1;
			this.newdy = 0;
		}
		else
		if (this.rightActive)
		{
			this.newDirection = 2;
			this.newdx = 1;
			this.newdy = 0;
		}
		else
		if (this.upActive)
		{
			this.newDirection = 1;
			this.newdx = 0;
			this.newdy = -1;
		}
		else
		if (this.downActive)
		{
			this.newDirection = 3;
			this.newdx = 0;
			this.newdy = 1;
		}

		if ((this.newDirection != -1)&&(this.moveTimer >= 120))
			{
				this.score = this.score + (this.player.move(this.newdx,this.newdy,this.newDirection, this.currentLevel)||0);
				this.moveTimer = -40;
			}

		this.moveTimer = this.moveTimer + 40;
		if (oldscore != this.score)
		{
			this.scoreContainer.innerHTML="Score: "+this.score;
			this.currentLevelFood--;
			if (this.currentLevelFood == 0)
			{
				clearInterval(this.currentGameInterval);
				this.stateMachine.setLevelClearScreen();
			}
		}	
	}

/*
███████╗██╗   ██╗      ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
██╔════╝██║   ██║      ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
█████╗  ██║   ██║      ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
██╔══╝  ╚██╗ ██╔╝      ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
███████╗ ╚████╔╝██╗    ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
╚══════╝  ╚═══╝ ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
*/

	pausePressed()
	{
		this.stateMachine.setPause();
	}

	pauseHandler()
	{
		if (this.stateMachine.getState() == 3)
		{
			clearInterval(this.currentGameInterval);	
		}
		else
		{
			this.currentGameInterval = setInterval(this.gameStep.bind(this),40);
		}
	}

	startPressed()
	{
		this.stateMachine.setNewGame();
	}

	playerDeath()
	{
		clearInterval(this.currentGameInterval);
		this.renderer.animatePlayerDeath(this.player);

		this.extraLives--;

		if (this.extraLives == -1)
		{
			this.stateMachine.setGameOver(this.score);
		}
		else
		{
			this.stateMachine.setPlayerDied();
			this.lifeContainer.innerHTML = "Lives: "+this.extraLives;
		}
	}

	deathAnimationFinishedHandler()
	{
		this.stateMachine.setResetting();
	}

	handleFinishedResetting()
	{
		this.stateMachine.setReadyScreen();
	}

	reset()
	{
		this.player.x = this.player.originX;
		this.player.y = this.player.originY;
		this.newDirection = -1;
		this.newdx = 0;
		this.newdy = 0;
	}

	readyScreen(event)
	{
		console.log(event);
		if (event.detail==undefined)
		{
			this.nextLevel();
		}
		
	}

	handleLevelClear()
	{
		clearInterval(this.currentGameInterval);
		this.stateMachine.setReadyScreen();
	}
}