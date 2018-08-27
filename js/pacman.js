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
		this.lifeMax = params.lifeMax;
		var waitForEvent = params.waitForEvent;

		//инициализация отрисовки
		this.renderer = new pacmanRenderer({
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

		//если задано событие то ждем его, если нет то переходим в Idle
		if (waitForEvent != undefined)
		{
			document.addEventListener(waitForEvent, this.switchToIdle.bind(this));
		}
		else
		{
			this.switchToIdle();
		}

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
	}

	switchToIdle()
	{
		this.stateMachine.setIdle();
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
		clearInterval(this.currentGameInterval);
		this.score = 0;
		this.extraLives = this.startExtraLives;
		this.updateLives();
		this.updateScore();
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
							locationDistance : enem.locationDistance
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

		if ((this.newDirection != -1) && (this.moveTimer >= 120))
		{
			var score = (this.player.move(this.newdx, this.newdy, this.newDirection, this.currentLevel) || 0);
			
			//если съеден озверин, то всем противникам которые могут быть уязвимы и живы выдается уязвимость
			if (score == -1)
			{
				var event = new CustomEvent("Pacman: ozverin eaten");
				document.dispatchEvent(event);
				changeEnemyParams(this.enemyArray, this.ticksVulnerable);
			}
			//если съедена точка то начисляются очки
			else
			{
				this.score += score;
				if (score == 1) this.updateScore("dot");
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

					//добавление задержки и озверина
					changeEnemyParams(this.enemyArray, current.ozv, current.freeze);
					//добавление очков
					if (current.points != 0)
					{
						this.score += current.points;
						this.renderer.displayScore(current.points, current.x,current.y)
					}
					this.updateScore("bonus");
					//добавление жизней, уменьшение жизней до максимума если получилось больше, и передача количества отрисовщику (для звука конца игры)
					if (current.lives != 0)
					{
						this.extraLives += current.lives;
						if (this.extraLives > this.lifeMax)
						{
							this.extraLives = this.lifeMax;
						}	
						this.renderer.extraLives = this.extraLives;
						this.updateLives();
						this.renderer.displayScore(current.lives, current.x,current.y, true)
					}
				}
			}
			//функция, начислающая противникам уязвимость и задержку
			function changeEnemyParams (enemyArray, amount, delay)
			{
				for (var i = 0; i < enemyArray.length; i++)
				{	
					var current = enemyArray[i];
					if ((current.canBeVulnerable) && (!current.isDead) && (amount != undefined) && (amount > 0))
					{
						current.setVulnerable();
						current.vulnerable += amount;
					}

					if ((delay > 0) && (delay != undefined) && (!current.isDead) && ((current.state == "free")||(current.state == "vulnerable")))
					{
						current.clearData();
						current.setParalyzed();
						current.delay += delay;
					}
				}
			}

			var minDistanceToEnemy = this.currentLevel.length;
			for (var i = 0; i < this.enemyArray.length; i++)
			{	
				var currentEnemy = this.enemyArray[i];

				var pastX = currentEnemy.character.x;
				var pastY = currentEnemy.character.y;

				var result = currentEnemy.go(this.currentLevel, this.player.x, this.player.y, this.outOfCagePoint.x, this.outOfCagePoint.y) ;
				//если противник может есть точки то result будет равен 1
				if (result == 1){this.currentLevelFood -= result;}

				//проверка на столкновение игрока и противника	
				if (((this.player.x == currentEnemy.character.x) && (this.player.y == currentEnemy.character.y))||((this.player.x == pastX)&&(this.player.y == pastY)))
				{
					//если противник уязвим то он погибает
					if (currentEnemy.vulnerable > 0) 
					{
						currentEnemy.vulnerable = 0;
						currentEnemy.setDead();
						this.score += currentEnemy.scoreForDeath;
						this.updateScore("enemy");
						currentEnemy.clearData();
						currentEnemy.delay = 0;
					}
					//если нет, противник может есть игрока и жив, то погибает игрок
					else
					{
						if((currentEnemy.killsPlayer == true) && (currentEnemy.state!="dead"))
						{
							this.playerDeath()	
						}
					}
				}
				//переключение скорости игровой музыки в зависимости от близости противника
				var event = new CustomEvent("Pacman: closest enemy to player",{
					detail: {
						distance : minDistanceToEnemy
					}
				});
				document.dispatchEvent(event);
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
		//если еда на уровне закончилась, то переходим на следующий
		if (this.currentLevelFood == 0)
		{
			clearInterval(this.currentGameInterval);
			this.stateMachine.setLevelClearScreen();
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
	//обновление счетчика жизней
	updateLives()
	{
		var event = new CustomEvent("Pacman: amount of lives changed",{
			detail: {lives: this.extraLives}
		});
		document.dispatchEvent(event);
	}

	getLives()
	{
		return this.extraLives;
	}

/*
███████╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
███████╗██║     ██║   ██║██████╔╝█████╗  
╚════██║██║     ██║   ██║██╔══██╗██╔══╝  
███████║╚██████╗╚██████╔╝██║  ██║███████╗
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
*/

	//обновление счетчика очков
	updateScore(reason)
	{
		var event = new CustomEvent("Pacman: score changed",{
			detail: {score: this.score, reason: reason}
		});
		document.dispatchEvent(event);
	}

	getScore()
	{
		return this.score;
	}

/*
████████╗ ██████╗ ██████╗     ███████╗ ██████╗ ██████╗ ██████╗ ███████╗███████╗
╚══██╔══╝██╔═══██╗██╔══██╗    ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝
   ██║   ██║   ██║██████╔╝    ███████╗██║     ██║   ██║██████╔╝█████╗  ███████╗
   ██║   ██║   ██║██╔═══╝     ╚════██║██║     ██║   ██║██╔══██╗██╔══╝  ╚════██║
   ██║   ╚██████╔╝██║         ███████║╚██████╗╚██████╔╝██║  ██║███████╗███████║
   ╚═╝    ╚═════╝ ╚═╝         ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
*/
	//добавление рекорда в таблицу лидеров
	addScore(name)
	{
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
	//возвращение всех на изначальные позиции после гибели игрока
	reset()
	{
		//возвращение противников
		for (var i = 0; i < this.enemyArray.length;i++)
		{
			this.enemyArray[i].reset();
		}
		//возвращение и удаление бонусов
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
		//возвращение игрока
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
		var event = new CustomEvent("Pacman: closest enemy to player",{
			detail: {
				distance : this.currentLevel.length
			}
		});

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

	loadingFinishedHandler()
	{
		this.stateMachine.setIdle();
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