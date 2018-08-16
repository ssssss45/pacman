class pacmanStateMachine
{
/*
states:	
1 - idle, state before the game
2 - playing, ingame
3 - pause
4 - game over screen
5 - high score entry
6 - high score screen
7 - level clear screen
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
		this.state = 2;
	}

	setPause()
	{
		if (this.state == 2)
		{
			this.state = 3;
		}
		else
		{
			if (this.state == 3)
			{
				this.state = 2;
			}	
		}
	}

	setGameOver()
	{
		this.state = 4;
		var event = new CustomEvent("Pacman: game over");
		document.dispatchEvent(event);
	}

	setEnterHighScore()
	{}

	setLookHighScore()
	{}

	setLevelClearScreen()
	{
		this.state = 7;
		var event = new CustomEvent("Pacman: level clear");
		document.dispatchEvent(event);
	}

	setstate(state)
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

		if ((state==6)||(state=="levelClear"))
		{
			this.setLevelClearScreen();
		}
	}

	getstate()
	{
		return this.state;
	}
}