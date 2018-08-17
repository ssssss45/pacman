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
		this.score = params.score;
	}

	move (dx,dy,direction,level)
	{	
		function check(dx,dy,level)
		{
			if (level[dx]==undefined) return true;
			return ((level[dx][dy]!=1)&&(level[dx][dy]!=5)&&(level[dx][dy]!=4));
		}

		function checkFood(dx,dy,level,renderer,score,isPlayer)
		{
			if (level[dx]==undefined) return 0;
			if (level[dx][dy]==2) 
			{
				level[dx][dy] = 0;
				renderer.destroySprite(dx,dy);
				if (isPlayer)
				{
					score++;
				}
				return 1;
			}
			else return 0;
		}

		if (check(this.y+dy,this.x+dx,level)) 
		{
			this.dx = dx;
			this.dy = dy;
			this.direction = direction
		}

		if((check(this.y+this.dy,this.x+this.dx,level))&&(this.direction!=-1))
		{
			if (this.eatsDots) this.score = this.score + checkFood(this.y + this.dy ,this.x + this.dx,level,this.renderer,this.score,this.isPlayer);
			this.renderer.boundRenderMovement(this.x,this.y,this.dx,this.dy,this.direction);
			this.x = this.x + this.dx;
			this.y = this.y + this.dy;
			if(this.x < 0){this.x = level[0].length - 1}
			else
			if(this.x > level[0].length-1){this.x = 0}

			if(this.y < 0){this.y = level.length-1}	
			else
			if(this.y > level.length -1){this.y = 0}			
		}
	}
}

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
							"eatsDots" : params.eatsDots
						});
		this.speed = params.speed;
		this.killsPlayer = params.killsPlayer;
		this.move = this.character.move;
		this.delay = params.delay;
	}
}