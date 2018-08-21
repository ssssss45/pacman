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
							"eatsDots" : params.eatsDots,
							"id" : params.id
						});
		this.speed = params.speed||1;
		this.killsPlayer = params.killsPlayer;
		this.delay = params.delay||250;
		this.active = false;
		this.vulnerable = false;
		this.x = this.character.x;
		this.y = this.character.y;

		this.dx = this.character.dx;
		this.dy = this.character.dy;

		this.lastPlayerX;
		this.lastPlayerY;
		switch (params.moveType)
		{
			case 0: this.move = this.randomMovement;break;
			case 1: this.move = this.followIfSeen;break;
		}

	}

	randomMovement(level)
	{
		var x = this.character.x;
		var y = this.character.y;
		console.log();
		var flag = false;
		var direction = this.getRandomInt(0,3);
		while (!flag)
		{
			var dir = this.getDxDyFromDirection(direction);
			if(level[y + dir.dy][x + dir.dx] != 1)
			{
				flag = true;
				return this.character.move(dir.dx,dir.dy,direction,level);
			}
			else
			{
				direction= this.getRandomInt(0,3);
				if (direction == 4)
				{
					direction = 0;
				}
			}
		}
	}

	followIfSeen(level, playerX, playerY)
	{
		var direction = -1;
		if ((this.character.x == this.lastPlayerX)&&(this.character.y == this.lastPlayerY))
		{
			this.lastPlayerX = undefined;
			this.lastPlayerY = undefined;
			var result;
			this.dx = 0;
			this.dy = 0;
			this.direction = -1;
		}

		if (playerX == this.character.x)
		{
			setParams(0, 1, 3, this);
			result = check (this.character.x, this.character.y, 0, 1, playerX, playerY, level);
			if (result == undefined)
			{
				setParams(0, -1, 1, this);
				result = check (this.character.x, this.character.y, 0, -1, playerX, playerY, level);
			}
		}

		if (playerY == this.character.y)
		{
			setParams(-1, 0, 0, this);
			result = check (this.character.x, this.character.y, -1, 0, playerX, playerY, level);
			console.log(result);
			if (result == undefined)
			{
				setParams(1, 0, 2, this);
				result = check (this.character.x, this.character.y, 1, 0, playerX, playerY, level);
			}
		}

		if (result != undefined)
		{
			this.lastPlayerX = result.x;
			this.lastPlayerY = result.y;
		}

		function setParams(cdx, cdy, dir, currThis)
		{
			currThis.dx = cdx;
			currThis.dy = cdy;
			currThis.direction = dir;
		}

		function check(x, y, dx, dy, playerX, playerY, level)
		{
			var i = x + dx;
			var j = y + dy;
			var width = level[0].length;
			var hight = level.length;
			var noWallFlag = true;
			while ((i > -1) && (j > -1) && (i < width) && (j < hight) && (noWallFlag))
			{
				if ((i == playerX) && (j == playerY))
				{
					var result = {};
					result.x = i;
					result.y = j;
					return result;
				}
				if (level[j][i] == 1)
				{
					return undefined;
				}

				i += dx;
				j += dy;
			}
		}
		if(this.lastPlayerX == undefined)
		{
			return this.randomMovement(level);
		}
		else
		{
			console.log(this.lastPlayerX);
			console.log(this.lastPlayerY);
			return this.character.move(this.dx, this.dy, this.direction, level);
		}
	}

	clearData()
	{
		this.lastPlayerX = undefined;
		this.lastPlayerY = undefined;
	}

	getDxDyFromDirection(direction)
	{
		var result = {};
		switch (direction)
		{
			case 0:
				result.dx = -1;
				result.dy = 0;
			break;

			case 1:
				result.dx = 0;
				result.dy = -1;
			break;

			case 2:
				result.dx = 1;
				result.dy = 0;
			break;

			case 3:
				result.dx = 0;
				result.dy = 1;
			break;
		}

		return result;
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}