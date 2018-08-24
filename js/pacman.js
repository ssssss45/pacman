class pacman
{
	constructor(params)
	{
		if (localStorage.pacmanGameTopPlayersList != undefined)
		{
			this.topPlayers = JSON.parse(localStorage.pacmanGameTopPlayersList);	
		}
		
		//уровни
		this.levels = params.levels;
		//DOM контейнер для генерации игры
		this.container = document.getElementById(params.container);

		//получение параметров
		this.bottomContainerHight =  params.bottomContainerHight;
		this.enemies = params.enemies;
		this.ticksVulnerable = params.ticksVulnerable || 100;
		this.startExtraLives = params.startExtraLives || 2;
		this.bonuses = params.bonuses;

		//добавление элементов управления
		var startPlace = params.hight * 0.9;
		var startPlaceHorizontal = params.width / 2.5;
		var recordInputPlace = params.hight / 2 + 20;
		var recordInputPlaceHorizontal = params.width / 2 - 20;
		var pausePlace = params.hight + this.bottomContainerHight/2;
		var scorePlace = params.hight + 10;
		
		//инпут для ввода рекордов
		this.recordInput = elementGenerator("input", undefined, recordInputPlace, recordInputPlaceHorizontal, 40, "hidden", undefined, this.container);
		this.recordInput.setAttribute("maxlength", 3);
		
		//кнопка начала игры
		this.startButton = elementGenerator("button","New game", startPlace, startPlaceHorizontal, startPlaceHorizontal/2, "hidden", "pacmanGame.startPressed()", this.container);
		
		//кнопка ввода рекордов
		recordInputPlace += 20;
		this.recordButton = elementGenerator("button","Enter name", recordInputPlace, recordInputPlaceHorizontal, undefined, "hidden", "pacmanGame.addScore()", this.container);
		
		//кнопка паузы
		this.pauseButton = elementGenerator("button","Pause", pausePlace, undefined, undefined, "hidden", "pacmanGame.pausePressed()", this.container);

		//кнопка продолжения игры
		this.continueButton = elementGenerator("button","Continue", recordInputPlace, recordInputPlaceHorizontal - 55, 150, "hidden", "pacmanGame.pausePressed()", this.container);

		//кнопка возвращения в начальный экран
		this.toIdleButton = elementGenerator("button","Return to welcome screen", recordInputPlace+20, recordInputPlaceHorizontal - 55, 150, "hidden", "pacmanGame.returnPressed()", this.container);

		//контейнер с очками
		this.scoreContainer = elementGenerator("div", "", scorePlace, undefined, undefined, "visible", undefined, this.container);
		this.scoreContainer.style.color = "white";
		
		//контейнер с количеством жизней
		this.lifeContainer = elementGenerator("div", "", scorePlace,  params.width/2, undefined, "visible", undefined, this.container);
		this.lifeContainer.style.color = "white";

		//инициализация отрисовки
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
			"startExtraLives" : params.startExtraLives,
			"width" : params.width,
			"hight" : params.hight,
			"bottomContainerHight" : params.bottomContainerHight,
			"scoreContainerHight" : params.scoreContainerHight,
			"levels":this.levels,
			"playerSpritesLocations" : params.playerSpritesLocations,
			"playerDeathSpritesLocations" : params.playerDeathSpritesLocations,
			"container" : "pacman-container",
			"enemies" : this.enemies,
			"bonuses" : this.bonuses
		});

		//задание переменных которые понадобятся при создании уровня и игре
		this.canvas = this.renderer.returnContainer();
		this.outOfCagePoint = {};
		this.enemyArray = [];
		this.score = 0;
		this.leftActive = false;
		this.rightActive = false;
		this.downActive = false;
		this.upActive = false;
		this.currentLevelNumber = -1;

		//стейт машина
		this.stateMachine = new pacmanStateMachine();

		//контроллер
		this.keycon = new keyboardController();
		this.keycon.attach(this.canvas);
		addKeyToController("left",[37],this.keycon);
		addKeyToController("right",[39],this.keycon);
		addKeyToController("up",[38],this.keycon);
		addKeyToController("down",[40],this.keycon);

		//слушатели на события контроллера
		this.canvas.addEventListener("controls:activate",
			this.activateListenerActions.bind(this));
		this.canvas.addEventListener("controls:deactivate",
			this.deactivateListenerActions.bind(this));

		//слушатели на события стейт машины и отрисовщика
		document.addEventListener("Pacman: game start", this.startPlaying.bind(this));
		document.addEventListener("Pacman: ready screen", this.readyScreen.bind(this));
		document.addEventListener("Pacman: game paused", this.pauseHandler.bind(this));
		document.addEventListener("Pacman: new game", this.gameStart.bind(this));
		document.addEventListener("Pacman: player death animation finished", this.deathAnimationFinishedHandler.bind(this));
		document.addEventListener("Pacman: resetting", this.reset.bind(this));
		document.addEventListener("Pacman: resetting finished", this.handleFinishedResetting.bind(this));
		document.addEventListener("Pacman: level clear", this.handleLevelClear.bind(this));
		document.addEventListener("Pacman: enter high score", this.handleEnterScore.bind(this));
		document.addEventListener("Pacman: game over", this.gameOverHandler.bind(this));
		document.addEventListener("Pacman: idle", this.idleHandler.bind(this));
		document.addEventListener("visibilitychange", this.tabChanged.bind(this));
		document.addEventListener("Pacman: loading finished", this.loadingFinishedHandler.bind(this));

		//функция передачи кнопок в контроллер
		function addKeyToController(name,keys,keycon)
		{
			var key={
				name: name,
				keys: keys,
				active: true
			};
			keycon.bindActions(key);
		}

		//функция генерации элементов управления
		function elementGenerator(type, text, top, left, width, visibility, onclick, container)
		{
			var button = document.createElement(type);
			button.innerHTML = text;
			button.setAttribute("style","position:absolute; z-index:1; top:"+top+"px; left:"+left+"px; width:"+width+"px;");
			button.style.visibility = visibility;
			button.setAttribute("onClick",onclick);
			container.appendChild(button);
			return button;
		}
	}
