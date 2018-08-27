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
		this.killsPlayer = params.killsPlayer||true;
		this.defaultDelay = params.delay||0;
		this.delay = this.defaultDelay||0;
		this.active = false;
		this.canBeVulnerable = params.canBeVulnerable||true;
		this.isDead = false;
		this.x = this.character.x;
		this.y = this.character.y;
		this.locationDistance = params.locationDistance||3;

		this.dx = this.character.dx;
		this.dy = this.character.dy;

		this.vulnerable = 0;
		this.isDead = false;
		this.respawnDelay = params.respawnDelay||0;

		this.lastPlayerX;
		this.lastPlayerY;

		var idleDir = this.getDxDyFromDirection(params.idleMode);
		if (idleDir != undefined)
		{
			this.idleDX = idleDir.dx;
			this.idleDY = idleDir.dy;
		}

		switch (params.moveType)
		{
			case 0: this.move = this.randomMovement; break;
			case 1: this.move = this.ifSeenRandom; break;
			case 2: this.move = this.aStar; break;
			case 3: this.move = this.randomSlider; break;
			case 4: this.move = this.ifSeenSlider; break;
			case 5: this.move = this.locatorRandom; break;
			case 6: this.move = this.locatorSlider; break;
			case 7: this.move = this.locateSeeRandom; break;
			case 8: this.move = this.locateSeeSlider; break;
		}

		this.deadMove = this.aStar;
		this.outOfCage = false;
		this.scoreForDeath = params.scoreForDeath;

		this.boundFollow = this.followIfSeen.bind(this);
		this.boundLocator = this.locator.bind(this);
		this.boundIfSeenRandom = this.ifSeenRandom.bind(this);
		this.boundIfSeenSlider = this.ifSeenSlider.bind(this);
	}

	setDead()
	{
		this.isDead = true;
		this.character.renderer.displayScore(this.scoreForDeath, this.character.x, this.character.y);
	}

	distanceToPlayer(playerX, playerY)
	{
		var x = Math.abs(playerX - this.character.x);
		var y = Math.abs(playerY - this.character.y);
		return Math.sqrt(x*x+y*y);
	}
