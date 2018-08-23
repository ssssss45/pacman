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
	}

	setIdle()
	{
		if ((this.state == 3) || (this.state == 0))
		{
			this.state = 1;
			var event = new CustomEvent("Pacman: idle");
			document.dispatchEvent(event);
		}
	}

	setPlaying()
	{
		if ((this.state == 10))
		{
			this.state = 2;
			var event = new CustomEvent("Pacman: game start");
			document.dispatchEvent(event);
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

	setGameOver(topPlayers)
	{
		if ((this.state == 2) || (this.state == 5))
		{
			this.state = 4;
			var event = new CustomEvent("Pacman: game over",{
				detail: {topPlayers: topPlayers}
			});
			document.dispatchEvent(event);
		}
	}

	setEnterHighScore(score)
	{
		if (this.state == 2)
		{
			this.state = 5;
			var event = new CustomEvent("Pacman: enter high score",{
				detail: {score: score}
			});
			document.dispatchEvent(event);
		}
	}


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
		if (this.state == 8)
		{
			this.state = 9;
			var event = new CustomEvent("Pacman: resetting");
			document.dispatchEvent(event);
		}
	}

	setReadyScreen()
	{
		if ((this.state == 11)||(this.state == 2)||(this.state == 4)||(this.state == 7))
		{

			this.state = 10;
			var event = new CustomEvent("Pacman: ready screen");
			document.dispatchEvent(event);
		}
		else
		{
			if(this.state == 9)
			{
				this.state = 10;
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
		if ((this.state == 1) || (this.state == 10) || (this.state == 4)|| (this.state == 2))
		{
			this.state = 11;
			var event = new CustomEvent("Pacman: new game");
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

		if ((state==6)||(state=="lookHighScore"))
		{
			this.setLookHighScore();
		}

		if ((state==7)||(state=="levelClear"))
		{
			this.setLevelClearScreen();
		}

		if ((state==8)||(state=="playerDead"))
		{
			this.setPlayerDied();
		}

		if ((state==9)||(state=="resetting"))
		{
			this.setResetting();
		}

		if ((state==10)||(state=="readyScreen"))
		{
			this.setReadyScreen();
		}

		if ((state==11)||(state=="newGame"))
		{
			this.setNewGame();
		}
	}

	getState()
	{
		return this.state;
	}
}