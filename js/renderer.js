class pacmanRenderer
{
	constructor(params)
	{
		this.pathToSpriteSheet = params.pathToSpriteSheet; 
		this.spriteSheetWidth = params.spriteSheetWidth;
		this.spriteSheetHight = params.spriteSheetHight;
		this.spriteSheetWidthSprites = params.spriteSheetWidthSprites;
		this.spriteSheetHightSprites = params.spriteSheetHightSprites;
		this.enemies = params.enemies;
		this.startExtraLives = params.startExtraLives;
		this.bonuses = params.bonuses;
		
		this.spriteSheetBorderLeft = params.spriteSheetBorderLeft || 0;
		this.spriteSheetBorderTop = params.spriteSheetBorderTop || 0;

		this.spriteHight = Math.round((this.spriteSheetHight - this.spriteSheetBorderTop - params.spriteSheetBorderBottom)/this.spriteSheetHightSprites);
		this.spriteWidth = Math.round((this.spriteSheetWidth - this.spriteSheetBorderLeft - params.spriteSheetBorderRight)/this.spriteSheetWidthSprites);

		this.gameWidth = params.width;
		this.gameHight = params.hight;
		this.bottomContainerHight = params.bottomContainerHight;
		this.playerSpritesLocations = params.playerSpritesLocations;
		this.playerDeathSpritesLocations = params.playerDeathSpritesLocations;
		this.container = document.getElementById(params.container);

		this.bitMask=[[1,2,4],[8,0,16],[32,64,128]];
		this.gameCanvas = new PIXI.Application({width: this.gameWidth, height: this.gameHight + this.bottomContainerHight});
		this.container.appendChild(this.gameCanvas.view);

		this.playerTextures = [];
		this.playerDeathTextures = [];
		this.enemySprites = [];
		this.enemyTextures = [];

		this.createWallSheet();
		this.loadSpriteSheet();

		this.boundRenderMovement = this.renderMovement.bind(this)
		this.boundDestroyLevel = this.destroyLevel.bind(this);

		this.interactiveSprites = [];

		//создание полупрозрачного экрана для паузы
		var pauseTexture = 	new PIXI.Texture(
          	PIXI.Texture.fromCanvas(this.gameCanvas.view, PIXI.SCALE_MODES.LINEAR),
          	new PIXI.Rectangle(0, 0, 1, 1)
        	);
		this.pauseBox = new PIXI.Sprite(pauseTexture);
		this.pauseBox.x = 0;
		this.pauseBox.y = 0;
		this.pauseBox.width = this.gameWidth;
		this.pauseBox.height = this.gameHight;
		this.pauseBox.notDestroy = true;
		this.pauseText = textGen("GAME PAUSED", this.gameWidth/10,this.gameWidth/5,this.gameHight/2-this.gameWidth/10,true);
		this.pauseText.pauseBox = true;

		//надпись в случае конца игры
		this.gameOverText = textGen("", this.gameWidth/10,0,0,true);
		this.gameOverScore = textGen("", this.gameWidth/10,0,this.gameHight/10,true);

		//надпись загрузки
		this.loadingText = textGen("Loading", this.gameWidth/10,this.gameWidth/4,this.gameHight/1.2,true);
		this.gameCanvas.stage.addChild(this.loadingText);

		//текст экрана приветствия
		this.welcomeText = textGen("PAC-MAN", this.gameWidth/10,this.gameWidth/4,this.gameHight/2-this.gameWidth/10,true);
		this.welcomeText.pauseBox = true;

		//круг экрана приветствия
		this.welcomePac = new PIXI.Graphics();
		this.welcomePac.beginFill(0xFFFF00);
		this.welcomePac.drawCircle(this.gameWidth/2,this.gameHight/3*2,this.gameHight/8);
		this.welcomePac.notDestroy = true;

		this.gameCanvas.stage.addChild(this.welcomePac);
		this.gameCanvas.stage.addChild(this.welcomeText);

		this.halfPI = Math.PI/2;

		//текст экрана готовности
		this.readyScreenText = textGen("READY?", this.gameWidth/10,this.gameWidth/3,this.gameHight/2,true);

		//текст экрана ввода рекордов
		this.scoresScreenText = textGen("CONGRATULATIONS!\nYou reached the\nhigh scores!\nYour score: ", this.gameWidth/10,0,0,true);

		//функция генерации текстов
		function textGen(text, fontSize, x, y, notDestroy)
		{
			var text = new PIXI.Text(text,
			{
				"fontFamily" : 'Courier New', 
				"fontSize": fontSize, 
				"fill" : 0xFFFFFF, 
				"align" : 'left',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
			text.x = x;
			text.y = y;
			text.notDestroy = notDestroy;
			return text;
		}

		PIXI.loader
			.add([
				"resources/sounds/death.wav",
				"resources/sounds/dotEaten.wav",
				"resources/sounds/button.wav",
				"resources/sounds/idle.wav",
				"resources/sounds/gameSong.wav",
				"resources/sounds/scores.wav",
				"resources/sounds/walk.wav",
				"resources/sounds/gameOver.wav",
				"resources/sounds/ozv.wav",
				"resources/sounds/enemyWalk.mp3",
				"resources/sounds/eatEnemy.wav",
				"resources/sounds/bonus.wav"
				])
			.load(this.generateLoadedEvent.bind(this))
		this.scoreSpriteArray = [];
		this.levels = params.levels;
		this.boundDraw = this.draw.bind(this);
		//массив спрайтов бонусов
		this.spriteArray = [];
		document.addEventListener("Pacman: game paused", this.pause.bind(this));
		document.addEventListener("Pacman: game over", this.gameOver.bind(this));
		document.addEventListener("Pacman: player died", this.animatePlayerDeath.bind(this));
		document.addEventListener("Pacman: resetting", this.resetAfterDeath.bind(this));
		document.addEventListener("Pacman: ready screen", this.readyScreen.bind(this));
		document.addEventListener("Pacman: game start", this.removeReadyScreen.bind(this));
		document.addEventListener("Pacman: enter high score", this.handleEnterName.bind(this));
		document.addEventListener("Pacman: idle", this.idleHandler.bind(this));
		document.addEventListener("Pacman: new game", this.resetLives.bind(this));
	}

/*
███████╗██████╗ ██████╗ ██╗████████╗███████╗███████╗██╗  ██╗███████╗███████╗████████╗
██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝██║  ██║██╔════╝██╔════╝╚══██╔══╝
███████╗██████╔╝██████╔╝██║   ██║   █████╗  ███████╗███████║█████╗  █████╗     ██║   
╚════██║██╔═══╝ ██╔══██╗██║   ██║   ██╔══╝  ╚════██║██╔══██║██╔══╝  ██╔══╝     ██║   
███████║██║     ██║  ██║██║   ██║   ███████╗███████║██║  ██║███████╗███████╗   ██║   
╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝   
*/

	loadSpriteSheet()
	{
		this.spriteCanvas = new PIXI.Application({width: this.spriteSheetWidth, height: this.spriteSheetHight});
		var texture = PIXI.Texture.fromImage(this.pathToSpriteSheet);
		var spriteSheet = new PIXI.Sprite(texture);

		fillTextureArray(this.playerSpritesLocations, this.playerTextures, this);
		fillTextureArray(this.playerDeathSpritesLocations, this.playerDeathTextures, this);

		//текстуры врагов
		for (var i = 0; i < this.enemies.length; i++)
		{
			var enemy = this.enemies[i];
			this.enemyTextures[enemy.location] = {};
			this.enemyTextures[enemy.location].sprites = [];
			this.enemyTextures[enemy.location].deadSprites = [];
			this.enemyTextures[enemy.location].vulnerableSprites = [];
			fillTextureArray(enemy.spriteLocations, this.enemyTextures[enemy.location].sprites, this) ;
			fillTextureArray(enemy.deadSpriteLocations, this.enemyTextures[enemy.location].deadSprites, this) ;
			fillTextureArray(enemy.vulnerableSpriteLocations, this.enemyTextures[enemy.location].vulnerableSprites, this) ;
		}

		//текстуры бонусов
		for (var i = 0; i < this.bonuses.length; i++)
		{
			var bonus = this.bonuses[i];
			bonus.texture = new PIXI.Texture(
	          		texture,
	          		new PIXI.Rectangle(this.spriteWidth * bonus.textureLocation.y + this.spriteSheetBorderLeft, this.spriteHight * bonus.textureLocation.x + this.spriteSheetBorderTop, this.spriteWidth, this.spriteHight)
	        		);
		}

		function fillTextureArray(list, array, currThis)
		{
			for (var i = 0; i < list.length; i++)
			{
				var playerTexture =
			   		new PIXI.Texture(
	          		texture,
	          		new PIXI.Rectangle(currThis.spriteWidth * list[i].y + currThis.spriteSheetBorderLeft, currThis.spriteHight * list[i].x + currThis.spriteSheetBorderTop, currThis.spriteWidth, currThis.spriteHight)
	        		);
	        	array.push(playerTexture);
			}
		}
	}

/*
██╗    ██╗ █████╗ ██╗     ██╗     ███████╗██╗  ██╗███████╗███████╗████████╗
██║    ██║██╔══██╗██║     ██║     ██╔════╝██║  ██║██╔════╝██╔════╝╚══██╔══╝
██║ █╗ ██║███████║██║     ██║     ███████╗███████║█████╗  █████╗     ██║   
██║███╗██║██╔══██║██║     ██║     ╚════██║██╔══██║██╔══╝  ██╔══╝     ██║   
╚███╔███╔╝██║  ██║███████╗███████╗███████║██║  ██║███████╗███████╗   ██║   
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝   
*/

	createWallSheet()
	{
		this.wallsheetDiv = document.createElement('div');
		this.wallSheet = new PIXI.Application({width: 352, height: 96});
		this.container.appendChild(this.wallsheetDiv);

		//отрисовка канваса стен
		var rectangles = ['10,10,70,70,7','16,16,58,58,7','112,16,32,64,15','176,16,64,32,16','176,74,64,6,4','265,16,6,64,4'];
	
		addRectangles(rectangles, this.wallSheet.stage);
		function addRectangles(rectangles,stage)
		{
			for (var i = 0; i < rectangles.length; i++)
			{
				var current = rectangles[i].split(',');
				addRoundBox(Number(current[0]), Number(current[1]), Number(current[2]), Number(current[3]), Number(current[4]),stage);
			}
		}

		function addRoundBox(x,y,width,hight,radius,stage)
		{
			let roundBox = new PIXI.Graphics();
			roundBox.lineStyle(2, 0x99CCFF, 1);
			roundBox.drawRoundedRect(x, y, width, hight, radius)
			stage.addChild(roundBox);
		}

		//отрисовка ворот призраков
		var line = new PIXI.Graphics();
		line.lineStyle(5, 0xDAA520, 1);
		line.moveTo(32*9+15,0);
		line.lineTo(32*9+15,32);
		this.wallSheet.stage.addChild(line);

		line = new PIXI.Graphics();
		line.lineStyle(5, 0xDAA520, 1);
		line.moveTo(32*9,47);
		line.lineTo(32*10,47);
		this.wallSheet.stage.addChild(line);

		//отрисовка бонусов и озверина
		let circle = new PIXI.Graphics();
		circle.beginFill(0xDAA520);
		circle.drawCircle(32*10.5, 32*2.5, 3);
		circle.endFill();
		this.wallSheet.stage.addChild(circle);

		circle = new PIXI.Graphics();
		circle.beginFill(0xDAA520);
		circle.drawCircle(32*9.5, 32*2.5, 9);
		circle.endFill();
		this.wallSheet.stage.addChild(circle);

/*
████████╗███████╗██╗  ██╗████████╗██╗   ██╗██████╗ ███████╗███████╗
╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔════╝
   ██║   █████╗   ╚███╔╝    ██║   ██║   ██║██████╔╝█████╗  ███████╗
   ██║   ██╔══╝   ██╔██╗    ██║   ██║   ██║██╔══██╗██╔══╝  ╚════██║
   ██║   ███████╗██╔╝ ██╗   ██║   ╚██████╔╝██║  ██║███████╗███████║
   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
*/

		this.wallTextures = [];
		this.wallTexture = PIXI.Texture.fromCanvas(this.wallSheet.view, PIXI.SCALE_MODES.LINEAR);
		var cells = ['2,8,2','64,8,0','8,7,2','16,5,2','66,0,1','74,0,1','82,0,1','24,1,0','26,1,0','88,1,0','80,0,0','72,2,0','18,0,2','10,2,2'];

		fillCells(this.wallTextures, cells, this.wallTexture);

		//бонусы, озверин и стены призраков
        this.otherTextures = [];
        cells = ['2,10,2','3,9,2','4,9,1','5,9,0']
		fillCells(this.otherTextures, cells, this.wallTexture);

		//функии заполнения массива текстур
        function fillCells(array, cells, texture)
		{
			for (var i = 0; i < cells.length; i++)
			{
				var current = cells[i].split(',');
				addCell(array, Number(current[0]),Number(current[1]),Number(current[2]), texture);
			}
		}

		function addCell(array,cell, x, y, texture)
		{
			array[cell] = 
		   			new PIXI.Texture(
          			texture,
          			new PIXI.Rectangle(32*x, 32*y, 32, 32)
        			);
		}
	}	

/*
██████╗ ██████╗  █████╗ ██╗    ██╗
██╔══██╗██╔══██╗██╔══██╗██║    ██║
██║  ██║██████╔╝███████║██║ █╗ ██║
██║  ██║██╔══██╗██╔══██║██║███╗██║
██████╔╝██║  ██║██║  ██║╚███╔███╔╝
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝                               
*/

	//отрисовка уровня
	draw(levelNo)
	{
		//добавление  бонусов текущего уровня в массив
		this.currentLevelBonuses = [];
		for (var i = 0; i < this.bonuses.length; i++)
		{
			if (this.bonuses[i].existsOnLevels.includes(levelNo))
			{
				this.currentLevelBonuses.push(this.bonuses[i]);
			}
		}

		this.buttonSound.play();
		this.scoresSong.stop();
		if (this.gameSong != undefined)
		{
			this.gameSong.stop();
		}
		this.startGameSong();
		this.idleSound.stop();
		this.welcomePac.visible = false;
		clearInterval(this.idleAnimationInterval);
		this.welcomeText.visible = false;
		this.interactiveSprites = [];
		this.levelNumber = levelNo;
		this.currentLevel = JSON.parse(JSON.stringify(this.levels[this.levelNumber]));
		var level = this.currentLevel;

		this.blockHight = this.gameHight / level.length;
		this.blockWidth = this.gameWidth / level[0].length;

		level[-1] = [];
		level[level.length] = [];
		var sum;
		for (var i = 0; i < level.length; i++)
		{
			this.spriteArray[i] = [];
			for (var j = 0; j < level[0].length; j++)
			{
				var item = level[i][j];
				if (item == 1)
				{
					sum = 0;
					if (check(level,i-1,j)) sum = sum + this.bitMask[0][1];
					if (check(level,i+1,j)) sum = sum + this.bitMask[2][1];
					if (check(level,i,j-1)) sum = sum + this.bitMask[1][0];
					if (check(level,i,j+1)) sum = sum + this.bitMask[1][2];

					function check(level,x,y)
					{
						var item = level[x][y];
						var result = false;
						if ((item==1)||(item==undefined)||(item==4)||(item==5)||(item==-1)) result=true;	
						return result;
					}
					
					if (sum == 90)
					{
						var texture;
						if (!check(level, i - 1, j + 1)) texture = 18;
						if (!check(level, i - 1, j - 1)) texture = 10;
						if (!check(level, i + 1, j - 1)) texture = 72;
						if (!check(level, i + 1, j + 1)) texture = 80;
						
						var sprite = new PIXI.Sprite(this.wallTextures[texture]);	
					}
					else
					{
						var sprite = new PIXI.Sprite(this.wallTextures[sum]);	
					}

					sprite.x = j * this.blockWidth;
					sprite.y = i * this.blockHight;
					sprite.width = this.blockWidth;
					sprite.height = this.blockHight;
					sprite.alpha = 0;
					this.gameCanvas.stage.addChild(sprite);
				}
				else
				{
					if((item > 1))
					{
						if (item == 6)
						{
							var sprite = new PIXI.extras.AnimatedSprite(this.playerTextures);
							sprite = generateCharacter(i,j,sprite, this);
							this.interactiveSprites[6] = sprite;
						}
						else
						{
							if (item > 6)
							{
								if (this.enemyTextures[item]!=undefined)
								{
									var sprite = new PIXI.extras.AnimatedSprite([this.enemyTextures[item].sprites[0]]);
									sprite = generateCharacter(i,j,sprite, this);
									this.interactiveSprites[item] = sprite;
									sprite.enemyTextures = this.enemyTextures[item];
								}
							}
							else
							{
								var sprite = new PIXI.Sprite(this.otherTextures[item]);
								sprite.x = j * this.blockWidth;
								sprite.y = i * this.blockHight;
								this.gameCanvas.stage.addChild(sprite);		
							}
							
						}
						
						sprite.width = this.blockWidth;
						sprite.height = this.blockHight;
						sprite.alpha = 0;
						if ((item == 2) || (item == 3))
						{
							this.spriteArray[i][j] = sprite;	
						}	
					}
				}

				function generateCharacter(i,j,sprite,currThis)
				{
					sprite.pivot.x = currThis.blockWidth / 2;
					sprite.pivot.y = currThis.blockHight / 2;
					sprite.x = (j + 0.5) * currThis.blockWidth;
					sprite.y = (i + 0.5) * currThis.blockHight;
					sprite.originX = sprite.x;
					sprite.originY = sprite.y;
					sprite.animationSpeed = 0.5;
					return sprite;
				}
			}
		}

		for (var i = this.interactiveSprites.length-1; i>-1;i--)
		{
			var sprite = this.interactiveSprites[i];
			if (sprite != undefined)this.gameCanvas.stage.addChild(sprite);	
		}
		this.pauseBox.pauseBox = true;

		initObjects(this.pauseBox, 0.3, this);
		initObjects(this.pauseText, 0, this);
		initObjects(this.gameOverText, 0, this);
		initObjects(this.gameOverScore, 0, this);
		initObjects(this.scoresScreenText, 0, this);
		initObjects(this.readyScreenText, 1, this);

		function initObjects(obj, alpha, currThis)
		{
			currThis.gameCanvas.stage.addChild(obj);
			obj.alpha = alpha;
		}

		var boundAnimate = animate.bind(this);
		var repeats = 0;
		boundAnimate();

		function animate()
		{
			for (var i = 0; i < this.gameCanvas.stage.children.length; i++)
				{
					if((this.gameCanvas.stage.children[i].notDestroy == undefined)&&(this.gameCanvas.stage.children[i].pauseBox == undefined))this.gameCanvas.stage.children[i].alpha = repeats/10;
				}
			repeats++;
			if (repeats < 11)
			{
				setTimeout(boundAnimate, 10);
			}
		}
	}

/*
██████╗ ███████╗███████╗████████╗██████╗  ██████╗ ██╗   ██╗
██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝
██║  ██║█████╗  ███████╗   ██║   ██████╔╝██║   ██║ ╚████╔╝ 
██║  ██║██╔══╝  ╚════██║   ██║   ██╔══██╗██║   ██║  ╚██╔╝  
██████╔╝███████╗███████║   ██║   ██║  ██║╚██████╔╝   ██║   
╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   
*/	

	destroyLevel(toAnimate)
	{
		for (var i = 0; i < this.interactiveSprites.length; i++)
		{
			if(this.interactiveSprites[i] != undefined) clearInterval(this.interactiveSprites[i].animInterval);
		}

		var repeats = 10;
		var boundAnimate = animate.bind(this);
		var boundDestroy = destroy.bind(this);

		if (toAnimate == undefined) {boundAnimate(); }
			else  {boundDestroy()};

		function animate()
		{
			for (var i = 0; i < this.gameCanvas.stage.children.length; i++)
				{
					if(this.gameCanvas.stage.children[i].notDestroy == undefined)this.gameCanvas.stage.children[i].alpha = repeats / 10;
				}
			repeats --;
			if (repeats > 0)
			{
				setTimeout(boundAnimate, 10);
			}
			else
			{
				boundDestroy();
			}
		}
		
		function destroy()
		{
			var i = 0;
			while (this.gameCanvas.stage.children.length > i)
			{
				if (this.gameCanvas.stage.children[i].notDestroy == true)
				{
					i++;
				}
				else
				{
					this.gameCanvas.stage.children[i].destroy();
				}
			}
		}
	}

/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   
*/

	renderMovement(x, y, dx, dy ,direction, id, vulnerable, isDead)
	{
		var sprite = this.interactiveSprites[id];
		var level = this.currentLevel;
		var visibilityMarker = true;

		if (x + dx == -1) {dx = level[0].length - 1; visibilityMarker = false}
		else if (x + dx == level[0].length) {dx = -level[0].length + 1; visibilityMarker = false}

		if (y + dy == -1) {dy = level.length - 1; visibilityMarker = false}
		else if (y + dy == level.length) {dy = -level.length + 1; visibilityMarker = false}	
		
		sprite.visible = visibilityMarker;
		this.animateChar(x, y, dx * this.blockWidth, dy * this.blockHight, sprite);
		this.upateSpriteTexture(id, direction, vulnerable, isDead);
	}
/*
 ██████╗██╗  ██╗ █████╗ ██████╗     ████████╗███████╗██╗  ██╗   
██╔════╝██║  ██║██╔══██╗██╔══██╗    ╚══██╔══╝██╔════╝╚██╗██╔╝   
██║     ███████║███████║██████╔╝       ██║   █████╗   ╚███╔╝    
██║     ██╔══██║██╔══██║██╔══██╗       ██║   ██╔══╝   ██╔██╗    
╚██████╗██║  ██║██║  ██║██║  ██║       ██║   ███████╗██╔╝ ██╗██╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝
*/
	upateSpriteTexture(id, direction, vulnerable, isDead, delay)
	{
		var sprite = this.interactiveSprites[id];
		if (id == 6)
		{	
			this.playerStep.play();
			switch (direction)
			{
				case 0: sprite.rotation = Math.PI; break;
				case 1: sprite.rotation = -this.halfPI; break;
				case 2: sprite.rotation = 0; break;
				case 3: sprite.rotation = this.halfPI; break;
			}
		}
		else
		{
			if (delay != undefined)
			{
				if ((delay > 7) || (delay%2 == 1))
				{
					sprite.alpha = 0.5;	
				}
				else
				{
					sprite.alpha = 1;
				}
			}

			if (vulnerable > 0)
			{
				sprite.texture = sprite.enemyTextures.vulnerableSprites[0];
				if ((vulnerable < 10) && (vulnerable % 2 == 0))
				{
					sprite.texture = sprite.enemyTextures.vulnerableSprites[1];
				}
			}
			else
			{
				if (isDead)
				{
					sprite.alpha = 1;
					setSprite(sprite, sprite.enemyTextures.deadSprites, direction);
				}
				else
				{
					setSprite(sprite, sprite.enemyTextures.sprites, direction);
				}
			}	
		}	

		function setSprite(sprite, collection, direction)
		{
			switch (direction)
			{
				case 0: sprite.texture = collection[0]; break;
				case 1: sprite.texture = collection[1]; break;
				case 2: sprite.texture = collection[2]; break;
				case 3: sprite.texture = collection[3]; break;
			}
		}
	}

/*
██████╗ ███████╗███████╗████████╗    ███████╗██████╗ ██████╗ ██╗████████╗███████╗
██╔══██╗██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝
██║  ██║█████╗  ███████╗   ██║       ███████╗██████╔╝██████╔╝██║   ██║   █████╗  
██║  ██║██╔══╝  ╚════██║   ██║       ╚════██║██╔═══╝ ██╔══██╗██║   ██║   ██╔══╝  
██████╔╝███████╗███████║   ██║██╗    ███████║██║     ██║  ██║██║   ██║   ███████╗
╚═════╝ ╚══════╝╚══════╝   ╚═╝╚═╝    ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝
*/
	destroySprite(x,y)
	{
		if (this.currentLevel[x][y] == 2)
		{
			this.dotEaten.play();	
		}
		else
		{
			if (this.currentLevel[x][y] == 3)
			{
				this.ozvSound.play();
			}
		}
		
		this.spriteArray[x][y].destroy();	
	}

/*
 █████╗ ███╗   ██╗██╗███╗   ███╗    ██████╗██╗  ██╗ █████╗ ██████╗    
██╔══██╗████╗  ██║██║████╗ ████║   ██╔════╝██║  ██║██╔══██╗██╔══██╗   
███████║██╔██╗ ██║██║██╔████╔██║   ██║     ███████║███████║██████╔╝   
██╔══██║██║╚██╗██║██║██║╚██╔╝██║   ██║     ██╔══██║██╔══██║██╔══██╗   
██║  ██║██║ ╚████║██║██║ ╚═╝ ██║██╗╚██████╗██║  ██║██║  ██║██║  ██║██╗
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
*/

	animateChar(oldx,oldy,dx,dy,sprite)
	{
		var newx = oldx + dx;
		var newy = oldy + dy;

		var speedX = (newx - oldx)/6;
		var speedY = (newy - oldy)/6;
		
		sprite.repeats = 0;			
		animate();
		var animInterval = setInterval(animate,20);
		sprite.animInterval = animInterval;

		function animate()
		{	
			
			sprite.stop();
			if (sprite.repeats < 6)
			{
				sprite.x = sprite.x + speedX;
				sprite.y = sprite.y + speedY;
				sprite.play();
				sprite.repeats++;
			}
			else
			{
				clearInterval(animInterval);
			}
		}
	}

/*
██████╗        ███████╗██████╗ ██████╗ ██╗████████╗███████╗
██╔══██╗       ██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝
██████╔╝       ███████╗██████╔╝██████╔╝██║   ██║   █████╗  
██╔══██╗       ╚════██║██╔═══╝ ██╔══██╗██║   ██║   ██╔══╝  
██████╔╝██╗    ███████║██║     ██║  ██║██║   ██║   ███████╗
╚═════╝ ╚═╝    ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝
*/

	spawnBonusSprite(x,y,id)	
	{
		var bonus = this.currentLevelBonuses[id];
		bonus.sprite = new PIXI.Sprite(bonus.texture);
		bonus.sprite.x = x * this.blockWidth;
		bonus.sprite.y = y * this.blockHight;
		bonus.sprite.width = this.blockWidth;
		bonus.sprite.height = this.blockHight;
		this.gameCanvas.stage.addChildAt(bonus.sprite, 0);
	}

	removeBonusSprite(id, noSound)	
	{
		this.currentLevelBonuses[id].sprite.destroy();
		if (noSound == undefined) 
		{
			this.bonusSound.play();
		}
	}

/*
██████╗ ███████╗████████╗██╗   ██╗██████╗ ███╗   ██╗
██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║
██████╔╝█████╗     ██║   ██║   ██║██████╔╝██╔██╗ ██║
██╔══██╗██╔══╝     ██║   ██║   ██║██╔══██╗██║╚██╗██║
██║  ██║███████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║
╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
*/

	returnContainer()
	{
		return this.gameCanvas.view;
	}

/*
██████╗  █████╗ ██╗   ██╗███████╗███████╗
██╔══██╗██╔══██╗██║   ██║██╔════╝██╔════╝
██████╔╝███████║██║   ██║███████╗█████╗  
██╔═══╝ ██╔══██║██║   ██║╚════██║██╔══╝  
██║     ██║  ██║╚██████╔╝███████║███████╗
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
*/

	pause()
	{
		this.buttonSound.play();
		if (this.pauseBox.alpha == 0)
		{
			this.pauseBox.alpha = 0.3;
			this.pauseText.alpha = 1;
			this.gameSong.stop();
		}
		else
		{
			this.gameSong.resume();
			this.pauseBox.alpha = 0;
			this.pauseText.alpha = 0;
		}
	}
/*
██████╗ ██╗            ██████╗ ███████╗ █████╗ ████████╗██╗  ██╗
██╔══██╗██║            ██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║  ██║
██████╔╝██║            ██║  ██║█████╗  ███████║   ██║   ███████║
██╔═══╝ ██║            ██║  ██║██╔══╝  ██╔══██║   ██║   ██╔══██║
██║     ███████╗██╗    ██████╔╝███████╗██║  ██║   ██║   ██║  ██║
╚═╝     ╚══════╝╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
*/
	animatePlayerDeath()
	{
		this.gameSong.stop();
		var player = this.interactiveSprites[6];
		this.extraLives --;
		player.rotation = 0;
		player.textures = [this.playerDeathTextures[0]];
		var i = 0;
		var length = this.playerDeathTextures.length;
		var boundAnimate = animate.bind(this);
		setTimeout(boundAnimate,500);
		function animate()
		{
			if (i == 0)
			{
				if  (this.extraLives == -1)
				{
					this.gameOverSound.play();
				}	
				else
				{
					this.deathSound.play();
				}
			}
			if (i<length)	
			{
				player.textures = [this.playerDeathTextures[i]];
				i++;
				setTimeout(boundAnimate,80);
			}
			else
			{
				var event = new CustomEvent("Pacman: player death animation finished");
				document.dispatchEvent(event);
			}
		}
	}

/*
██████╗ ███████╗███████╗███████╗████████╗
██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝
██████╔╝█████╗  ███████╗█████╗     ██║   
██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║   
██║  ██║███████╗███████║███████╗   ██║   
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝  
*/

	resetAfterDeath()
	{
		for (var i = 0; i < this.interactiveSprites.length; i++)
		{
			var player = this.interactiveSprites[i];
			if (player!=undefined)
			{
				player.stop();
				if (i == 6) player.textures = this.playerTextures;
				player.x = player.originX;
				player.y = player.originY;
				player.alpha = 1;
			}
		}
		this.gameSong.play();
		var event = new CustomEvent("Pacman: resetting finished");
		document.dispatchEvent(event);
	}

/*
 ██████╗  █████╗ ███╗   ███╗███████╗     ██████╗ ██╗   ██╗███████╗██████╗ 
██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔═══██╗██║   ██║██╔════╝██╔══██╗
██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║██║   ██║█████╗  ██████╔╝
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝     ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝
*/

	gameOver(event)
	{
		this.animatePlayerDeath();
		this.gameSong.stop();
		var topPlayers = event.detail.topPlayers;
		var temp;
		this.scoresScreenText.alpha = 0;
		this.gameOverText.text = "Game Over\nTop scores:";
		this.gameOverText.alpha = 1;
		this.gameOverScore.text = "\n";
		for (var i = 0; i < topPlayers.length; i++)
		{
			temp = i+1;
			this.gameOverScore.text += temp+": "+topPlayers[i].name + " : " +topPlayers[i].score + "\n";
		}
		this.gameOverScore.alpha = 1;
		this.pauseBox.alpha = 0.3;	
		this.scoresSong.play();
	}

/*
██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  
██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  
╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗
 ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
*/

	startIdleAnimation()
	{
		this.playIdleSound();
		if (this.poly != undefined)
		{
			this.poly.destroy();
		}

		this.poly = new PIXI.Graphics();
		var counter = 50;
		var open = false;
		var polyLength = this.gameWidth/2+this.gameHight/8;
		this.idleAnimationInterval = setInterval(animateIdle.bind(this), 10);

		function animateIdle()
		{
			if (open)
			{
				counter = counter + 2;
				if (counter == 50) open = false;
			}
			else
			{
				counter = counter - 2;
				if (counter == 0) open = true;
			}	

			this.poly.destroy();
			this.poly = new PIXI.Graphics();
			this.poly.beginFill(0x000000);
			this.poly.notDestroy = true;
			this.poly.drawPolygon([this.gameWidth / 2, this.gameHight / 3 * 2, polyLength, this.gameHight / 3 * 2 + counter, polyLength, this.gameHight / 3 * 2 - counter]);
			this.gameCanvas.stage.addChild(this.poly);
		}
	}
/*
███████╗███╗   ██╗███████╗███╗   ███╗       ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝████╗  ██║██╔════╝████╗ ████║       ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
█████╗  ██╔██╗ ██║█████╗  ██╔████╔██║       ███████╗██║     ██║   ██║██████╔╝█████╗  
██╔══╝  ██║╚██╗██║██╔══╝  ██║╚██╔╝██║       ╚════██║██║     ██║   ██║██╔══██╗██╔══╝  
███████╗██║ ╚████║███████╗██║ ╚═╝ ██║██╗    ███████║╚██████╗╚██████╔╝██║  ██║███████╗
╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝    ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
*/
	displayScore(number,x,y, lives)
	{
		var score = new PIXI.Text(number,
			{
				"fontFamily" : 'Courier New', 
				"fontSize": this.blockHight/1, 
				"fill" : 0xFFD700, 
				"align" : 'left',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
				"strokeThickness": 2
			});
		score.x = x * this.blockWidth;
		score.y = y * this.blockHight;
		if (lives != undefined)
		{
			score.style.fill = 0xff6468;
			score.text = number + " UP";
			score.y -= this.blockHight;
		}
		this.gameCanvas.stage.addChild(score);
		this.scoreSpriteArray.push(score);
		setTimeout(this.removeScore.bind(this), 3000);
	}

	removeScore()
	{
		this.scoreSpriteArray[0].destroy();
		this.scoreSpriteArray.shift();
	}

/*
██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
*/	

	handleEnterName(event)
	{
		this.gameSong.stop();
		this.scoresScreenText.alpha = 1;
		this.scoresScreenText.text = "CONGRATULATIONS!\nYou reached the\nhigh scores!\nYour score: "+event.detail.score+"\nEnter your name";
		this.pauseBox.alpha = 0.5;
	}

	readyScreen()
	{
		this.pauseBox.alpha = 0.5;
		this.readyScreenText.alpha = 1;
		this.gameSong.speed = 1;
	}

	removeReadyScreen()
	{
		this.readyScreenText.alpha = 0;
		this.pauseBox.alpha = 0;	
	}

	idleHandler()
	{
		this.pauseBox.alpha = 0;
		this.destroyLevel();
		this.pauseText.alpha = 0;
		this.welcomeText.visible = true;
		this.welcomePac.visible = true;
		this.startIdleAnimation();
	}

	resetLives()
	{
		this.extraLives = this.startExtraLives;
	}

/*
██████╗ ██╗      █████╗ ██╗   ██╗    ███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ 
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝    ██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗
██████╔╝██║     ███████║ ╚████╔╝     ███████╗██║   ██║██║   ██║██╔██╗ ██║██║  ██║
██╔═══╝ ██║     ██╔══██║  ╚██╔╝      ╚════██║██║   ██║██║   ██║██║╚██╗██║██║  ██║
██║     ███████╗██║  ██║   ██║       ███████║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ 
*/

	playIdleSound()
	{
		this.idleSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/idle.wav"]);
		this.idleSound.play();	
	}

	startGameSong()
	{
		this.gameSong.play();
		this.gameSong.loop = true;	
	}

	startScoresSong()
	{
		this.scoresSong.play();
		this.scoresSong.loop = true;	
	}

	switchGameSongSpeed(distance)
	{
		if (distance < 6)
		{
			this.gameSong.speed = 1.6 - distance/10;
		}
		else
		{
			this.gameSong.speed = 1;
		}
	}

	playEatEnemy()
	{
		this.enemyEaten.play();
	}

	generateLoadedEvent()
	{
		this.playerStep = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/walk.wav"]);
		this.dotEaten = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/dotEaten.wav"]);
		this.enemyEaten = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/eatEnemy.wav"]);
		this.scoresSong = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/scores.wav"]);
		this.gameSong = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/gameSong.wav"]);
		this.buttonSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/button.wav"]);
		this.deathSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/death.wav"]);
		this.ozvSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/ozv.wav"]);
		this.gameOverSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/gameOver.wav"]);
		this.bonusSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/bonus.wav"]);
		var event = new CustomEvent("Pacman: loading finished");
		this.loadingText.visible = false;
		document.dispatchEvent(event);
	}
}