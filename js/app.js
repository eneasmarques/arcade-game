class Game {
	constructor() {
		this._status;
		this._congratulation;
	}

	static get status() {
		return this._status;
	}

	static set status(value) {
		this._status = ['pause','play','end'].find(status => status === value) || 'pause';
	}

	static get congratulation() {
		return this._congratulation;
	}

	static set congratulation(value) {
		if ((this.congratulation === undefined) || (this.status === 'pause')) {
			this._congratulation = value;
		}
	}

	static alterStatus() {
		switch (this.status) {
			case 'pause':
			this.status = 'play';
			break;
			case 'play':
			case 'end':
			this.status = 'pause';
			this.congratulation = undefined;
			break;
		}
	}

	static menu(canvas) {
		if (this.status === 'pause') {
			ctx.textAlign = 'center';

			ctx.font = `48pt ${FONT_NAME}`;
			ctx.strokeText("RUNDEGREE",canvas.width/2,canvas.height/2 -80);
			ctx.fillText("RUNDEGREE",canvas.width/2,canvas.height/2 -80);
			ctx.save();

			ctx.font = `24pt ${FONT_NAME}`;
			ctx.strokeText("2 players",canvas.width/2,canvas.height/2 -55);
			ctx.fillText("2 players",canvas.width/2,canvas.height/2 -55);
			ctx.save();

			ctx.font = `24pt ${FONT_NAME}`;
			ctx.strokeText("PRESS SPACE",canvas.width/2,canvas.height/2 + 50);
			ctx.fillText("PRESS SPACE",canvas.width/2,canvas.height/2 + 50);
		} else if (this.status === 'end') {
			ctx.font = `36pt ${FONT_NAME}`;
			ctx.strokeText(`${this._congratulation}`,canvas.width/2,canvas.height/2 + 10);
			ctx.fillText(`${this._congratulation}`,canvas.width/2,canvas.height/2  + 10);
		}
	}
}

class Sprite {
	constructor (sprite, positionX, positionY) {
		this.sprite = sprite;
		this.positionX = positionX;
		this.positionY = positionY;
		this.width = 0;
		this.height = 0;
	}

	setSprite() {
		this.sprite = this.getSprite();
	}

	getSprite() {
		const sprites = {
			Enemy: 'enemy',
			Player: `${['char-boy',
			'char-cat-girl',
			'char-horn-girl',
			'char-pink-girl',
			'char-princess-girl'][Math.floor(Math.random() * 4)]}`,
			Goal: 'nanodegree',
			Item: 'water-block'
		}
		return `images/${sprites[this.constructor.name]}.png`;
	}

	startPosition() {
		const positions = {
			Enemy: {
				x: 101 * Math.floor(Math.random() * 6),
				y: 83 * Math.floor(Math.random() * (5 - 1) + 1)
			},
			Player: {
				x: {
					1: 0,
					2: 45
				},
				y: 50
			},
			Goal: {
				x: 101 * ((Math.floor(Math.random() * 5))),
				y: 50 + (83 * 5)
			},
			Item: {
				x: 101 * ((Math.floor(Math.random() * 5))),
				y: 50 + (83 * Math.floor(Math.random() * (5 - 1) + 1))
			}
		}

		this.positionX = (this.constructor.name !== 'Player') ?
		this.positionX = positions[this.constructor.name]['x'] :
		this.positionX = positions[this.constructor.name]['x'][this.player];
		this.positionY = positions[this.constructor.name]['y'];
	}

	render() {
		const image = Resources.get(this.sprite);

		this.width = image.width;
		this.height = image.height;

		ctx.drawImage(image, this.positionX, this.positionY);
	}

	reset() {
		this.startPosition();
		this.setSprite();
	}
}

class Enemy extends Sprite {
	constructor(sprite = 'enemy', positionX = 0, positionY = 0) {
		super(sprite, positionX, positionY);
		this.speed = Math.random() * (130 - 50) + 50;
	}

	update(dt) {
		this.positionX += this.speed * dt;
	}

	render() {
		if (this.positionX > 505 + this.width) {
			this.positionX = -this.width;
		}

		super.render();
	}
}

class Player extends Sprite {
	constructor(player = 1, sprite = 'player', positionX = 0, positionY = 50) {
		super(sprite, positionX, positionY);
		this.player = player;
		this.score = 0;
	}

	update() {
		return this.playerWon();
	}

	handleInput(key) {
		switch (key) {
			case 'right':
				if (this.positionX < (101 * 4)) { this.positionX += 101};
				break;
			case 'left':
				if (this.positionX >= 101) { this.positionX -= 101};
				break;
			case 'down':
				if (this.positionY < (83 * 5)) { this.positionY += 83};
				break;
			case 'up':
				if (this.positionY >= 83) { this.positionY -= 83};
				break;
		}
	}

	render() {
		super.render();

		ctx.textAlign = 'center';
		ctx.font = `18pt ${FONT_NAME}`;
		ctx.strokeText(this.score,this.positionX + (this.width/2),this.positionY);
		ctx.fillText(this.score,this.positionX + (this.width/2),this.positionY);
	}

	collision(elements) {
		let check = false;
		for (const element of elements) {
			if (((this.positionY >= element.positionY) && (this.positionY < element.positionY + element.height)) &&
			(this.positionX + 40 < element.positionX + element.width) && (this.positionX + this.width > element.positionX + 20)) {
				this.startPosition();
				if (element.constructor.name === 'Goal') {
					this.sumScore();
					break;
				}
			}
		}
		return this.playerWon();
	}

	sumScore() {
		this.score += 1;
	}

	playerWon() {
		return (this.score === 3) ? `Player ${this.player} won!`: undefined;
	}

	reset() {
		super.reset();
		this.score = 0;
	}
}

class Item extends Sprite {
	constructor(sprite = 'water-block', positionX, positionY) {
		super(sprite, positionX, positionY);
	}
}

class Goal extends Sprite {
	constructor(sprite = 'nanodegree', positionX, positionY) {
		super(sprite, positionX, positionY);
	}
}

const allEnemies = [];
do {
	allEnemies.push(new Enemy());
} while (allEnemies.length < 15);

const nanodegree = new Goal();

const allWaterBlock = [
	new Item('item'),
	new Item('item')
];

const allPlayer = [
	new Player(1),
	new Player(2)
];

document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		65: 'left',
		38: 'up',
		87: 'up',
		39: 'right',
		68: 'right',
		40: 'down',
		83: 'down'
	};
	if (Game.status === 'play') {
		if (e.keyCode >= 37 && e.keyCode <= 40) {
			allPlayer[1].handleInput(allowedKeys[e.keyCode]);
		} else if (allowedKeys[e.keyCode] !== undefined) {
			allPlayer[0].handleInput(allowedKeys[e.keyCode]);
		}
	}
});
