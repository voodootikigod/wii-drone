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
	if(history < kl) { return false; }
	is = KONAMI.join() === history.reverse().join();
	console.log(is);
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
		'l': 'counterClockwise',
		'r': 'clockwise'
		
	};
}
util.inherits(WiiDrone, events.EventEmitter);
WiiDrone.prototype.rightFlip = function() {
	this.client.animate('flipRight', 100);
}
WiiDrone.prototype.leftFlip = function() {
	this.client.animate('flipLeft', 100);
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
board = new five.Board({ debug: true});
board.on("ready", function() {
	var wiiDrone = new WiiDrone();
	var classicController = five.Nunchuk({ pins: ["A4", "A5"], freq: 100, device: "RVL-005" });
	board.repl.inject({
		sensor: classicController
	});
	classicController.on("up", function(err, event) {
		console.log(event);
		history.unshift(event.target.which);
		history.length = KONAMI.length;
		if(event.target.which =='zl') {
			console.log("leftflip")
			wiiDrone.leftFlip();
		} else if(event.target.which =='zr') {
			console.log("rightflip")
			wiiDrone.rightFlip();
		} else {
			wiiDrone.handleUp(err, event);
		}
	});
	classicController.on("down", function(err, event) { wiiDrone.handleDown(err, event);	});
});