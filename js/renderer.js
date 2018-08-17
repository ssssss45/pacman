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
		this.container = document.getElementById(params.container);

		this.bitMask=[[1,2,4],[8,0,16],[32,64,128]];
		this.gameCanvas = new PIXI.Application({width: this.gameWidth, height: this.gameHight});
		this.gameCanvas.view.setAttribute("style","position:absolute; top:30px");
		this.container.appendChild(this.gameCanvas.view);

		this.playerTextures=[];
		this.currentPlayerSprite = 0;

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
		this.pauseText = textGen("GAME PAUSED", this.gameWidth/10,this.gameWidth/10,this.gameHight/2-this.gameWidth/10,true);
		this.pauseText.pauseBox = true;

		//функция генерации текстов
		function textGen(text, fontSize, x, y, notDestroy)
		{
			var text = new PIXI.Text(text,
			{
				fontFamily : 'Courier New', 
				fontSize: fontSize, 
				fill : 0xFFFFFF, 
				align : 'right',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
			text.x = x;
			text.y = y;
			text.notDestroy = notDestroy;
			return text;
		}

		this.createWallSheet();
		this.loadSpriteSheet();
		this.levels=params.levels;
		this.boundDraw= this.draw.bind(this);
		//setTimeout(boundDraw,200);

		this.spriteArray = [];
		document.addEventListener("Pacman: game paused", this.pause.bind(this));
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
		var rectangles = ['10,10,70,70,7','16,16,58,58,7','112,16,32,64,15','176,16,64,32,16','176,74,64,6,4','265,16,6,64,4'];
	
		addRectangles(rectangles, this.wallSheet.stage);
		function addRectangles(rectangles,stage)
		{
			for (var i=0; i<rectangles.length; i++)
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
		//this.wallSheet.view.style.visibility = "Hidden";
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
		var cells = ['2,8,2','64,8,0','8,7,2','16,5,2','66,0,1','74,0,1','82,0,1','24,1,0','26,1,0','88,1,0','80,0,0','72,2,0','18,0,2','10,2,2'];

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
		this.interactiveSprites = [];
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
			for (var j = 0; j < level[0].length; j++)
			{
				var item = level[i][j];
				if (item==1)
				{
					sum=0;
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

					if((item>1)&&(item<7))
					{
						if (item==6)
						{
							var sprite = new PIXI.extras.AnimatedSprite(this.playerTextures);
							sprite.pivot.x = this.blockWidth / 2;
							sprite.pivot.y = this.blockHight / 2;
							sprite.x = (j+0.5)*this.blockWidth;
							sprite.y = (i+0.5)*this.blockHight;
							sprite.animationSpeed = 0.5;
							this.interactiveSprites.push(sprite);
						}
						else
						{
							var sprite = new PIXI.Sprite(this.otherTextures[item]);
							sprite.x = j*this.blockWidth;
							sprite.y = i*this.blockHight;
							this.gameCanvas.stage.addChild(sprite);	
						}
						
						sprite.width = this.blockWidth;
						sprite.height = this.blockHight;
						sprite.alpha = 0;
						if ((item==2)||(item==3)||(item==6))
							{
								this.spriteArray[i][j] = sprite;	
							}	
					}
				}
			}
		}

		for (var i=0; i<this.interactiveSprites.length;i++)
		{
			this.gameCanvas.stage.addChild(this.interactiveSprites[i]);	
		}
		//экран паузы
		this.gameCanvas.stage.addChild(this.pauseBox);
		this.gameCanvas.stage.addChild(this.pauseText);
		this.pauseText.alpha = 0;
		this.pauseBox.alpha = 0;
		this.pauseBox.pauseBox = true;

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
		var repeats = 10;
		var boundAnimate = animate.bind(this);
		var boundDestroy = destroy.bind(this);

		//if (toAnimate == undefined) boundDestroy();
			//else  boundAnimate();
			boundDestroy();

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
			case 0: sprite.rotation = Math.PI; break;
			case 1: sprite.rotation = -1.57; break;
			case 2: sprite.rotation = 0; break;
			case 3: sprite.rotation = 1.57; break;
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

		var speedX = (newx - oldx)/6;
		var speedY = (newy - oldy)/6;
		
		var repeats=0;			
		animate();
		function animate()
		{	
			sprite.stop();
			sprite.x = sprite.x + speedX;
			sprite.y = sprite.y + speedY;
			if (repeats!=5)
			{
				sprite.play();
				repeats++;
				setTimeout(animate,20);
			}
		}
	}

	//возвращение канваса игры
	returnContainer()
	{
		return this.gameCanvas.view;
	}

	pause()
	{
		if (this.pauseBox.alpha == 0)
		{
			this.pauseBox.alpha = 0.3;
			this.pauseText.alpha = 1;
		}
		else
		{
			this.pauseBox.alpha = 0;
			this.pauseText.alpha = 0;
		}
	}

}