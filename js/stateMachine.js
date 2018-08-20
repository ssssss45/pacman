class pacmanStateMachine
{

/*
states:	
0 - loading
1 - idle, state before the game
2 - playing
3 - pause
4 - game over screen
5 - high score entry
6 - high score screen
7 - level clear screen
8 - player dead
9 - resetting
10 - ready screen
*/

	constructor()
	{
		this.state = 1;
	}

	setIdle()
	{
		this.state = 1;
	}

	setPlaying()
	{
		if ((this.state == 1)||(this.state == 4)||(this.state == 2))
		{
			this.state = 2;
			var event = new CustomEvent("Pacman: game start");
			document.dispatchEvent(event);
		}
		if (this.state == 9)
		{
			this.state = 2;
		}
	}

	setPause()
	{
		if (this.state == 2)
		{
			this.state = 3;
			var event = new CustomEvent("Pacman: game paused");
			document.dispatchEvent(event);
		}
		else
		{
			if (this.state == 3)
			{
				this.state = 2;
				var event = new CustomEvent("Pacman: game paused");
				document.dispatchEvent(event);
			}	
		}
	}

	setGameOver(score)
	{
		if (this.state == 2)
		{
			this.state = 4;
			var event = new CustomEvent("Pacman: game over",{
				detail: {score: score}
			});
			document.dispatchEvent(event);
		}
	}

	setEnterHighScore()
	{}

	setLookHighScore()
	{}

	setLevelClearScreen()
	{
		if (this.state == 2)
		{
			this.state = 7;
			var event = new CustomEvent("Pacman: level clear");
			document.dispatchEvent(event);
		}
	}

	setPlayerDied()
	{
		if (this.state == 2)
		{
			this.state = 8;
			var event = new CustomEvent("Pacman: player died");
			document.dispatchEvent(event);
		}
	}

	setResetting()
	{
		console.log(this.state);
		if (this.state == 8)
		{
			this.state = 9;
			var event = new CustomEvent("Pacman: resetting");
			document.dispatchEvent(event);
		}
	}

	setState(state)
	{
		if ((state==1)||(state=="idle"))
		{
			this.setIdle();
		}

		if ((state==2)||(state=="playing"))
		{
			this.setPlaying();
		}

		if ((state==3)||(state=="pause"))
		{
			this.setPause();
		}

		if ((state==4)||(state=="gameOver"))
		{
			this.setGameOver();
		}

		if ((state==5)||(state=="enterHighScore"))
		{
			this.setEnterHighScore();
		}

		if ((state==6)||(state=="lookHighScore"))
		{
			this.setLookHighScore();
		}

		if ((state==7)||(state=="levelClear"))
		{
			this.setLevelClearScreen();
		}
	}

	getState()
	{
		return this.state;
	}
}