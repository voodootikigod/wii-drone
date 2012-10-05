var five = require("johnny-five"),
	board, sensor;

var arDrone = require('ar-drone');

function WiiDrone(opts) {
  opts = opts || {};
  this.started = false;
  this.client = new arDrone.createClient();

  // map incoming button events to ar-drone commands.
  this.buttonMap = {
    'a': 'up',
    'b': 'down',
    'up': 'front',
    'down': 'back',
    'left': 'left',
    'right': 'right'
  };
}

WiiDrone.prototype.toggleStartStop = function() {
  if (this.started) {
    this.client.stop();
    this.client.land();
  } else {
    this.client.takeoff();
  }
  this.started = !this.started;
};

WiiDrone.prototype.handleUp = function(err, event) {
  var buttonId = event.target.which;
  if (this.buttonMap.hasOwnProperty(buttonId)) {
    this.client[ wiiDrone.map[buttonId] ](0);
  } else {
    switch (buttonId) {
      case 'start':
        this.toggleStartStop();
        break;
    }
  }
}

WiiDrone.prototype.handleDown = function(err, event) {
  var buttonId = event.target.which;
  if (this.buttonMap.hasOwnProperty(buttonId)) {
    this.client[ wiiDrone.map[buttonId] ](1);
  }
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

	classicController.on("read", function() {
		console.log("read");
	});

  classicController.on("up", wiiDrone.handleUp);
  classicController.on("up", wiiDrone.handleDown);

});
