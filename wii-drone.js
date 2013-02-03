var five = require("johnny-five"),
	board, sensor;


var arDrone = require('ar-drone');
var events = require('events');
var util = require('util');
var history = [];
var KONAMI = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];

var ANIMATIONS = ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg', 'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake', 'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed', 'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight'];
var ANIMATION_LENGTH = 10000;   // in ms
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
		'r': 'clockwise',
		'select': 'wave',
		'home': 'disableEmergency'
		
	};
}
util.inherits(WiiDrone, events.EventEmitter);
ANIMATIONS.forEach(function (anim) {
	WiiDrone.prototype[anim] = (function (a) {
		return function (toggle) {
			if (toggle) {
				this.client.animate(a, (a.indexOf("flip") >=0 ? 100 : ANIMATION_LENGTH));
			}
		}
	})(anim);
})


WiiDrone.prototype.clearEmergency = function () {
	this.client.disableEmergency();
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
		var target = this.buttonMap[buttonId];
		if (this.client[target]) {
			this.client[target](0);
		} else if (this[target]) {
			this[target](0);
		} else {
			console.log("Could not find function: "+target);
		}
		
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
		var target = this.buttonMap[buttonId];
		if (this.client[target]) {
			this.client[target](1);
		} else if (this[target]) {
			this[target](1);
		} else {
			console.log("Could not find function: "+target);
		}
	}
	this.emit('down', err, event, buttonId, this);
}






var wiiDrone = new WiiDrone();




board = new five.Board();


// Setup for bread board
// Wire Color   =>  Meaning   =>  Arduino Pin Down
// Yellow       =>  SCK       =>  A05
// White        =>  GND       =>  Ground
// Red          =>  5v        =>  5v
// Green        =>  SDA       =>  A04



var ljs = {x: null, y: null};
var rjs = {x: null, y: null};

board.on("ready", function() {

  // Create a new `Wii.Classic` hardware instance,
  // specifically the RVL-005 device (classic controller).
  var classicController = five.Wii.Classic({
    freq: 100
  });


  // Nunchuk Event API
  //

  // "read" (nunchuk)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  // nunchuk.on( "read", function( err ) {

  // });

  // "change", "axischange" (joystick)
  //
  // Fired when the joystick detects a change in
  // axis position.
  //
  classicController.joystick.left.on( "change", function( err, event ) {
    console.log(
      "Left joystick " + event.axis,
      event.target[ event.axis ],
      event.axis, event.direction
    );
    if (ljs[event.axis]) {
    	//parse as change
    } else {
    	//set as center point
    	ljs[event.axis] = event.target[ event.axis ];
    }

  });

  classicController.joystick.right.on( "change", function( err, event ) {
    console.log(
      "Right joystick " + event.axis,
      event.target[ event.axis ],
      event.axis, event.direction
    );

    if (rjs[event.axis]) {
    	//parse as change
    } else {
    	//set as center point
    	rjs[event.axis] = event.target[ event.axis ];
    }
  });

  // "down"
  // aliases: "press", "tap", "impact", "hit"
  //
  // Fired when any nunchuk button is "down"
  //

  // "up"
  // alias: "release"
  //
  // Fired when any nunchuk button is "up"
  //

  // "hold"
  //
  // Fired when any nunchuk button is in the "down" state for
  // a specified amount of time. Defaults to 500ms
  //
  // To specify a custom hold time, use the "holdtime"
  // option of the Nunchuk constructor.
  //


	classicController.on("up", function(err, event) {
		console.log(event);
		// history.unshift(event.target.which);
		// history.length = KONAMI.length;
		// if(event.target.which =='zl') {
		// 	console.log("leftflip")
		// 	wiiDrone.leftFlip();
		// } else if(event.target.which =='zr') {
		// 	console.log("rightflip")
		// 	wiiDrone.rightFlip();
		// } else {
		wiiDrone.handleUp(err, event);
		// }
	});
	classicController.on("down", function(err, event) { 
		console.log("down", event);
		wiiDrone.handleDown(err, event);	
	});

  // [ "down", "up", "hold" ].forEach(function( type ) {

  //   classicController.on( type, function( err, event ) {
  //     console.log(
  //       event.target.which + " is " + type,

  //       { isUp: event.target.isUp,
  //         isDown: event.target.isDown
  //       }
  //     );
  //   });

});



// give your laptop eyes

var http = require("http"),
    drone = require("dronestream");


var server = http.createServer(function(req, res) {
  require("fs").createReadStream(__dirname + "/index.html").pipe(res);
});

drone.listen(server);
server.listen(5555);
//open up and watch.
require("child_process").exec("open http://127.0.0.1:5555/");