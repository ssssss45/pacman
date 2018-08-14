class pacmanRenderer
{
	constructor(params)
	{
		this.container = document.getElementById("pacman-container");
		this.testCanvas = new PIXI.Application({width: 96, height: 96});

		this.container.appendChild(this.testCanvas.view);
		this.testCanvasArray=[[0,0,0],[0,0,0],[0,0,0]];
		this.bitMask=[[1,2,4],[8,0,16],[32,64,128]];

		this.gameCanvas = new PIXI.Application({width: 32*28, height: 32*31});
		this.container.appendChild(this.gameCanvas.view);

		this.testCanvasArray[-1]=[];
		this.testCanvasArray[3]=[];
		this.createWallSheet();
		for (var i=0; i<3; i++)
		{
			this.testCanvasArray[i][-1]=0;
			this.testCanvasArray[-1][i]=0;
		}
		this.levels=params.levels;
		var boundDraw= this.draw.bind(this);
		setTimeout(boundDraw,1000);
	}

	changeTestCanvas(event)
	{
		//this.sprite = new PIXI.Sprite(this.wallTextures[2]);
		//console.log(this.wallTextures);
		//this.testCanvas.stage.addChild(this.sprite);
		/*this.sprite.x=0;
		this.sprite.y=0;
		this.sprite.height=32;
		this.sprite.width=32;
		this.sprite.texture.update(); */
		console.log(event);
		this.testCanvasArray[Math.floor(event.clientY/32)][Math.floor(event.clientX/32)] = 1 - this.testCanvasArray[Math.floor(event.clientY/32)][Math.floor(event.clientX/32)];
		console.log(this.testCanvasArray);
		this.this.testDraw();

	}

	createWallSheet()
	{
		this.wallsheetDiv = document.createElement('div');
		this.wallSheet = new PIXI.Application({width: 288, height: 96});
		this.container.appendChild(this.wallsheetDiv);
		this.wallsheetDiv.appendChild(this.wallSheet.view);

		//отрисовка канваса стен
		let roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(10, 10, 76, 76, 15)
		this.wallSheet.stage.addChild(roundBox);

		roundBox = new PIXI.Graphics();
		roundBox.lineStyle(3, 0x99CCFF, 1);
		roundBox.drawRoundedRect(16, 16, 64, 64, 15)
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
		//this.wallSheet.view.style.visibility = "Hidden";

		//сетка
		for (var i=0; i < 10; i++)
		{
			var line = new PIXI.Graphics();
			line.lineStyle(1, 0xFFFFFF, 1);
			line.moveTo(i*32,0);
			line.lineTo(i*32,96);
			this.wallSheet.stage.addChild(line);
		}
		for (var i=0; i < 10; i++)
		{
			var line = new PIXI.Graphics();
			line.lineStyle(1, 0xFFFFFF, 1);
			line.moveTo(0,i*32);
			line.lineTo(286,i*32);
			this.wallSheet.stage.addChild(line);
		}

		this.wallTextures=[];
		this.wallTexture = PIXI.Texture.fromCanvas(this.wallSheet.view, PIXI.SCALE_MODES.LINEAR);
		//только верх
		this.wallTextures[2] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*8, 32*2, 32, 32)
        			);
        //только низ
        this.wallTextures[64] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*8, 0, 32, 32)
        			);
		//только лево
		this.wallTextures[8] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*7, 32*2, 32, 32)
        			);
        //только право
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
        //верх и низ, с соседями
        this.wallTextures[82] =  
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*4, 32*1, 32, 32)
        			);
        this.wallTextures[74] = this.wallTextures[82];

        //лево и право, без соседей			
        this.wallTextures[24] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*1, 32*0, 32, 32)
        			);
		//лево и право, с соседями
		this.wallTextures[26] =
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*6, 32*0, 32, 32)
        			);
		this.wallTextures[88] = this.wallTextures[26];
        //снизу и справа 
		this.wallTextures[80] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*3, 32*0, 32, 32)
        			);
        //снизу и слева			
		this.wallTextures[72] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*4, 32*0, 32, 32)
        			);
        //сверху и справа			
		this.wallTextures[18] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*3, 32*2, 32, 32)
        			);
        //сверху и слева			
		this.wallTextures[10] = 
		   			new PIXI.Texture(
          			this.wallTexture,
          			new PIXI.Rectangle(32*4, 32*2, 32, 32)
        			);
		}	


		testDraw()
		{
			for (var i=0; i<this.testCanvas.stage.children.length;i++)
			{
				this.testCanvas.stage.children[i].destroy();
			}
			this.testCanvas
			var sum;
			for (var i=0; i<3;i++)
			{
				for (var j=0; j<3;j++)
				{
					if (this.testCanvasArray[i][j]==1)
					{
						sum=0;
						sum=sum+this.bitMask[0][1]*(this.testCanvasArray[i-1][j]||0)
						sum=sum+this.bitMask[2][1]*(this.testCanvasArray[i+1][j]||0)
						sum=sum+this.bitMask[1][0]*(this.testCanvasArray[i][j-1]||0)
						sum=sum+this.bitMask[1][2]*(this.testCanvasArray[i][j+1]||0)
					/*	for (var k=-1; k<2;k++)
						{
							for (var l=-1; l<2;l++)
							{
								if (!((k==0)&&(l==0))) sum=sum+this.bitMask[k+1][l+1]*(this.testCanvasArray[i+k][j+l]||0);
							}
						}*/
						console.log(sum);
						var sprite = new PIXI.Sprite(this.wallTextures[sum]);
						sprite.x=j*32;
						sprite.y=i*32;
						this.testCanvas.stage.addChild(sprite);
					}
				}
			}
		}	
		//отрисовка уровня
		draw()
		{
			var levelNumber=0;
			console.log(this.levels);
			var level = this.levels[levelNumber];
			level[-1]=[];
			for (var i=0; i<this.gameCanvas.stage.children.length;i++)
			{
				this.gameCanvas.stage.children[i].destroy();
			}
			this.testCanvas
			var sum;
			for (var i=0; i<level.length;i++)
			{
				for (var j=0; j<level[0].length;j++)
				{
					if (level[i][j]==1)
					{
						sum=0;
						if (level[i-1][j]==1) sum=sum+this.bitMask[0][1];
						if (level[i+1][j]==1) sum=sum+this.bitMask[2][1];
						if (level[i][j-1]==1) sum=sum+this.bitMask[1][0];
						if (level[i][j+1]==1) sum=sum+this.bitMask[1][2];

					/*for (var k=-1; k<2;k++)
						{
							for (var l=-1; l<2;l++)
							{
								if ((!((k==0)&&(l==0)))&&(level[i+k][j+l]==1)) sum=sum+this.bitMask[k+1][l+1];
							}
						}*/
						console.log(sum);
						var sprite = new PIXI.Sprite(this.wallTextures[sum]);
						sprite.x=j*32;
						sprite.y=i*32;
						this.gameCanvas.stage.addChild(sprite);
					}
				}
			}
		}
	}
