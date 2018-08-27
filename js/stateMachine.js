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
7 - level clear screen
8 - player dead
9 - resetting
10 - ready screen
11 - new game
*/

	constructor()
	{
		this.state = 0;

		this.loading = 0;
		this.idle = 1;
		this.playing = 2;
		this.pause = 3;
		this.gameOver = 4;
		this.highScoreEnter = 5;
		this.levelClear = 7;
		this.playerDead = 8;
		this.resetting = 9;
		this.readyScreen = 10;
		this.newGame = 11;
	}

	setIdle()
	{
		if ((this.state == this.pause) || (this.state == this.loading))
		{
			this.state = this.idle;
			var event = new CustomEvent("Pacman: idle");
			document.dispatchEvent(event);
		}
	}

	setPlaying()
	{
		if ((this.state == this.readyScreen))
		{
			this.state = this.playing;
			var event = new CustomEvent("Pacman: game start");
			document.dispatchEvent(event);
		}
	}

	setPause()
	{
		if (this.state == this.playing)
		{
			this.state = this.pause;
			var event = new CustomEvent("Pacman: game paused",{
				detail: {paused: true}
			});
			document.dispatchEvent(event);
		}
		else
		{
			if (this.state == this.pause)
			{
				this.state = this.playing;
				var event = new CustomEvent("Pacman: game paused",{
					detail: {paused: false}
				});
				document.dispatchEvent(event);
			}	
		}
	}

	setGameOver(topPlayers)
	{
		if ((this.state == this.playing) || (this.state == this.highScoreOver))
		{
			this.state = this.gameOver;
			var event = new CustomEvent("Pacman: game over",{
				detail: {topPlayers: topPlayers}
			});
			document.dispatchEvent(event);
		}
	}

	setEnterHighScore(score)
	{
		if (this.state == this.playing)
		{
			this.state = this.highScoreOver;
			var event = new CustomEvent("Pacman: enter high score",{
				detail: {score: score}
			});
			document.dispatchEvent(event);
		}
	}


	setLevelClearScreen()
	{
		if (this.state == this.playing)
		{
			this.state = this.levelClear;
			var event = new CustomEvent("Pacman: level clear");
			document.dispatchEvent(event);
		}
	}

	setPlayerDied()
	{
		if (this.state == this.playing)
		{
			this.state = this.playerDead;
			var event = new CustomEvent("Pacman: player died");
			document.dispatchEvent(event);
		}
	}

	setResetting()
	{
		if (this.state == this.playerDead)
		{
			this.state = this.resetting;
			var event = new CustomEvent("Pacman: resetting");
			document.dispatchEvent(event);
		}
	}

	setReadyScreen()
	{
		if ((this.state == this.newGame)||(this.state == this.playing)||(this.state == this.gameOver)||(this.state == this.levelClear))
		{

			this.state = this.readyScreen;
			var event = new CustomEvent("Pacman: ready screen");
			document.dispatchEvent(event);
		}
		else
		{
			if(this.state == this.resetting)
			{
				this.state = this.readyScreen;
				var event = new CustomEvent("Pacman: ready screen",{
					detail: {
						notANewGame :true
					}
				});
				document.dispatchEvent(event);
			}
		}
	}

	setNewGame()
	{
		if ((this.state == this.idle) || (this.state == this.readyScreen) || (this.state == this.gameOver)|| (this.state == this.playing))
		{
			this.state = this.newGame;
			var event = new CustomEvent("Pacman: new game");
			document.dispatchEvent(event);
		}
	}

	getState()
	{
		return this.state;
	}
}