/*
██╗  ██╗███████╗██╗   ██╗     █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
██║ ██╔╝██╔════╝╚██╗ ██╔╝    ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
█████╔╝ █████╗   ╚████╔╝     ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
██╔═██╗ ██╔══╝    ╚██╔╝      ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
██║  ██╗███████╗   ██║██╗    ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
╚═╝  ╚═╝╚══════╝   ╚═╝╚═╝    ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
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
		this.pauseButton.style.visibility = "visible";
		this.startButton.style.visibility = "hidden";
		clearInterval(this.currentGameInterval);
		this.score = 0;
		this.scoreContainer.innerHTML="Score: 0";
		this.extraLives = this.startExtraLives;
		this.lifeContainer.innerHTML="Lives: " + this.extraLives;
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

		this.renderer.boundDraw(this.currentLevelNumber);

		this.currentLevelBonuses = [];
		for (var i = 0; i < this.bonuses.length; i++)
		{
			if (this.bonuses[i].existsOnLevels.includes(this.currentLevelNumber))
			{
				var bonus = new Bonus(this.bonuses[i].params);
				this.currentLevelBonuses.push(bonus);
			}
		}

		this.currentLevelFood = 0;

		this.currentLevel = JSON.parse(JSON.stringify(this.levels[this.currentLevelNumber]));
		this.currentLevel[this.currentLevel.length] = [];
		for (var i = 0; i < this.currentLevel.length; i++)
		{
			for (var j = 0; j < this.currentLevel[0].length; j++)
			{
				//создание объекта игрока
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
				//создание объектов противников
				if (item > 6)
				{
					var enem = undefined;

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
							"id" : item,
							"idleMode" : enem.idleMode,
							"locationDistance" : enem.locationDistance
							});
						this.enemyArray.push(currentEnemy);
					}

					//запоминание координат появления бонусов если они есть
					for (var k = 0; k < this.currentLevelBonuses.length; k++)
					{

						var bonus = this.currentLevelBonuses[k];
						if (item == this.currentLevelBonuses[k].location)
						{
							bonus.x = j;
							bonus.y = i;
						}
					}

				}
				//подсчет еды
				if (item == 2)
				{
					this.currentLevelFood++; 
				}
				//запоминание точки выхода из клетки
				if (item == -2)
				{
					this.outOfCagePoint.x = j;
					this.outOfCagePoint.y = i;
				}
			}
		}
		//создание бонусов в начале уровня
		for (var k = 0; k < this.currentLevelBonuses.length; k++)
		{
			var bonus = this.currentLevelBonuses[k];
			if (bonus.spawnsAtStart)
			{
				if (bonus.location!=0)
				{
					this.renderer.spawnBonusSprite(bonus.x,bonus.y,k);
				}
				else
				{
					this.generateRandomLocationForBonus(bonus);
					this.renderer.spawnBonusSprite(bonus.x,bonus.y,k);
				}	
			}
		}
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
			var score = (this.player.move(this.newdx,this.newdy,this.newDirection, this.currentLevel) || 0);
			//если съеден озверин, то всем противникам которые могут быть уязвимы и живы выдается уязвимость
			if (score == -1)
			{
				changeEnemyParams(this.enemyArray, this.ticksVulnerable);
			}
			//если съедена точка то начисляются очки
			else
			{
				this.score += score;
				this.currentLevelFood -= score;
			}
			this.moveTimer = -40;

			//проверка не съедение бонуса
			for (var i = 0; i < this.currentLevelBonuses.length; i++)
			{	

				var current = this.currentLevelBonuses[i];
				if ((current.isOnField) && (this.player.x == current.x) && (this.player.y == current.y))
				{
					this.renderer.removeBonusSprite(i);
					current.isOnField = false;
					this.updateLives();
					changeEnemyParams(this.enemyArray, current.ozv, current.freeze);

					if (current.points != 0)
					{
						this.score += current.points;
						this.renderer.dislpayScore(current.points, current.x,current.y)
					}

					if (current.lives != 0)
					{
						this.extraLives += current.lives;
						this.renderer.dislpayScore(current.lives, current.x,current.y, true)
					}
				}
			}

			function changeEnemyParams (enemyArray, amount, delay)
			{
				for (var i = 0; i < enemyArray.length; i++)
				{	
					var current = enemyArray[i];
					if ((current.canBeVulnerable) && (!current.character.isDead) && (amount != undefined))
					{
						current.vulnerable += amount;
					}

					if ((delay != undefined) && (!current.isDead))
					{
						current.clearData();
						current.delay += delay;
					}
				}
			}

/*
███████╗███╗   ██╗███████╗███╗   ███╗       ███╗   ███╗ ██████╗ ██╗   ██╗███████╗
██╔════╝████╗  ██║██╔════╝████╗ ████║       ████╗ ████║██╔═══██╗██║   ██║██╔════╝
█████╗  ██╔██╗ ██║█████╗  ██╔████╔██║       ██╔████╔██║██║   ██║██║   ██║█████╗  
██╔══╝  ██║╚██╗██║██╔══╝  ██║╚██╔╝██║       ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  
███████╗██║ ╚████║███████╗██║ ╚═╝ ██║██╗    ██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗
╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝    ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝
*/

			var minDistanceToEnemy = this.currentLevel.length;
			for (var i = 0; i < this.enemyArray.length; i++)
			{	
				var currentEnemy = this.enemyArray[i];

				var pastX = currentEnemy.character.x;
				var pastY = currentEnemy.character.y;

				//проверка на то что противник мёртв и достиг начальной точки. если true то он "воскресает"
				if ((currentEnemy.isDead) && (currentEnemy.character.x == currentEnemy.character.originX) && (currentEnemy.character.y == currentEnemy.character.originY))
				{
					currentEnemy.isDead = false;
					currentEnemy.delay = currentEnemy.respawnDelay;
				}

				//если противник уязвим то уменьшаем счетчик уязвимости
				if (currentEnemy.vulnerable > 0) 
				{
					if (currentEnemy.vulnerable == 1)
					{
						currentEnemy.clearData();
					}
					currentEnemy.vulnerable--;
				}

				if(currentEnemy.delay > 0)
				{
					currentEnemy.delay --;
					if (!currentEnemy.outOfCage)
					{
						currentEnemy.idle(this.currentLevel);
					}
					else
					{
						currentEnemy.standInPlace(this.currentLevel);
					}
				}
				else
				{
					
					if (!currentEnemy.isDead)
					{
						var currentEnemyDistance = currentEnemy.distanceToPlayer(this.player.x,this.player.y)
						//подсчет минимального расстояния до игрока. нужен для изменения музыки
						if (minDistanceToEnemy > currentEnemyDistance)
						{
							minDistanceToEnemy = currentEnemyDistance;
						}
						//проверка на то чт опротивник вышел из клетки. если нет то выходит используя алгоритм A*
						if (!currentEnemy.outOfCage)
						{
							if ((currentEnemy.character.x == this.outOfCagePoint.x)&&(currentEnemy.character.y == this.outOfCagePoint.y))
							{
								currentEnemy.outOfCage = true;
							}
							else
							{
								//выход из клетки
								currentEnemy.deadMove(this.currentLevel, this.outOfCagePoint.x, this.outOfCagePoint.y);			
							}
						}
						else
						{
							//если противнику уязвим то он пытается убежать
							if (currentEnemy.vulnerable > 0)
							{
								var result = currentEnemy.escape(this.currentLevel, this.player.x, this.player.y);
							}
							else
							{
							//если нет то двигается нормально
								var result = currentEnemy.move(this.currentLevel, this.player.x, this.player.y);	
							}
							 
							if (result == 1){this.currentLevelFood -= result;}
						}
					}
					else
					{	//движение в точку воскрешения, если противник мертв
						currentEnemy.deadMove(this.currentLevel, currentEnemy.character.originX, currentEnemy.character.originY);
					}
				}

				//проверка на столкновение игрока и противника	
				if (((this.player.x == currentEnemy.character.x)&&(this.player.y == currentEnemy.character.y))||((this.player.x == pastX)&&(this.player.y == pastY)))
				{
					//если противник уязвим то он погибает
					if (currentEnemy.vulnerable > 0) 
					{
						currentEnemy.vulnerable = 0;
						currentEnemy.setDead();
						this.score += currentEnemy.scoreForDeath;
						currentEnemy.outOfCage = false;
						currentEnemy.clearData();
						currentEnemy.delay = 0;
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

				this.renderer.switchGameSongSpeed(minDistanceToEnemy);
			}
/*
██████╗  ██████╗ ███╗   ██╗██╗   ██╗███████╗███████╗███████╗
██╔══██╗██╔═══██╗████╗  ██║██║   ██║██╔════╝██╔════╝██╔════╝
██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗█████╗  ███████╗
██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║██╔══╝  ╚════██║
██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝███████║███████╗███████║
╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝
*/
		for (var i = 0; i < this.currentLevelBonuses.length; i ++)
			{
				var bonus = this.currentLevelBonuses[i];
				//если у бонуса есть таймер до появления то уменьшаем его
				if ((bonus.timeToSpawn > 0) && (!bonus.isOnField)) {bonus.timeToSpawn --}
				//если таймер дошёл до нуля и spawns!=0 то создаем бонус
				if ((bonus.timeToSpawn == 0) && (!bonus.isOnField) && (bonus.spawns != 0))
				{
					bonus.isOnField = true;
					bonus.timeToSpawn = bonus.spawns;
					//если у бонуса есть локация то генерируем его туда
					if (bonus.location != 0)
					{
						this.renderer.spawnBonusSprite(bonus.x, bonus.y, i);
					}
					//если нет то генерируем случайное метоположение где нет ничего	
					else
					{
						this.generateRandomLocationForBonus(bonus);
						this.renderer.spawnBonusSprite(bonus.x, bonus.y, i);
					}
				
				}
			}
		}

		this.moveTimer = this.moveTimer + 40;
		if (oldscore != this.score)
		{
			this.scoreContainer.innerHTML="Score: "+this.score;
			if (this.currentLevelFood == 0)
			{
				clearInterval(this.currentGameInterval);
				this.stateMachine.setLevelClearScreen();
			}
		}	
	}

