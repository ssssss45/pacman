class PacmanSound
{
	constructor()
	{
		//загрузка аудио
		PIXI.loader
			.add([
				"resources/sounds/death.wav",
				"resources/sounds/dotEaten.wav",
				"resources/sounds/button.wav",
				"resources/sounds/idle.wav",
				"resources/sounds/gameSong.wav",
				"resources/sounds/scores.wav",
				"resources/sounds/walk.wav",
				"resources/sounds/gameOver.wav",
				"resources/sounds/ozv.wav",
				"resources/sounds/enemyWalk.mp3",
				"resources/sounds/eatEnemy.wav",
				"resources/sounds/bonus.wav"
				])
			.load(this.generateLoadedEvent.bind(this))
		document.addEventListener("Pacman: game start", this.handleGameStart.bind(this));
		document.addEventListener("Pacman: ready screen", this.handleReadyScreen.bind(this));
		document.addEventListener("Pacman: game paused", this.handlePause.bind(this));
		document.addEventListener("Pacman: game over", this.gameOverHandle.bind(this));
		document.addEventListener("Pacman: player died", this.deathHandle.bind(this));
		document.addEventListener("Pacman: score changed", this.handleUpdateScore.bind(this));
		document.addEventListener("Pacman: enter high score", this.handleEnterName.bind(
			this));
		document.addEventListener("Pacman: ozverin eaten", this.handleOzverin.bind(this));
		document.addEventListener("Pacman: player moved", this.playerMovedHandle.bind(this));
		document.addEventListener("Pacman: closest enemy to player", this.switchGameSongSpeed.bind(this));
	}

	handlePause(event)
	{	
		this.buttonSound.play();

		if(event.detail.paused)
		{
			this.gameSong.resume();
		}
		else
		{	
			this.gameSong.play();
		}
	}

	handleGameStart()
	{
		this.idle.stop();
		this.scoresSong.stop();
		this.buttonSound.play();
		this.buttonHandle();
		this.gameSong.play();
	}

	handleUpdateScore(event)
	{
		switch (event.detail.reason)
		{
			case "dot": this.dotEaten.play(); break;
			case "bonus": this.bonusSound.play(); break;
			case "enemy": this.enemyEaten.play(); break;
		}
	}

	handleReadyScreen()
	{
		this.idle.stop();
	}

	buttonHandle()
	{
		this.buttonSound.play();
	}

	deathHandle()
	{
		setTimeout(deathSound.bind(this), 500);
		this.gameSong.stop();

		function deathSound()
		{
			this.deathSound.play();
		}
	}

	gameOverHandle()
	{
		this.gameOverSound.play();
		this.gameSong.stop();
		this.scoresSong.play();
	}

	handleEnterName()
	{
		this.gameSong.stop();
	}

	handleOzverin()
	{
		this.ozvSound.play();
	}

	playerMovedHandle()
	{
		this.playerStep.play();
	}

	switchGameSongSpeed(event)
	{
		var distance = event.detail.distance;
		var speed;
		if (distance < 6)
		{
			speed = 1.6 - distance / 10;
		}
		else
		{
			speed = 1;
		}

		this.gameSong.speed = speed;
	}

	generateLoadedEvent()
	{
		this.playerStep = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/walk.wav"]);
		this.dotEaten = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/dotEaten.wav"]);
		this.enemyEaten = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/eatEnemy.wav"]);
		this.scoresSong = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/scores.wav"]);
		this.gameSong = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/gameSong.wav"]);
		this.buttonSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/button.wav"]);
		this.deathSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/death.wav"]);
		this.ozvSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/ozv.wav"]);
		this.gameOverSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/gameOver.wav"]);
		this.bonusSound = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/bonus.wav"]);
		this.idle = PIXI.sound.Sound.from(PIXI.loader.resources["resources/sounds/idle.wav"]);
		var event = new CustomEvent("Pacman sound: loading finished");
		document.dispatchEvent(event);
		this.idle.play();
	}
}