/*
██████╗  █████╗ ███╗   ██╗██████╗  ██████╗ ███╗   ███╗
██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔═══██╗████╗ ████║
██████╔╝███████║██╔██╗ ██║██║  ██║██║   ██║██╔████╔██║
██╔══██╗██╔══██║██║╚██╗██║██║  ██║██║   ██║██║╚██╔╝██║
██║  ██║██║  ██║██║ ╚████║██████╔╝╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝

*/
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
			var cell = level[y + dir.dy][x + dir.dx];
			if((cell != 1) && (cell != 4) && (cell != 5))
			{
				flag = true;
				this.direction = direction;
				return this.character.move(dir.dx,dir.dy,direction,level,this.isDead,this.vulnerable, this.outOfCage);
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

/*
██████╗        ███████╗██╗     ██╗██████╗ ███████╗██████╗ 
██╔══██╗       ██╔════╝██║     ██║██╔══██╗██╔════╝██╔══██╗
██████╔╝       ███████╗██║     ██║██║  ██║█████╗  ██████╔╝
██╔══██╗       ╚════██║██║     ██║██║  ██║██╔══╝  ██╔══██╗
██║  ██║██╗    ███████║███████╗██║██████╔╝███████╗██║  ██║
╚═╝  ╚═╝╚═╝    ╚══════╝╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝

*/
	randomSlider(level)
	{
		while (true)
		{
			var x = this.character.x;
			var y = this.character.y;

			var dir = this.getDxDyFromDirection(this.character.direction)
			var cell = level[y + dir.dy][x + dir.dx];
			if((cell != 1) && (cell != 4) && (cell != 5))
			{
				return this.character.move(dir.dx, dir.dy, this.character.direction, level,this.isDead,this.vulnerable, this.outOfCage);
			}
			this.character.direction = this.getRandomInt(0,3);
		}
	}

/*
██╗███████╗    ███████╗███████╗███████╗███╗   ██╗
██║██╔════╝    ██╔════╝██╔════╝██╔════╝████╗  ██║
██║█████╗      ███████╗█████╗  █████╗  ██╔██╗ ██║
██║██╔══╝      ╚════██║██╔══╝  ██╔══╝  ██║╚██╗██║
██║██║         ███████║███████╗███████╗██║ ╚████║
╚═╝╚═╝         ╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝
*/

	escape(level, playerX, playerY)
	{
		return (this.boundFollow(level, playerX, playerY, this.randomSlider.bind(this),true));
	}

	ifSeenRandom(level, playerX, playerY)
	{
		return (this.boundFollow(level, playerX, playerY, this.randomMovement.bind(this)));
	}

	ifSeenSlider(level, playerX, playerY)
	{
		return (this.boundFollow(level, playerX, playerY, this.randomSlider.bind(this)));
	}

	followIfSeen(level, playerX, playerY, func, escape)
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
			checkAxis(0,1,3,1,this);
		}

		if (playerY == this.character.y)
		{
			checkAxis(1,0,2,0,this);
		}

		if (result != undefined)
		{
			this.lastPlayerX = result.x;
			this.lastPlayerY = result.y;
		}

		if(this.lastPlayerX == undefined)
		{
			return func(level);
		}
		else
		{
			if (escape == undefined)
			{
				return this.character.move(this.dx, this.dy, this.direction, level,this.isDead,this.vulnerable, this.outOfCage);
			}
			else
			{
				if (result != undefined)
				{
					this.dx *= -1;
					this.dy *= -1;
				}

				if(level[this.character.y + this.dy][this.character.x + this.dx] == 1)
				{
					this.lastPlayerX = undefined;
					this.lastPlayerY = undefined;

					if (this.character.y == playerY)
					{
						this.dx = 0;
						if (level[this.character.y + 1][this.character.x] == 1) 
						{
							this.dy = -1;
						}
						else
						{
							this.dy = 1;
						}
					}
					else
					{
						this.dy = 0;
						if (level[this.character.y][this.character.x + 1] == 1) 
						{
							this.dx = -1;
						}
						else
						{
							this.dx = 1;
						}
					}
				}

				this.direction = this.getDirectionFromDxDy(this.dx,this.dy)
				return this.character.move(this.dx, this.dy, this.direction, level,this.isDead,this.vulnerable, this.outOfCage);
			}
		}

		function checkAxis(dx,dy, dir1, dir2, currThis)
		{

			result = check (currThis.character.x, currThis.character.y, dx, dy, playerX, playerY, level);
			if (result == undefined)
			{
				result = check (currThis.character.x, currThis.character.y, -dx, -dy, playerX, playerY, level);
				if (result != undefined)setParams(-dx, -dy, dir2, currThis);
			}
			else
			{
				if (result != undefined)setParams(dx, dy, dir1, currThis);
			}
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
			var cycled = 0;

			while (cycled<2)
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
				if (i == -1) {i = width; cycled ++;}
				if (j == -1) {j = hight; cycled ++;}
				if (i > width) {i = 0; cycled ++;}
				if (j > hight) {j = 0; cycled ++;}

				i += dx;
				j += dy;
			}
		}
	}
/*
██╗      ██████╗  ██████╗ █████╗ ████████╗ ██████╗ ██████╗ 
██║     ██╔═══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██║   ██║██║     ███████║   ██║   ██║   ██║██████╔╝
██║     ██║   ██║██║     ██╔══██║   ██║   ██║   ██║██╔══██╗
███████╗╚██████╔╝╚██████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
*/
	locatorRandom(level, playerX, playerY)
	{
		return this.boundLocator(level, playerX, playerY, this.randomMovement.bind(this));
	}

	locatorSlider(level, playerX, playerY)
	{
		return this.boundLocator(level, playerX, playerY, this.randomSlider.bind(this));
	}

	locator(level, playerX, playerY, func)
	{
		var x = Math.abs(playerX - this.character.x);
		var y = Math.abs(playerY - this.character.y);
		var distance = Math.sqrt(x*x+y*y);
		if (distance < this.locationDistance)
		{
			this.aStar(level, playerX, playerY);
		}
		else
		{
			func(level, playerX, playerY);	
		}
	}

