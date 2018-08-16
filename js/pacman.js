class pacman
{
	constructor(params)
	{
		this.testCanvas=[[0,0,0],[0,0,0],[0,0,0]];
		//-1 - филлер (считается как стена при отрисовке, но не отрисовывается, 0 - пустота, 1 - стена, 2 - бонус, 3 - озверин, 4 - горизонтальные ворота призраков, 5 - вертикальные ворота, 6 - игрок, 10,7,8,9 - монстры
		this.levels=[
			[
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
				[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
				[1,3,1,0,0,1,2,1,0,0,0,1,2,1,1,2,1,0,0,0,1,2,1,0,0,1,3,1],
				[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
				[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
				[1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
				[1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
				[1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
				[1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
				[-1,-1,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,-1,-1],
				[0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
				[0,0,0,0,0,1,2,1,1,0,0,1,1,4,4,1,1,0,0,1,1,2,1,0,0,0,0,0],
				[1,1,1,1,1,1,2,1,1,0,0,1,0,0,0,0,1,0,0,1,1,2,1,1,1,1,1,1],
				[0,0,0,0,0,0,2,0,0,0,0,1,7,8,9,10,1,0,0,0,0,2,0,0,0,0,0,0],
				[1,1,1,1,1,1,2,1,1,0,0,1,0,0,0,0,1,0,0,1,1,2,1,1,1,1,1,1],
				[0,0,0,0,0,1,2,1,1,0,0,1,1,1,1,1,1,0,0,1,1,2,1,0,0,0,0,0],
				[0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
				[-1,-1,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,-1,-1],
				[1,1,1,1,1,1,2,0,0,0,1,1,1,1,1,1,1,1,0,0,0,2,1,1,1,1,1,1],
				[1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
				[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
				[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
				[1,3,2,2,1,1,2,2,2,2,2,2,2,6,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
				[1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
				[1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
				[1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
				[1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
				[1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
				[1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
			]
			/*[
			[1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,6,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,1,1,0,1],
			[1,0,0,0,0,0,0,0,0,1,1,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1]]*/
		]

		this.container = document.getElementById("pacman-container");

		this.renderer= new pacmanRenderer({
			"pathToSpriteSheet" : 'resources/Pac-Man__Sprite_Sheet.png',
			"spriteSheetWidth" : 227,
			"spriteSheetHight" : 160,
			"spriteSheetWidthSprites" : 14,
			"spriteSheetHightSprites" : 10,
			"spriteSheetBorderLeft" : 2,
			"spriteSheetBorderTop" : 0,
			"lifeMax" : 5,
			"width" : 400,
			"hight" : 400,
			"scoreContainerHight" : 50,
			"levels":this.levels,
			"playerSpritesLocations" : [{x:0,y:0},{x:0,y:1},{x:0,y:2}],
			"playerDeathSpritesLocations" : [{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:0,y:5},{x:0,y:6},{x:0,y:7},{x:0,y:8},{x:0,y:9},{x:0,y:10},{x:0,y:11},{x:0,y:12},{x:0,y:13}],
			"container" : "pacman-container",
			"playerSpeed" : 3 //ticks per move
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
					this.currentPlayerX = j; 
					this.currentPlayerY = i;
				}
				if (this.currentLevel[i][j] == 2)
				{
					this.currentLevelFood++; 
				}
			}
		}
		setInterval(this.gameStep.bind(this),120);
		this.renderer.setLives(this.extraLives);
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
			move(-1,0,0,this);
		}
		else
		if (this.rightActive)
		{
			move(1,0,2,this);
		}
		
		if (this.upActive)
		{
			move(0,-1,1,this);
		}
		else
		if (this.downActive)
		{
			move(0,1,3,this);
		}

		function move (dx,dy, direction,curthis)
		{	
			if(check(curthis.currentPlayerY+dy,curthis.currentPlayerX+dx,curthis.currentLevel))
			{
				curthis.score = curthis.score + checkFood(curthis.currentPlayerY + dy ,curthis.currentPlayerX + dx,curthis.currentLevel,curthis.renderer);
				curthis.currentPlayerX = curthis.currentPlayerX + dx;
				curthis.currentPlayerY = curthis.currentPlayerY + dy;
				if(curthis.currentPlayerX < 0){curthis.currentPlayerX = curthis.currentLevel[0].length - 1}
				else
				if(curthis.currentPlayerX > curthis.currentLevel[0].length-1){curthis.currentPlayerX = 0}
				else
				if(curthis.currentPlayerY < 0){curthis.currentPlayerY = curthis.currentLevel.length-1}	
				else
				if(curthis.currentPlayerY > curthis.currentLevel.length){curthis.currentPlayerY = 0}	

				curthis.renderer.renderMovement(curthis.currentPlayerX,curthis.currentPlayerY,direction);
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

class enemy
{
	constructor(params)
	{
		this.ressurects = params.ressurects;
	}
}