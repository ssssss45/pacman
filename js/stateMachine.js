class pacmanStateMachine
{
/*
states -	
1 - idle, state before the game
2 - playing, ingame
3 - pause
4 - game over screen
5 - high score entry
6 - high score screen
*/
	constructor()
	{
		this.state = 1;
	}

	setstate(state)
	{
		if ((state==1)||(state=="idle"))
		{

		}

		if ((state==2)||(state=="playing"))
		{
			
		}

		if ((state==3)||(state=="pause"))
		{
			
		}

		if ((state==4)||(state=="gameOver"))
		{
			
		}

		if ((state==5)||(state=="enterHighScore"))
		{
			
		}

		if ((state==6)||(state=="lookHighScore"))
		{
			
		}
	}

	getstate()
	{

	}
}