/*
██╗      ██████╗  ██████╗ █████╗ ████████╗███████╗    ██╗███████╗███████╗███████╗
██║     ██╔═══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝   ██╔╝██╔════╝██╔════╝██╔════╝
██║     ██║   ██║██║     ███████║   ██║   █████╗    ██╔╝ ███████╗█████╗  █████╗  
██║     ██║   ██║██║     ██╔══██║   ██║   ██╔══╝   ██╔╝  ╚════██║██╔══╝  ██╔══╝  
███████╗╚██████╔╝╚██████╗██║  ██║   ██║   ███████╗██╔╝   ███████║███████╗███████╗
╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝    ╚══════╝╚══════╝╚══════╝
*/
	locateSeeRandom(level, playerX, playerY)
	{
		return this.boundLocator(level, playerX, playerY, this.ifSeenRandom.bind(this));
	}

	locateSeeSlider(level, playerX, playerY)
	{
		return this.boundLocator(level, playerX, playerY, this.ifSeenSlider.bind(this));
	}


/*
 █████╗       
██╔══██╗▄ ██╗▄
███████║ ████╗
██╔══██║▀╚██╔▀
██║  ██║  ╚═╝ 
╚═╝  ╚═╝                
*/
	aStar(level, playerX, playerY)
	{
		var path = findPath(level, [this.character.y,this.character.x], [playerY, playerX]);

		if (path[1] != undefined)
		{
			var dx = path[1][1] - this.character.x;
			var dy = path[1][0] - this.character.y;	
		}
		else
		{
			var dx = path[0][1] - this.character.x;
			var dy = path[0][0] - this.character.y;		
		}
		this.character.direction = this.getDirectionFromDxDy(dx,dy);

		return this.character.move(dx, dy, this.character.direction, level,this.isDead,this.vulnerable, this.outOfCage);

		function findPath(world, pathStart, pathEnd)
		{
			var	abs = Math.abs;
			var	max = Math.max;
			var	pow = Math.pow;
			var	sqrt = Math.sqrt;

			var maxWalkableTileNum = 0;

			var worldWidth = world[0].length;
			var worldHeight = world.length;
			var worldSize =	worldWidth * worldHeight;

			// which heuristic should we use?
			// default: no diagonals (Manhattan)
			var distanceFunction = ManhattanDistance;
			var findNeighbours = function(){};

			function ManhattanDistance(Point, Goal)
			{
				return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
			}

			function Neighbours(x, y)
			{
				var	N = y - 1;
				var S = y + 1;
				var E = x + 1;
				var W = x - 1;

				if (E < -1) E = worldHeight - 1;
				if (W > worldHeight) W = 0;

				if (N < -1) N = worldWidth - 1;
				if (S > worldWidth) S = 0;

				var myN = canWalkHere(x, N),
				myS = canWalkHere(x, S),
				myE = canWalkHere(E, y),
				myW = canWalkHere(W, y),
				result = [];
				if(myN)
				result.push({x:x, y:N});
				if(myE)
				result.push({x:E, y:y});
				if(myS)
				result.push({x:x, y:S});
				if(myW)
				result.push({x:W, y:y});
				findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
				return result;
			}

			function canWalkHere(x, y)
			{
				return ((world[x] != null) && (world[x][y] !=1));
			};

			function Node(Parent, Point)
			{
				var newNode = {
					// pointer to another Node object
					Parent:Parent,
					// array index of this Node in the world linear array
					value:Point.x + (Point.y * worldHeight),
					// the location coordinates of this Node
					x:Point.x,
					y:Point.y,
					// the distanceFunction cost to get
					// TO this Node from the START
					f:0,
					// the distanceFunction cost to get
					// from this Node to the GOAL
					g:0
				};

				return newNode;
			}

			function calculatePath()
			{
				// create Nodes from the Start and End x,y coordinates
				var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
				var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
				// create an array that will contain all world cells
				var AStar = new Array(worldSize);
				// list of currently open Nodes
				var Open = [mypathStart];
				// list of closed Nodes
				var Closed = [];
				// list of the final output array
				var result = [];
				// reference to a Node (that is nearby)
				var myNeighbours;
				// reference to a Node (that we are considering now)
				var myNode;
				// reference to a Node (that starts a path in question)
				var myPath;
				// temp integer variables used in the calculations
				var length, max, min, i, j;
				// iterate through the open list until none are left
				while(length = Open.length)
				{
					max = worldSize;
					min = -1;
					for(i = 0; i < length; i++)
					{
						if(Open[i].f < max)
						{
							max = Open[i].f;
							min = i;
						}
					}
					// grab the next node and remove it from Open array
					myNode = Open.splice(min, 1)[0];
					// is it the destination node?
					if(myNode.value === mypathEnd.value)
					{
						myPath = Closed[Closed.push(myNode) - 1];
						do
						{
							result.push([myPath.x, myPath.y]);
						}
						while (myPath = myPath.Parent);
						// clear the working arrays
						AStar = Closed = Open = [];
						// we want to return start to finish
						result.reverse();
					}
					else // not the destination
					{
						// find which nearby nodes are walkable
						myNeighbours = Neighbours(myNode.x, myNode.y);
						// test each one that hasn't been tried already
						for(i = 0, j = myNeighbours.length; i < j; i++)
						{
							myPath = Node(myNode, myNeighbours[i]);
							if (!AStar[myPath.value])
							{
								// estimated cost of this particular route so far
								myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
								// estimated cost of entire guessed route to the destination
								myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
								// remember this new path for testing above
								Open.push(myPath);
								// mark this node in the world graph as visited
								AStar[myPath.value] = true;
							}
						}
						// remember this route as having no more untested options
						Closed.push(myNode);
					}
				} // keep iterating until until the Open list is empty
				return result;
			}
			return calculatePath();
		}
	}

