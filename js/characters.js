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
		this.originX = params.x;
		this.originY = params.y;
		this.id = params.id;
	}

	move (dx, dy, direction, level, isDead, vulnerable, outOfCage)
	{
		var score = 0;

		function check(dx, dy, level, isPlayer, outOfCage)
		{
			if (level[dx] == undefined) return true;
			if (isPlayer)
				{
					return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));
				}
				else
				{
					if (!outOfCage)
					{
						return level[dx][dy] != 1;	
					}
					else
					{
						return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));		
					}
				}
		}

		function checkFood(dx, dy, level, renderer, isPlayer)
		{
			if (level[dx] == undefined) return 0;
			if (level[dx][dy] == 2) 
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				score++;
			}
			if ((level[dx][dy] == 3)&&(isPlayer))
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				score = -1;
			}
		}

		if (check(this.y + dy, this.x + dx, level, this.isPlayer, outOfCage)) 
		{
			this.dx = dx;
			this.dy = dy;
			this.direction = direction
		}

		if((check(this.y + this.dy, this.x + this.dx, level, this.isPlayer, outOfCage)) && (this.direction != -1))
		{
			if (this.eatsDots) checkFood(this.y + this.dy ,this.x + this.dx, level, this.renderer, this.isPlayer);
			this.renderer.boundRenderMovement(this.x, this.y, this.dx, this.dy, this.direction, this.id, vulnerable, isDead);
			this.x = this.x + this.dx;
			this.y = this.y + this.dy;
			if(this.x < 0){this.x = level[0].length - 1}
			else
			if(this.x > level[0].length-1){this.x = 0}

			if(this.y < 0){this.y = level.length - 1}	
			else
			if(this.y > level.length - 1){this.y = 0}			
		}
		return score;
	}
}