/*
██╗     ██╗██╗   ██╗███████╗███████╗
██║     ██║██║   ██║██╔════╝██╔════╝
██║     ██║██║   ██║█████╗  ███████╗
██║     ██║╚██╗ ██╔╝██╔══╝  ╚════██║
███████╗██║ ╚████╔╝ ███████╗███████║
╚══════╝╚═╝  ╚═══╝  ╚══════╝╚══════╝
*/
	updateLives()
	{
		this.lifeContainer.innerHTML = "Lives: "+this.extraLives;;
	}

/*
████████╗ ██████╗ ██████╗     ███████╗ ██████╗ ██████╗ ██████╗ ███████╗███████╗
╚══██╔══╝██╔═══██╗██╔══██╗    ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝
   ██║   ██║   ██║██████╔╝    ███████╗██║     ██║   ██║██████╔╝█████╗  ███████╗
   ██║   ██║   ██║██╔═══╝     ╚════██║██║     ██║   ██║██╔══██╗██╔══╝  ╚════██║
   ██║   ╚██████╔╝██║         ███████║╚██████╗╚██████╔╝██║  ██║███████╗███████║
   ╚═╝    ╚═════╝ ╚═╝         ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
*/
	addScore()
	{
		var name =  this.recordInput.value;
		while (name.length < 3)
		{
			name +=" ";
		}
		var record = {
			"name" : name,
			"score" : this.score
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
		localStorage.pacmanGameTopPlayersList = JSON.stringify(this.topPlayers);
		this.recordInput.style.visibility = "hidden";
		this.recordButton.style.visibility = "hidden";
		this.stateMachine.setGameOver(this.topPlayers);
	}

/*
██████╗ ███████╗███████╗███████╗████████╗
██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝
██████╔╝█████╗  ███████╗█████╗     ██║   
██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║   
██║  ██║███████╗███████║███████╗   ██║   
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   
*/

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

		for (var i = 0; i < this.currentLevelBonuses.length; i++)
		{
			var bonus = this.currentLevelBonuses[i];
			if (!bonus.spawnsAtStart)
			{
				this.renderer.removeBonusSprite(i,true)
				bonus.timeToSpawn = bonus.spawns;
				bonus.isOnField = false;
			}
		}

		this.player.x = this.player.originX;
		this.player.y = this.player.originY;
		this.newDirection = -1;
		this.newdx = 0;
		this.newdy = 0;
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
			this.continueButton.style.visibility = "visible";
			this.toIdleButton.style.visibility = "visible";
			clearInterval(this.currentGameInterval);	
		}
		else
		{
			this.continueButton.style.visibility = "hidden";
			this.toIdleButton.style.visibility = "hidden";
			this.currentGameInterval = setInterval(this.gameStep.bind(this),40);
		}
	}

	startPressed()
	{
		this.stateMachine.setNewGame();
	}

	returnPressed()
	{
		this.stateMachine.setIdle();
	}

	playerDeath()
	{
		clearInterval(this.currentGameInterval);

		this.extraLives--;

		if (this.extraLives == -1)
		{
			if (this.topPlayers == undefined)
			{
				this.topPlayers = [];
			}

			this.pauseButton.style.visibility = "hidden";
			var highScore = (this.topPlayers.length < 5);
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
			this.updateLives();
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

	gameOverHandler()
	{
		this.startButton.style.visibility = "visible";
	}

	loadingFinishedHandler()
	{
		this.stateMachine.setIdle();
		this.startButton.visible = true;
	}

	idleHandler()
	{
		this.startButton.style.visibility = "visible";
		this.continueButton.style.visibility = "hidden";
		this.toIdleButton.style.visibility = "hidden";
		this.pauseButton.style.visibility = "hidden";
		this.scoreContainer.innerHTML = "";
		this.lifeContainer.innerHTML = "";
	}

	generateRandomLocationForBonus(bonus)
	{
		var hight = this.currentLevel.length - 1;
		var width = this.currentLevel[0].length - 1;
		var y = getRandomInt(0, hight);
		var x = getRandomInt(0, width);
		while (this.currentLevel[y][x] != 0)
		{
			x = getRandomInt(0, width);
			y = getRandomInt(0, hight);
		}

		bonus.x = x;
		bonus.y = y;

		function getRandomInt(min, max) 
		{
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	}
}