/*
██╗██████╗ ██╗     ███████╗
██║██╔══██╗██║     ██╔════╝
██║██║  ██║██║     █████╗  
██║██║  ██║██║     ██╔══╝  
██║██████╔╝███████╗███████╗
╚═╝╚═════╝ ╚══════╝╚══════╝
*/

	idle(level)
	{
		if ((this.character.x == this.character.originX) &&  (this.character.y == this.character.originY))
		{
			var direction = this.getDirectionFromDxDy(this.idleDX, this.idleDY);
			this.character.move(this.idleDX, this.idleDY, direction, level, this.isDead,this.vulnerable, this.outOfCage);
		}
		else
		{
			var direction = this.getDirectionFromDxDy(-this.idleDX, -this.idleDY);
			this.character.move(-this.idleDX, -this.idleDY, direction, level, this.isDead,this.vulnerable, this.outOfCage);
		}
	}

	standInPlace(level)
	{
		this.character.renderer.upateSpriteTexture(this.character.id, 0, this.vulnerable, this.isDead, this.delay);
	}

/*
███╗   ███╗██╗███████╗ ██████╗
████╗ ████║██║██╔════╝██╔════╝
██╔████╔██║██║███████╗██║     
██║╚██╔╝██║██║╚════██║██║     
██║ ╚═╝ ██║██║███████║╚██████╗
╚═╝     ╚═╝╚═╝╚══════╝ ╚═════╝
*/
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

	getDirectionFromDxDy(dx,dy)
	{
		switch (dx)
		{
			case -1: return 0; break;
			case 1: return 2; break;
		}

		switch (dy)
		{
			case -1: return 1; break;
			case 1: return 3; break;
		}
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}