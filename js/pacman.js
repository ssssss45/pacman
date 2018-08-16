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

		this.extraLives = params.extraLives || 2;

		//стейт машина
		this.stateMachine = new pacmanStateMachine();

		//контроллер
		this.keycon = new keyboardController();
		this.keycon.attach(this.canvas);
		addKeyToController("left",[37],this.keycon);
		addKeyToController("right",[39],this.keycon);
		addKeyToController("up",[38],this.keycon);
		addKeyToController("down",[40],this.keycon);
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

		this.gameStart();
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
	this.currentLevelFood = 0;
	this.currentLevel = JSON.parse(JSON.stringify(this.levels[0]));
		for (var i=0; i<this.currentLevel.length;i++)
		{
			for (var j=0; j<this.currentLevel[0].length;j++)
			{
				if (this.currentLevel[i][j] == 6)
				{
					this.player = new character (true, j, i);
					this.currentPlayerX = j; 
					this.currentPlayerY = i;
				}
				if (this.currentLevel[i][j] == 2)
				{
					this.currentLevelFood++; 
				}
			}
		}
		setInterval(this.gameStep.bind(this),40);
		this.renderer.setLives(this.extraLives);

		this.direction = -1;
		this.newDirection = -1;
		this.dx = 0;
		this.dy = 0;
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
				move(this.newdx,this.newdy,this.newDirection,this);
				this.moveTimer = -40;
			}

		this.moveTimer = this.moveTimer + 40;
					

		function move (dx,dy,direction,curthis)
		{	
			if (check(curthis.currentPlayerY+dy,curthis.currentPlayerX+dx,curthis.currentLevel)) {
				curthis.dx = dx;
				curthis.dy = dy;
				curthis.direction = direction
			}
			if(check(curthis.currentPlayerY+curthis.dy,curthis.currentPlayerX+curthis.dx,curthis.currentLevel))
			{
				curthis.score = curthis.score + checkFood(curthis.currentPlayerY + curthis.dy ,curthis.currentPlayerX + curthis.dx,curthis.currentLevel,curthis.renderer);
				curthis.currentPlayerX = curthis.currentPlayerX + curthis.dx;
				curthis.currentPlayerY = curthis.currentPlayerY + curthis.dy;
				if(curthis.currentPlayerX < 0){curthis.currentPlayerX = curthis.currentLevel[0].length - 1}
				else
				if(curthis.currentPlayerX > curthis.currentLevel[0].length-1){curthis.currentPlayerX = 0}

				if(curthis.currentPlayerY < 0){curthis.currentPlayerY = curthis.currentLevel.length-1}	
				else
				if(curthis.currentPlayerY > curthis.currentLevel.length){curthis.currentPlayerY = 0}	

				curthis.renderer.renderMovement(curthis.currentPlayerX,curthis.currentPlayerY,direction);
			}
			else
			{
				curthis.renderer.stop();
			}	
		}

		if (oldscore!=this.score)
		{
			this.currentLevelFood--;
			this.renderer.updateScore(this.score);
			if (this.currentLevelFood==0)this.generateLevelClearEvent();
		}

		function check(dx,dy,level)
		{
			return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));
		}

		function checkFood(dx,dy,level,renderer)
		{
			if (level[dx][dy]==2) 
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				return 1;
			}
			else return 0;
		}	
	}

	generateLevelClearEvent()
	{
		var event = new CustomEvent("Pacman level clear");
		document.dispatchEvent(event);	
	}

	generateGameOverEvent()
	{
		var event = new CustomEvent("Pacman game over");
		document.dispatchEvent(event);	
	}

	generateGamePauseEvent()
	{
		var event = new CustomEvent("Pacman game pause");
		document.dispatchEvent(event);	
	}

	generateGameStartEvent()
	{
		var event = new CustomEvent("Pacman game start");
		document.dispatchEvent(event);	
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
	}

	move (dx,dy,direction,level)
	{	
		function check(dx,dy,level)
		{
			return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));
		}

		function checkFood(dx,dy,level,renderer)
		{
			if (level[dx][dy]==2) 
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				return 1;
			}
			else return 0;
		}

		if (check(this.y+dy,this.x+dx,level)) {
			this.dx = dx;
			this.dy = dy;
			this.direction = direction
		}
		if(check(this.y+this.dy,this.x+this.dx,level))
		{
			this.score = this.score + checkFood(this.y + this.dy ,this.x + this.dx,level,this.renderer);
			this.x = this.x + this.dx;
			this.y = this.y + this.dy;
			if(this.x < 0){this.x = level[0].length - 1}
			else
			if(this.x > level[0].length-1){this.x = 0}

			if(this.y < 0){this.y = level.length-1}	
			else
			if(this.y > level.length){this.y = 0}	

			this.renderer.renderMovement(this.x,this.y,direction);
			return true;
		}
		else
		{
			return false;
		}	
	}
}

class enemy
{
	constructor(params)
	{
		this.character = new character(false, params.x, params.y);
		this.eatsDots = params.eatsDots;
		this.speed = params.speed;
		this.killsPlayer = params.killsPlayer;
	}
}