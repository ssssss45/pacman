class pacman
{
	constructor(params)
	{
		if (localStorage.pacmanGameTopPlayers != undefined)
		{
			this.topPlayers = JSON.parse(localStorage.pacmanGameTopPlayers);	
		}
		
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

		this.enemies = params.enemies;

		this.ticksVulnerable = params.ticksVulnerable;

		this.outOfCagePoint = {};

		var recordInputPlace = params.hight + 50;
		this.recordInput = document.createElement("input");
		this.recordInput.setAttribute("style","position:absolute; top:" + recordInputPlace + "px; width:40px" );
		this.recordInput.setAttribute("maxlength", 3);
		this.recordInput.style.visibility = "hidden";

		this.recordButton = document.createElement("button");
		this.recordButton.innerHTML="Enter name";
		this.recordButton.setAttribute("style","position:absolute; top:" + recordInputPlace + "px; left: 50px");
		this.recordButton.setAttribute("onClick","pacmanGame.addScore()");
		this.recordButton.style.visibility = "hidden";
		this.container.appendChild(this.recordButton);
		this.container.appendChild(this.recordInput);

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
			"container" : "pacman-container",
			"enemies" : this.enemies
		});

		this.canvas = this.renderer.returnContainer();

		this.startExtraLives = params.startExtraLives || 2;
		this.extraLives = this.startExtraLives;
		this.enemyArray = [];

		//стейт машина
		this.stateMachine = new pacmanStateMachine();

		//контроллер
		this.keycon = new keyboardController();
		this.keycon.attach(this.canvas);
		addKeyToController("left",[37],this.keycon);
		addKeyToController("right",[39],this.keycon);
		addKeyToController("up",[38],this.keycon);
		addKeyToController("down",[40],this.keycon);
		addKeyToController("d",[88],this.keycon);

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
		document.addEventListener("Pacman: enter high score", this.handleEnterScore.bind(this));
		document.addEventListener("visibilitychange", this.tabChanged.bind(this));
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
		this.renderer.boundDestroyLevel(true);
		this.currentLevelNumber++;
		this.enemyArray = [];
		if (this.currentLevelNumber == this.levels.length)
		{
			this.currentLevelNumber = 0;
		}

		this.currentLevelFood = 0;

		this.currentLevel = JSON.parse(JSON.stringify(this.levels[this.currentLevelNumber]));
		this.currentLevel[this.currentLevel.length] = [];
		for (var i = 0; i<this.currentLevel.length;i++)
		{
			for (var j = 0; j<this.currentLevel[0].length;j++)
			{
				var item = this.currentLevel[i][j];
				if (item == 6)
				{
					this.player = new character ({
							"isPlayer" : true,
							"x" : j,
							"y" : i,
							"originX" : j,
							"originY" : i,
							"renderer" : this.renderer,
							"eatsDots" : true,
							"score" : this.score,
							"id" : 6
							});
				}
				if (item > 6)
				{
					var enem;

					for (var k = 0; k < this.enemies.length; k++)
					{
						if (this.enemies[k].location == item)	
						{
							enem = this.enemies[k];
							
						}
					}

					if (enem != undefined)
					{
							var currentEnemy = new enemy({
								"isPlayer" : false,
								"x" : j,
								"y" : i,
								"originX" : j,
								"originY" : i,
								"renderer" : this.renderer,
								"eatsDots" : enem.eatsDots,
								"killsPlayer" : enem.killsPlayer,
								"moveType" : enem.moveType,
								"canBeVulnerable" : enem.canBeVulnerable,
								"delay" : enem.delay,
								"respawnDelay" : enem.respawnDelay,
								"scoreForDeath" : enem.scoreForDeath,
								"id" : item
								});
						this.enemyArray.push(currentEnemy);
					}
				}

				if (item == 2)
				{
					this.currentLevelFood++; 
				}

				if (item == -2)
				{
					this.outOfCagePoint.x = j;
					this.outOfCagePoint.y = i;
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
			var score = (this.player.move(this.newdx,this.newdy,this.newDirection, this.currentLevel)||0);
			//если съеден озверин, то всем противникам которые могут быть уязвимы и живы выдается уязвимость
			if (score == -1)
			{
				for (var i = 0; i < this.enemyArray.length; i++)
				{	
					var current = this.enemyArray[i];
					if ((current.canBeVulnerable)&&(!current.character.isDead))
					{
						current.vulnerable = this.ticksVulnerable + 1;
					}
				}
			}
			//если съедена точка то начисляются очки
			else
			{
				this.score += score;
			}
			this.moveTimer = -40;


			for (var i = 0; i < this.enemyArray.length; i++)
			{	
				var currentEnemy = this.enemyArray[i];

				var pastX = currentEnemy.character.x;
				var pastY = currentEnemy.character.y;

				if(currentEnemy.delay > 0)
				{
					currentEnemy.delay --;
				}
				else
				{
					if (currentEnemy.vulnerable > 0) 
					{
						currentEnemy.vulnerable--;
					}

					//проверка на то что противник мёртв и достиг начальной точки. если true то он "воскресает"
					if ((currentEnemy.isDead)&&(currentEnemy.character.x == currentEnemy.character.originX)&&(currentEnemy.character.y == currentEnemy.character.originY))
					{
						currentEnemy.isDead = false;
						currentEnemy.delay = currentEnemy.respawnDelay;
					}
						
					if (!currentEnemy.isDead)
					{
						//проверка на то чт опротивник вышел из клеткию если нет то выходит используя алгоритм A*
						if (!currentEnemy.outOfCage)
						{
							if ((currentEnemy.character.x == this.outOfCagePoint.x)&&(currentEnemy.character.y == this.outOfCagePoint.y))
							{
								currentEnemy.outOfCage = true;
							}
							else
							{
								currentEnemy.deadMove(this.currentLevel, this.outOfCagePoint.x, this.outOfCagePoint.y);			
							}
						}
						else
						{
							this.currentLevelFood = this.currentLevelFood - currentEnemy.move(this.currentLevel, this.player.x, this.player.y);
						}
					}
					else
					{
						currentEnemy.deadMove(this.currentLevel, currentEnemy.character.originX, currentEnemy.character.originY);
					}
					
					//проверка на столкновение игрока и противника	
					if (((this.player.x == currentEnemy.character.x)&&(this.player.y == currentEnemy.character.y))||((this.player.x == pastX)&&(this.player.y == pastY)))
					{
						//если противник уязвим то он погибает
						if (currentEnemy.vulnerable > 0) 
						{
							currentEnemy.vulnerable = 0;
							currentEnemy.isDead = true;
							this.score +=currentEnemy.scoreForDeath;
							currentEnemy.outOfCage = false;
							currentEnemy.clearData();
						}
						//если нет, противник может есть игрока и жив, то погибает игрок
						else
						{
							if((currentEnemy.killsPlayer == true) && (!currentEnemy.isDead))
							{
								this.playerDeath()	
							}
						}
					}
				}
			}
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
██████╗ ███████╗ ██████╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝
██████╔╝█████╗  ██║     ██║   ██║██████╔╝██║  ██║███████╗
██╔══██╗██╔══╝  ██║     ██║   ██║██╔══██╗██║  ██║╚════██║
██║  ██║███████╗╚██████╗╚██████╔╝██║  ██║██████╔╝███████║
╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝
*/
	addScore()
	{
		var record = {
			"name" : this.recordInput.value,
			"score" : this.score
		}
		
		if (this.topPlayers == undefined)
		{
			this.topPlayers = [];
		}

		var scoreToReplace = -1;
		//поиск меньшего рекорда в массиве
		for (var i = this.topPlayers.length - 1; i > -1; i--)
		{
			if (this.topPlayers[i].score < this.score)
			{
				scoreToReplace = i;
			}
		}
		//если меньший рекорд не найден смотрим длинну массива - если он меньше пяти, то дописываем наш рекорд в конец
		if ((scoreToReplace == -1) && (this.topPlayers.length < 5))
		{
			this.topPlayers.push(record);
		}

		//если рекорд найден то вставляем его в массив, а потом удаляем пятый элемент
		if (scoreToReplace != -1)
		{
			this.topPlayers.splice(scoreToReplace,0,record);
			this.topPlayers.splice(5,1);
		}
		localStorage.pacmanGameTopPlayers = JSON.stringify(this.topPlayers);
		console.log(localStorage.pacmanGameTopPlayers);
		this.recordInput.style.visibility = "hidden";
		this.recordButton.style.visibility = "hidden";
		this.stateMachine.setGameOver(this.topPlayers);
	}

/*
███████╗██╗   ██╗      ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
██╔════╝██║   ██║      ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
█████╗  ██║   ██║      ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
██╔══╝  ╚██╗ ██╔╝      ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
███████╗ ╚████╔╝██╗    ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
╚══════╝  ╚═══╝ ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
*/

	tabChanged()
	{
		if ((document.hidden)||(this.stateMachine.state!=3)) {this.stateMachine.setPause();}
	}

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
			var highScore = this.topPlayers.length<5;
			for (var i = 0; i < this.topPlayers.length; i++)
			{
				if (this.topPlayers[i].score < this.score)
				{
					highScore = true;
				}
			}
			if (highScore)
			{
				this.stateMachine.setEnterHighScore(this.score)
			}
			else
			{
				this.stateMachine.setGameOver(this.topPlayers);	
			}
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
		for (var i = 0; i<this.enemyArray.length;i++)
		{
			var enemy = this.enemyArray[i]
			enemy.character.x = enemy.character.originX;
			enemy.character.y = enemy.character.originY;
			enemy.isDead = false;
			enemy.vulnerable = 0;
			enemy.outOfCage = false;
			enemy.delay = enemy.defaultDelay;
			enemy.clearData();
		}
		this.player.x = this.player.originX;
		this.player.y = this.player.originY;
		this.newDirection = -1;
		this.newdx = 0;
		this.newdy = 0;
	}

	readyScreen(event)
	{
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

	handleEnterScore()
	{
		this.recordInput.value = "";
		this.recordInput.style.visibility = "visible";
		this.recordButton.style.visibility = "visible";
	}
}