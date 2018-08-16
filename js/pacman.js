class pacman
{
	constructor(params)
	{
		//уровни
		this.levels = params.levels;
		//DOM контейнер для генерации игры
		this.container = document.getElementById(params.container);

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

		this.extraLives = params.startExtraLives || 2;

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
		setTimeout(this.gameStart.bind(this),100);
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
		this.renderer.setLives(this.extraLives);
		document.addEventListener("Pacman: level clear", this.nextLevel.bind(this));
		this.nextLevel();
	}

	nextLevel()
	{
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
		this.currentGameInterval = setInterval(this.gameStep.bind(this),40);

		this.stateMachine.setPlaying();
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
		if(this.stateMachine.getstate() == 2)
		{
			var oldscore = this.player.score;

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
					this.player.move(this.newdx,this.newdy,this.newDirection, this.currentLevel);
					this.moveTimer = -40;
				}

			this.moveTimer = this.moveTimer + 40;
			if (oldscore != this.player.score)
			{
				this.score = this.player.score;
				this.currentLevelFood--;
				if (this.currentLevelFood == 0)
					{
						clearInterval(this.currentGameInterval);
						setTimeout(this.renderer.boundDestroyLevel,120);
						setTimeout(this.stateMachine.setLevelClearScreen,320);
					}
			}
		}
	}

	generateEnemy()
	{

	}
}

/*
 ██████╗██╗  ██╗ █████╗ ██████╗         ██████╗██╗      █████╗ ███████╗███████╗
██╔════╝██║  ██║██╔══██╗██╔══██╗       ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝
██║     ███████║███████║██████╔╝       ██║     ██║     ███████║███████╗███████╗
██║     ██╔══██║██╔══██║██╔══██╗       ██║     ██║     ██╔══██║╚════██║╚════██║
╚██████╗██║  ██║██║  ██║██║  ██║██╗    ╚██████╗███████╗██║  ██║███████║███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
*/

class character
{
	constructor(params)
	{
		this.isPlayer = params.isPlayer;
		this.x = params.x;
		this.y = params.y;
		this.renderer = params.renderer;
		this.eatsDots = params.eatsDots;
		this.direction = -1;
		this.dx = 0;
		this.dy = 0;
		this.score = params.score;
	}

	move (dx,dy,direction,level)
	{	
		function check(dx,dy,level)
		{
			if (level[dx]==undefined) return true;
			return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));
		}

		function checkFood(dx,dy,level,renderer,score,isPlayer)
		{
			if (level[dx]==undefined) return 0;
			if (level[dx][dy]==2) 
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				if (isPlayer)
				{
					score++;
					renderer.boundUpdateScore(score);
				}
				return 1;
			}
			else return 0;
		}

		if (check(this.y+dy,this.x+dx,level)) 
		{
			this.dx = dx;
			this.dy = dy;
			this.direction = direction
		}

		if((check(this.y+this.dy,this.x+this.dx,level))&&(this.direction!=-1))
		{
			if (this.eatsDots) this.score = this.score + checkFood(this.y + this.dy ,this.x + this.dx,level,this.renderer,this.score,this.isPlayer);
			this.renderer.boundRenderMovement(this.x,this.y,this.dx,this.dy,this.direction);
			this.x = this.x + this.dx;
			this.y = this.y + this.dy;
			if(this.x < 0){this.x = level[0].length - 1}
			else
			if(this.x > level[0].length-1){this.x = 0}

			if(this.y < 0){this.y = level.length-1}	
			else
			if(this.y > level.length -1){this.y = 0}			
		}
		else
		{
			this.renderer.stop();
		}	
	}
}

/*
███████╗███╗   ██╗        ██████╗██╗      █████╗ ███████╗███████╗
██╔════╝████╗  ██║       ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝
█████╗  ██╔██╗ ██║       ██║     ██║     ███████║███████╗███████╗
██╔══╝  ██║╚██╗██║       ██║     ██║     ██╔══██║╚════██║╚════██║
███████╗██║ ╚████║██╗    ╚██████╗███████╗██║  ██║███████║███████║
╚══════╝╚═╝  ╚═══╝╚═╝     ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
*/

class enemy
{
	constructor(params)
	{
		this.character = new character ({
							"isPlayer" : false,
							"x" : params.x,
							"y" : params.y,
							"renderer" : params.renderer,
							"eatsDots" : params.eatsDots
						});
		this.speed = params.speed;
		this.killsPlayer = params.killsPlayer;
		this.move = this.character.move;
	}
}