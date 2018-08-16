class pacmanRenderer
{
	constructor(params)
	{
		this.pathToSpriteSheet = params.pathToSpriteSheet; 
		this.spriteSheetWidth = params.spriteSheetWidth;
		this.spriteSheetHight = params.spriteSheetHight;
		this.spriteSheetWidthSprites = params.spriteSheetWidthSprites;
		this.spriteSheetHightSprites = params.spriteSheetHightSprites;
		this.spriteHight = Math.round(this.spriteSheetHight/this.spriteSheetHightSprites);
		this.spriteWidth = Math.round(this.spriteSheetWidth/this.spriteSheetWidthSprites);
		this.gameWidth = params.width;
		this.gameHight = params.hight;
		this.playerSpritesLocations = params.playerSpritesLocations;

		this.scoreContainerHight = params.scoreContainerHight;
		this.container = document.getElementById(params.container);

		this.bitMask=[[1,2,4],[8,0,16],[32,64,128]];
		this.gameCanvas = new PIXI.Application({width: this.gameWidth, height: this.gameHight+this.scoreContainerHight});
		this.container.appendChild(this.gameCanvas.view);

		this.playerTextures=[];
		this.currentPlayerSprite = 0;

		//счет
		this.scoreText=new PIXI.Text('Score: 0',
			{
				fontFamily : 'Courier New', 
				fontSize: Math.floor(this.gameWidth/15), 
				fill : 0xFFFFFF, 
				align : 'right',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
		this.scoreText.x=this.gameWidth/2;
		this.scoreText.y=Math.floor(this.gameHight+this.scoreContainerHight/3);

		//жизни
		this.lifeText=new PIXI.Text('Lives:',
			{
				fontFamily : 'Courier New', 
				fontSize: Math.floor(this.gameWidth/15), 
				fill : 0xFFFFFF, 
				align : 'right',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
		this.lifeText.x=10;
		this.lifeText.y=Math.floor(this.gameHight+this.scoreContainerHight/3);
		this.lifeDisplay = [];

		this.createWallSheet();
		this.loadSpriteSheet();
		this.levels=params.levels;
		var boundDraw= this.draw.bind(this);
		setTimeout(boundDraw,200);

		this.spriteArray = [];
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
		this.spriteCanvas.stage.addChild(spriteSheet);
	//	this.container.appendChild(this.spriteCanvas.view);

		for (var i=0; i<this.playerSpritesLocations.length; i++)
		{
			var playerTexture =
		   		new PIXI.Texture(
          		texture,
          		new PIXI.Rectangle(this.spriteWidth*this.playerSpritesLocations[i].y, this.spriteHight*this.playerSpritesLocations[i].x, this.spriteWidth, this.spriteHight)
        		);
        	this.playerTextures.push(playerTexture);
		}

		for (var i=0; i<3; i++)
		{
			var life = new PIXI.Sprite(this.playerTextures[0]);
			life.x = 500;
			life.y = 500;
			this.lifeDisplay.push(life);
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
		//this.wallsheetDiv.appendChild(this.wallSheet.view);

		//отрисовка канваса стен
		let roundBox = new PIXI.Graphics();
		roundBox.lineStyle(2, 0x99CCFF, 1);
		roundBox.drawRoundedRect(10, 10, 70, 70, 7)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(2, 0x99CCFF, 1);
		roundBox.drawRoundedRect(16, 16, 58, 58, 7)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(112, 16, 32, 64, 15)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(176, 16, 64, 32, 15)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(176, 74, 64, 6, 4)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(32*8+11, 16, 6, 64, 4)
		this.wallSheet.stage.addChild(roundBox);

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
		//this.wallSheet.view.style.visibility = "Hidden";

		//сетка. сменить на true для отрисовки сетки
		if (false)
		{
			for (var i=0; i < 11; i++)
			{
				var line = new PIXI.Graphics();
				line.lineStyle(1, 0xFFFFFF, 1);
				line.moveTo(i*32,0);
				line.lineTo(i*32,96);
				this.wallSheet.stage.addChild(line);
			}
			for (var i=0; i < 3; i++)
			{
				var line = new PIXI.Graphics();
				line.lineStyle(1, 0xFFFFFF, 1);
				line.moveTo(0,i*32);
				line.lineTo(352,i*32);
				this.wallSheet.stage.addChild(line);
			}
		}
/*
████████╗███████╗██╗  ██╗████████╗██╗   ██╗██████╗ ███████╗███████╗
╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔════╝
   ██║   █████╗   ╚███╔╝    ██║   ██║   ██║██████╔╝█████╗  ███████╗
   ██║   ██╔══╝   ██╔██╗    ██║   ██║   ██║██╔══██╗██╔══╝  ╚════██║
   ██║   ███████╗██╔╝ ██╗   ██║   ╚██████╔╝██║  ██║███████╗███████║
   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
*/

		this.wallTextures=[];
		this.wallTexture = PIXI.Texture.fromCanvas(this.wallSheet.view, PIXI.SCALE_MODES.LINEAR);
		var cells = ['2,8,2','64,8,0','8,7,2','16,5,2','66,0,1','74,0,1','82,0,1','24,1,0','26,1,0','88,1,0','80,0,0','72,2,0','18,0,2','10,2,2']

		fillCells(cells,this);

		function fillCells(cells,currThis)
		{
			for (var i=0; i<cells.length; i++)
			{
				var current = cells[i].split(',');
				addCell(Number(current[0]),Number(current[1]),Number(current[2]),currThis);
			}
		}

		function addCell(cell, x, y,currThis)
		{
			currThis.wallTextures[cell] = 
		   			new PIXI.Texture(
          			currThis.wallTexture,
          			new PIXI.Rectangle(32*x, 32*y, 32, 32)
        			);
		}

		//бонусы, озверин и стены призраков
        this.otherTextures = [];
        this.otherTextures[2] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*10, 32*2, 32, 32)
        			);
        this.otherTextures[3] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*9, 32*2, 32, 32)
        			);
        this.otherTextures[4] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*9, 32*1, 32, 32)
        			);
        this.otherTextures[5] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*9, 32*0, 32, 32)
        			);
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
	draw()
	{
		var levelNumber=0;
		var level = this.levels[levelNumber];

		this.blockHight = Math.round(this.gameHight/level.length);
		this.blockWidth = Math.round(this.gameWidth/level[0].length);

		level[-1]=[];
		level[level.length]=[];
		for (var i=0; i<this.gameCanvas.stage.children.length;i++)
		{
			this.gameCanvas.stage.children[i].destroy();
		}
		var sum;
		for (var i=0; i<level.length;i++)
		{
			this.spriteArray[i]=[];
			for (var j=0; j<level[0].length;j++)
			{
				if (level[i][j]==1)
				{
					sum=0;
					if (check(level,i-1,j)) sum=sum+this.bitMask[0][1];
					if (check(level,i+1,j)) sum=sum+this.bitMask[2][1];
					if (check(level,i,j-1)) sum=sum+this.bitMask[1][0];
					if (check(level,i,j+1)) sum=sum+this.bitMask[1][2];

					function check(level,x,y)
					{
						var result = false;
						if ((level[x][y]==1)||(level[x][y]==undefined)||(level[x][y]==4)||(level[x][y]==5)||(level[x][y]==-1)) result=true;	
						return result;
					}
					
					if (sum==90)
					{
						var texture;
						if (!check(level,i-1,j+1)) texture=18;
						if (!check(level,i-1,j-1)) texture=10;
						if (!check(level,i+1,j-1)) texture=72;
						if (!check(level,i+1,j+1)) texture=80;
						
						var sprite = new PIXI.Sprite(this.wallTextures[texture]);	
					}
					else
					{
						var sprite = new PIXI.Sprite(this.wallTextures[sum]);	
					}

					sprite.x = j*this.blockWidth;
					sprite.y = i*this.blockHight;
					sprite.width = this.blockWidth;
					sprite.height = this.blockHight;
					this.gameCanvas.stage.addChild(sprite);
				}
				else
				{

					if((level[i][j]>1)&&(level[i][j]<6))
					{
						var sprite = new PIXI.Sprite(this.otherTextures[level[i][j]]);
						sprite.x = j*this.blockWidth;
						sprite.y = i*this.blockHight;
						sprite.width = this.blockWidth;
						sprite.height = this.blockHight;
						this.gameCanvas.stage.addChild(sprite);
						if ((level[i][j]==2)||(level[i][j]==3))
							{
								this.spriteArray[i][j] = sprite;	
							}	
					}

					if(level[i][j]==6)
					{
						this.playerSprite = new PIXI.Sprite(this.playerTextures[0]);
						this.playerSprite.x = (j+0.5)*this.blockWidth;
						this.playerSprite.y = (i+0.5)*this.blockHight;
						this.playerSprite.width = this.blockWidth;
						this.playerSprite.height = this.blockHight;
						this.playerSprite.pivot.x = this.blockWidth / 2;
						this.playerSprite.pivot.y = this.blockHight / 2;
						this.playerLastX = this.playerSprite.x;
						this.playerLastY = this.playerSprite.y;
						//this.gameCanvas.stage.addChild(this.playerSprite);

						console.log(this.playerSprite);
					}
				}
			}
		}

		function addToSum(dx,dy,sum,mask)
		{
			return sum = sum + mask[dx][dy];
		}

		for (var i=0; i<3; i++)
		{
			this.gameCanvas.stage.addChild(this.lifeDisplay[i]);
		}
		this.gameCanvas.stage.addChild(this.lifeText);
		this.gameCanvas.stage.addChild(this.scoreText);
		this.gameCanvas.stage.addChild(this.playerSprite);
	}

	renderMovement(x,y,direction)
	{
		if(((this.playerSprite.x-0.5)!=this.playerLastX)||((this.playerSprite.y-0.5)!=this.playerLastY))
		{
			this.animatePlayer(this.playerLastX, this.playerLastY, (x + 0.5) * this.
				blockWidth, (y + 0.5) * this.blockHight, this.playerSprite);
			this.playerLastX = (x + 0.5) * this.blockWidth;
			this.playerLastY = (y + 0.5) * this.blockHight;
			if(this.spriteArray[y][x]!=undefined)
			{
				this.spriteArray[y][x].destroy();	
			}
		}

		switch (direction)
		{
			case 0: this.playerSprite.rotation = 3.14; break;
			case 1: this.playerSprite.rotation = -1.57; break;
			case 2: this.playerSprite.rotation = 0; break;
			case 3: this.playerSprite.rotation = 1.57; break;
		}

		this.currentPlayerSprite++;
		if (this.currentPlayerSprite==this.playerTextures.length) this.currentPlayerSprite = 0;
		this.playerSprite.setTexture(this.playerTextures[this.currentPlayerSprite] );
	}

	animatePlayer(oldx,oldy,newx,newy,sprite)
	{
		var speedX = (newx-oldx)/6;
		var speedY = (newy-oldy)/6;

		var repeats=0;			
		animate();
		function animate()
		{	
			sprite.x = sprite.x + speedX;
			sprite.y = sprite.y + speedY;
			if (repeats!=5)
			{
				repeats++;
				setTimeout(animate,20);
			}
		}
	}

	updateScore(score)
	{
		this.scoreText.text="Score: "+score;
		var repeats = -5;
		var boundAnimate = animate.bind(this);
		setTimeout(boundAnimate,20);
		function animate()
		{
			var delta = 1+((25-repeats*repeats)/2000);
			this.scoreText.scale.x = delta;
			this.scoreText.scale.y = delta;
			repeats++;
			if (repeats!=6)
			{
				setTimeout(boundAnimate,20);
			}
		}
	}

	returnContainer()
	{
		return this.gameCanvas.view;
	}

}