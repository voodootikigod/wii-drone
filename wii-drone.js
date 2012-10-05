var five = require("johnny-five"),
	board, sensor;

var arDrone = require('ar-drone');
var events = require('events');
var util = require('util');



var history = [];
var KONAMI = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];

function isKonami() {
	var is = true;
	var kl = KONAMI.length;
	if (history < kl) {
		return false;
	}

	is =  KONAMI.join() === history.reverse().join();
	return is;
}

function WiiDrone(opts) {
	opts = opts || {};
	this.started = false;
	this.client = new arDrone.createClient();

	// map incoming button events to ar-drone commands.
	this.buttonMap = {
		'x': 'up',
		'y': 'down',
		'up': 'front',
		'down': 'back',
		'left': 'left',
		'right': 'right',
		'zl': 'clockwise',
		'zr': 'counterClockwise'
	};
}

util.inherits(WiiDrone, events.EventEmitter);
WiiDrone.prototype.flip = function () {
	this.client.animate('flipLeft', 100);
	var backup = (function (that) {
		return function () {
			that.client.up(1);
		}
	}(this));

	var respin = (function (that) {
		return function () {
			that.client.animate('flipRight', 100);
		}
	}(this));
	setTimeout(backup, 2400);
	setTimeout(respin, 4800);
}
WiiDrone.prototype.toggleStartStop = function() {
	if(this.started) {
		this.client.stop();
		this.client.land();
		this.emit('stop', null, this);
	} else {
		this.client.takeoff();
		this.emit('takeoff', null, this);
	}
	this.started = !this.started;
};

WiiDrone.prototype.handleUp = function(err, event) {
	var buttonId = event.target.which;
	if(this.buttonMap.hasOwnProperty(buttonId)) {
		this.client[this.buttonMap[buttonId]](0);
	} else {
		switch(buttonId) {
		case 'start':
			this.toggleStartStop();
			break;
		case 'r':
			this.flip();
			break;
		}
	}
	this.emit('up', err, event, buttonId, this);
}

WiiDrone.prototype.handleDown = function(err, event) {
	var buttonId = event.target.which;
	if(this.buttonMap.hasOwnProperty(buttonId)) {
		this.client[this.buttonMap[buttonId]](1);
	}
	this.emit('down', err, event, buttonId, this);
}

board = new five.Board({
	debug: true
});

board.on("ready", function() {
	var wiiDrone = new WiiDrone();
	var classicController = five.Nunchuk({
		pins: ["A4", "A5"],
		freq: 100,
		device: "RVL-005"
	});

	board.repl.inject({
		sensor: classicController
	});

	// classicController.on("read", function() {
	// });
	classicController.on("up", function(err, event) {
		history.unshift(event.target.which);
		history.length = KONAMI.length;
		if(isKonami()) {
			wiiDrone.flip();
		} else {
			wiiDrone.handleUp(err, event);
		}
	});
	classicController.on("down", function(err, event) {
		// console.log('down', err, event);
		wiiDrone.handleDown(err, event);
	});



});