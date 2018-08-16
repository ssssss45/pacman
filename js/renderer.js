class pacmanRenderer
{
	constructor(params)
	{
		this.pathToSpriteSheet = params.pathToSpriteSheet; 
		this.spriteSheetWidth = params.spriteSheetWidth;
		this.spriteSheetHight = params.spriteSheetHight;
		this.spriteSheetWidthSprites = params.spriteSheetWidthSprites;
		this.spriteSheetHightSprites = params.spriteSheetHightSprites;
		
		this.spriteSheetBorderLeft = params.spriteSheetBorderLeft || 0;
		this.spriteSheetBorderTop = params.spriteSheetBorderTop || 0;

		this.spriteHight = (this.spriteSheetHight - this.spriteSheetBorderTop - params.spriteSheetBorderBottom)/this.spriteSheetHightSprites;
		this.spriteWidth = (this.spriteSheetWidth - this.spriteSheetBorderLeft - params.spriteSheetBorderRight)/this.spriteSheetWidthSprites;

		this.lifemax = params.lifeMax;
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
		this.firstDraw = true;

		this.boundUpdateScore = this.updateScore.bind(this);
		this.boundRenderMovement = this.renderMovement.bind(this)
		this.boundDestroyLevel = this.destroyLevel.bind(this);

		//счет
		this.scoreText=new PIXI.Text('Score:',
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
		this.scoreText.notDestroy = true;

		this.scoreNumberText=new PIXI.Text('0',
			{
				fontFamily : 'Courier New', 
				fontSize: Math.floor(this.gameWidth/15), 
				fill : 0xFFFFFF, 
				align : 'right',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
		this.scoreNumberText.x = this.gameWidth/2 + this.scoreText.width;
		this.scoreNumberText.y = Math.floor(this.gameHight+this.scoreContainerHight/3);
		this.scoreNumberText.notDestroy = true;

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
		this.lifeText.x = 10;
		this.lifeText.y = Math.floor(this.gameHight+this.scoreContainerHight/3);
		this.lifeDisplay = [];
		this.lifeText.notDestroy = true;

		this.createWallSheet();
		this.loadSpriteSheet();
		this.levels=params.levels;
		this.boundDraw= this.draw.bind(this);
		//setTimeout(boundDraw,200);

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
		//this.container.appendChild(this.spriteCanvas.view);

		for (var i=0; i<this.playerSpritesLocations.length; i++)
		{
			var playerTexture =
		   		new PIXI.Texture(
          		texture,
          		new PIXI.Rectangle(this.spriteWidth * this.playerSpritesLocations[i].y + this.spriteSheetBorderLeft, this.spriteHight * this.playerSpritesLocations[i].x + this.spriteSheetBorderTop, this.spriteWidth, this.spriteHight)
        		);
        	this.playerTextures.push(playerTexture);
		}
		//добавление спрайтов для отображения жизней
		for (var i=0; i<this.lifemax; i++)
		{
			var life = new PIXI.Sprite(this.playerTextures[0]);
			life.x = this.lifeText.width+(i*life.width);
			life.y = this.lifeText.y+life.height/2;
			life.notDestroy = true;
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

		fillCells(this.wallTextures, cells, this.wallTexture);

		//бонусы, озверин и стены призраков
        this.otherTextures = [];
        cells = ['2,10,2','3,9,2','4,9,1','5,9,0']
		fillCells(this.otherTextures, cells, this.wallTexture);

		//функии заполнения массива текстур
        function fillCells(array, cells, texture)
		{
			for (var i=0; i<cells.length; i++)
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
		this.levelNumber = levelNo;
		this.currentLevel = JSON.parse(JSON.stringify(this.levels[this.levelNumber]));
		var level = this.currentLevel;

		this.blockHight = this.gameHight/level.length;
		this.blockWidth = this.gameWidth/level[0].length;

		level[-1]=[];
		level[level.length]=[];
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
					sprite.alpha = 0;
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
						sprite.alpha = 0;
						this.gameCanvas.stage.addChild(sprite);
						if ((level[i][j]==2)||(level[i][j]==3))
							{
								this.spriteArray[i][j] = sprite;	
							}	
					}

					if(level[i][j]==6)
					{
						this.playerSprite = new PIXI.extras.AnimatedSprite(this.playerTextures);
						this.playerSprite.x = (j+0.5)*this.blockWidth;
						this.playerSprite.y = (i+0.5)*this.blockHight;
						this.playerSprite.width = this.blockWidth;
						this.playerSprite.height = this.blockHight;
						this.playerSprite.pivot.x = this.blockWidth / 2;
						this.playerSprite.pivot.y = this.blockHight / 2;
						this.playerSprite.alpha = 0;
						this.spriteArray[i][j] = this.playerSprite;
					}
				}
			}
		}

		function addToSum(dx,dy,sum,mask)
		{
			return sum = sum + mask[dx][dy];
		}

		this.gameCanvas.stage.addChild(this.lifeText);
		this.gameCanvas.stage.addChild(this.scoreText);
		this.gameCanvas.stage.addChild(this.scoreNumberText);
		for (var i=0; i<this.lifemax; i++)
			{
				this.gameCanvas.stage.addChild(this.lifeDisplay[i]);
			}


		this.gameCanvas.stage.addChild(this.playerSprite);

		var boundAnimate = animate.bind(this);
		var repeats = 0;
		boundAnimate();

		function animate()
		{
			for (var i = 0; i < this.gameCanvas.stage.children.length; i++)
				{
					if(this.gameCanvas.stage.children[i].notDestroy == undefined)this.gameCanvas.stage.children[i].alpha = repeats/10;
				}
			repeats++;
			if (repeats < 11)
			{
				setTimeout(boundAnimate, 10);
			}
		}
	}

	destroyLevel()
	{
		var repeats = 10;
		var boundAnimate = animate.bind(this);
		var boundDestroy = destroy.bind(this);

		boundAnimate();

		function animate()
		{
			for (var i = 0; i < this.gameCanvas.stage.children.length; i++)
				{
					if(this.gameCanvas.stage.children[i].notDestroy == undefined)this.gameCanvas.stage.children[i].alpha = repeats/10;
				}
			repeats--;
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
			while (this.gameCanvas.stage.children.length>i)
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
	renderMovement(x,y,dx,dy,direction)
	{
		var sprite = this.spriteArray[y][x];
		var level = this.currentLevel;
		var visibilityMarker = true;

		if (x + dx == -1) {dx = level[0].length - 1; visibilityMarker = false}
		else if (x + dx == level[0].length) {dx = -level[0].length + 1; visibilityMarker = false}

		if (y + dy == -1) {dy = level.length - 1; visibilityMarker = false}
		else if (y + dy == level.length) {dy = -level.length + 1; visibilityMarker = false}	
		
		sprite.visible = visibilityMarker;
		this.animateChar(x, y, dx * this.blockWidth, dy * this.blockHight, sprite);
		this.spriteArray[y+dy][x+dx] = this.spriteArray[y][x];
		this.spriteArray[y][x] = undefined;

		switch (direction)
		{
			case 0: sprite.rotation = 3.14; break;
			case 1: sprite.rotation = -1.57; break;
			case 2: sprite.rotation = 0; break;
			case 3: sprite.rotation = 1.57; break;
		}

		if (sprite == this.playerSprite)
		{
			this.currentPlayerSprite++;
			if (this.currentPlayerSprite == this.playerTextures.length) this.currentPlayerSprite = 0;
			sprite.setTexture(this.playerTextures[this.currentPlayerSprite] );
		}
	}

	//уничтожение спрайта (при "съедении")
	destroySprite(x,y)
	{
		this.spriteArray[x][y].destroy();	
	}

	animateChar(oldx,oldy,dx,dy,sprite)
	{
		var newx = oldx + dx;
		var newy = oldy + dy;

		//if (newx == -1) newx = level.length;
		var speedX = (newx - oldx)/6;
		var speedY = (newy - oldy)/6;

		
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

	stop()
	{

	}
/*
██╗     ██╗██╗   ██╗███████╗███████╗
██║     ██║██║   ██║██╔════╝██╔════╝
██║     ██║██║   ██║█████╗  ███████╗
██║     ██║╚██╗ ██╔╝██╔══╝  ╚════██║
███████╗██║ ╚████╔╝ ███████╗███████║
╚══════╝╚═╝  ╚═══╝  ╚══════╝╚══════╝
*/
	//обновление количества жизней
	setLives(lives)
	{
		for(var i = 0; i < this.lifeDisplay.length; i++)
		{
			if (i < lives)
			{
				this.lifeDisplay[i].visible = true;
			}
			else
			{
				this.lifeDisplay[i].visible = false;
			}
		}
	}

/*
███████╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
███████╗██║     ██║   ██║██████╔╝█████╗  
╚════██║██║     ██║   ██║██╔══██╗██╔══╝  
███████║╚██████╗╚██████╔╝██║  ██║███████╗
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝                                      
*/

	//обновление количества очков
	updateScore(score)
	{
		this.scoreNumberText.text=score;
		var repeats = -5;
		var boundAnimate = animate.bind(this);
		setTimeout(boundAnimate,20);
		function animate()
		{
			var delta = 1+((25-repeats*repeats)/200);
			this.scoreNumberText.scale.x = delta;
			this.scoreNumberText.scale.y = delta;
			repeats++;
			if (repeats!=6)
			{
				setTimeout(boundAnimate,20);
			}
		}
	}

	//возвращение канваса игры
	returnContainer()
	{
		return this.gameCanvas.view;
	}

}