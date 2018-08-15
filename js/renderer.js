class pacmanRenderer
{
	constructor(params)
	{
		this.pathToSpriteSheet = 'resources/Pac-Man__Sprite_Sheet.png'; 
		this.spriteSheetWidth = 227;
		this.spriteSheetHight = 160;
		this.spriteSheetWidthSprites = 14;
		this.spriteSheetHightSprites = 10;
		this.container = document.getElementById("pacman-container");

		this.bitMask=[[1,2,4],[8,0,16],[32,64,128]];

		this.gameCanvas = new PIXI.Application({width: 32*28, height: 32*31});
		this.container.appendChild(this.gameCanvas.view);

		this.createWallSheet();
		this.levels=params.levels;
		var boundDraw= this.draw.bind(this);
		setTimeout(boundDraw,100);
		PIXI.loader
    		.add(this.pathToSpriteSheet)
    		.load(this.onSpriteSheetLoaded.bind(this));
	}
/*
███████╗██████╗ ██████╗ ██╗████████╗███████╗███████╗██╗  ██╗███████╗███████╗████████╗
██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝██║  ██║██╔════╝██╔════╝╚══██╔══╝
███████╗██████╔╝██████╔╝██║   ██║   █████╗  ███████╗███████║█████╗  █████╗     ██║   
╚════██║██╔═══╝ ██╔══██╗██║   ██║   ██╔══╝  ╚════██║██╔══██║██╔══╝  ██╔══╝     ██║   
███████║██║     ██║  ██║██║   ██║   ███████╗███████║██║  ██║███████╗███████╗   ██║   
╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝   

*/
	onSpriteSheetLoaded()
	{
		var frames = [];

	    for (var i = 0; i < this.spriteSheetHight; i++) {}
        var val = i < 10 ? '0' + i : i;
		console.log("Loaded");
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
		this.wallsheetDiv.appendChild(this.wallSheet.view);

		//отрисовка канваса стен
		let roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(10, 10, 70, 70, 7)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
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

		this.wallTextures=[];
		this.wallTexture = PIXI.Texture.fromCanvas(this.wallSheet.view, PIXI.SCALE_MODES.LINEAR);
		//только верх, без соседей
		this.wallTextures[2] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*8, 32*2, 32, 32)
        			);
        //только низ, без соседей
        this.wallTextures[64] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*8, 32*0, 32, 32)
        			);
		//только лево, без соседей
		this.wallTextures[8] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*7, 32*2, 32, 32)
        			);

        //только право, без соседей
        this.wallTextures[16] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*5, 32*2, 32, 32)
        			);

        //верх и низ, без соседей
        this.wallTextures[66] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*0, 32*1, 32, 32)
        			);
		this.wallTextures[74] = this.wallTextures[66];
		this.wallTextures[82] = this.wallTextures[66];

        //лево и право, без соседей			
        this.wallTextures[24] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*1, 32*0, 32, 32)
        			);
        this.wallTextures[26] = this.wallTextures[24];
        this.wallTextures[88] = this.wallTextures[24];
		
        //снизу и справа без соседей
		this.wallTextures[80] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*0, 32*0, 32, 32)
        			);
        //снизу и слева	без соседей		
		this.wallTextures[72] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*2, 32*0, 32, 32)
        			);
        //сверху и справа без соседей			
		this.wallTextures[18] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*0, 32*2, 32, 32)
        			);
        //сверху и слева без соседей			
		this.wallTextures[10] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*2, 32*2, 32, 32)
        			);
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
			console.log(this.wallTextures);
			var level = this.levels[levelNumber];
			level[-1]=[];
			level[level.length]=[];
			for (var i=0; i<this.gameCanvas.stage.children.length;i++)
			{
				this.gameCanvas.stage.children[i].destroy();
			}
			var sum;
			for (var i=0; i<level.length;i++)
			{
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

						
						sprite.x=j*32;
						sprite.y=i*32;
						this.gameCanvas.stage.addChild(sprite);
					}
					else
					{
						if((level[i][j]>1)&&(level[i][j]<6))
						{
							var sprite = new PIXI.Sprite(this.otherTextures[level[i][j]]);
													sprite.x=j*32;
						sprite.y=i*32;
						this.gameCanvas.stage.addChild(sprite);	
						}
					}

				}
			}

			function addToSum(dx,dy,sum,mask)
			{
				return sum = sum + mask[dx][dy];
			}
		}
	}
