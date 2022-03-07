const data = {
	gameOn: false,
	timeout: undefined,
	sounds: [],
	startGame: false,
	restricted: false,
	playerCanPlay: false,
	score: 0,
	gameSequence: [],
	playerSequence: [],
	bestSequence: false,
	bestScore: 0,
	levelOne: 400,
	levelTwo: 300,
	levelThree: 250
};

const gui = {
	counter: document.querySelector(".gui_counter"),
	bestScore: document.querySelector(".gui_best-score"),
	bestSequence: document.querySelector(".gui_btn-best-sequence"),
	switch: document.querySelector(".gui_btn-switch"),
	start: document.querySelector(".gui_btn-start"),
	pads: document.querySelectorAll(".game_pad")
}

const soundUrls = [
	"audio/simonSound1.mp3",
	"audio/simonSound2.mp3",
	"audio/simonSound3.mp3",
	"audio/simonSound4.mp3",
	"audio/wrong-buzzer.wav"
];

soundUrls.forEach(sndPath => {
	const audio = new Audio(sndPath);
	data.sounds.push(audio);
});

gui.switch.addEventListener("click", () => {
	data.gameOn = gui.switch.classList.toggle("gui_btn-switch-on");

	gui.counter.classList.toggle("gui_counter-on");
	gui.counter.innerHTML = "--";

	gui.bestScore.classList.toggle("gui_best-score-on");
	gui.bestScore.innerHTML = "--";

	data.restricted = false;
	data.startGame = false;
	data.playerCanPlay = false;
	data.score = 0;
	data.gameSequence = [];
	data.playerSequence = [];
	data.bestScore = 0;
	data.bestSequence = [];

	disablePads();
	changePadCursor("auto");

});

gui.start.addEventListener("click", () => {
	data.restricted = false;
	data.startGame = true;
	startGame();
});

gui.bestSequence.addEventListener("click", () => {
	playBestSequence();

});

const playBestSequence = () => {

	if (data.startGame === true || data.restricted === false)
		return;

	let counterBS = 0,
		padOnBS = true;


	const interval = setInterval(() => {

		if (padOnBS) {
			if (counterBS === data.bestSequence.length) {
				clearInterval(interval);
				disablePads();
				return;
			}

			const sndIdBS = data.bestSequence[counterBS];
			const padBS = gui.pads[sndIdBS];

			data.sounds[sndIdBS].play();
			padBS.classList.add("game_pad-active");
			counterBS++;
		}
		else {
			disablePads();
		}

		padOnBS = !padOnBS;
	}, data.levelTwo);

}


const padListener = (e) => {
	if (!data.playerCanPlay)
		return;

	let soundId;
	gui.pads.forEach((pad, key) => {
		if (pad === e.target)
			soundId = key;
	});

	e.target.classList.add("game_pad-active");

	data.sounds[soundId].play();
	data.playerSequence.push(soundId);

	setTimeout(() => {
		e.target.classList.remove("game_pad-active");

		const currentMove = data.playerSequence.length - 1;

		if (data.playerSequence[currentMove] !== data.gameSequence[currentMove]) {
			if (data.bestSequence.length < data.gameSequence.length - 1) {
				data.bestSequence = [];
				data.bestSequence = data.gameSequence;
				data.bestSequence.pop();

			}
			data.restricted = true;
			data.playerCanPlay = false;
			disablePads();
			resetOrPlayAgain();
		}
		else if (currentMove === data.gameSequence.length - 1) {

			data.score++;
			if (data.score > data.bestScore) {
				data.bestScore = data.score;
				setBestScore();
			}

			newColor();
		}

		waitForPlayerClick();
	}, 250);
}

gui.pads.forEach(pad => {
	pad.addEventListener("click", padListener);
});

const startGame = () => {

	blink("--", () => {
		newColor();
		playSequence();
	});
}

const setScore = () => {
	const score = data.score.toString();
	const display = "00".substring(0, 2 - score.length) + score;
	gui.counter.innerText = display;
}

const setBestScore = () => {
	const bestScore = data.score.toString();
	const displayBestScore = "00".substring(0, 2 - bestScore.length) + bestScore;
	gui.bestScore.innerText = displayBestScore;
}

const newColor = () => {
	if (data.score === 999) {
		blink("END");
		return;
	}

	data.gameSequence.push(Math.floor(Math.random() * 4));

	setScore();
	playSequence();
}

const playSequence = () => {
	let counter = 0,
		padOn = true;

	data.playerSequence = [];
	data.playerCanPlay = false;

	changePadCursor("auto");

	const interval = setInterval(() => {
		if (!data.gameOn) {
			clearInterval(interval);
			disablePads();
			return;
		}

		if (padOn) {
			if (counter === data.gameSequence.length) {
				clearInterval(interval);
				disablePads();
				waitForPlayerClick();
				changePadCursor("pointer");
				data.playerCanPlay = true;
				return;
			}

			const sndId = data.gameSequence[counter];
			const pad = gui.pads[sndId];

			data.sounds[sndId].play();
			pad.classList.add("game_pad-active");
			counter++;
		}
		else {
			disablePads();
		}

		padOn = !padOn;
	}, data.levelTwo);
}

const blink = (text, callback) => {
	let counter = 0,
		on = true;

	gui.counter.innerText = text;

	const interval = setInterval(() => {
		if (!data.gameOn) {
			clearInterval(interval);
			gui.counter.classList.remove("gui_counter-on");
			return;
		}

		if (on) {
			gui.counter.classList.remove("gui_counter-on");
		}
		else {
			gui.counter.classList.add("gui_counter-on");

			if (++counter === 3) {
				clearInterval(interval);
				callback();
			}
		}

		on = !on;
	}, 250);
}

const waitForPlayerClick = () => {
	clearTimeout(data.timeout);

	data.timeout = setTimeout(() => {
		if (!data.playerCanPlay)
			return;

		disablePads();
		resetOrPlayAgain();
	}, 5000);
}

const resetOrPlayAgain = () => {
	data.playerCanPlay = false;

	blink("⚠", () => {
		data.score = 0;
		data.gameSequence = [];
		let songWrong = data.sounds.length -1;
		data.sounds[songWrong].play();
		changePadCursor("auto");
		data.restricted = true;
		data.startGame = false;

		return;
	});
}

const changePadCursor = (cursorType) => {
	gui.pads.forEach(pad => {
		pad.style.cursor = cursorType;
	});
}

const disablePads = () => {
	gui.pads.forEach(pad => {
		pad.classList.remove("game_pad-active");
	});
}