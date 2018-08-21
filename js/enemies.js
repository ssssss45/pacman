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

	randomMovement(x, y, level)
	{
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

	followIfSeen(x, y, level)
	{
		function check(dx, dy)
		{}
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