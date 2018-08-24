class Bonus
{
	constructor(params)
	{
		//количество тиков бездействия, которые будут начислены противникам
		this.freeze = params.freeze || 0;
		//количество очков которые даст бонус
		this.points = params.points || 0;
		//количество жизней которые даст бонус
		this.lives = params.lives || 0;
		//количество тиков уязвимости которое будет выдано противникам
		this.ozv = params.ozv || 0;
		//местоположение бонуса. если undefined то бонусы будут появлятся в рандомных местах в которых нет точек/озверина
		this.location = params.location || 0;
		//количество тиков через которое будет появлятся бонус. если 0 то он появится только в начале. если бонус не съеден то отсчет вестись не будет
		this.spawns = params.spawns || 0;
		//появляется ли в начале. если это false и spawns == 0 бонус не будет появлятся вообще
		this.spawnsAtStart = params.spawnsAtStart || false;
		//таймер отсчета до появления бонуса
		this.timeToSpawn = this.spawns;
		//находится ли бонус на поле на начало уровня
		this.isOnField = this.spawnsAtStart;
	}
}