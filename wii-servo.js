var five = require("johnny-five");
board = new five.Board({ debug: true});
board.on("ready", function() {
	var classicController = five.Nunchuk({ pins: ["A4", "A5"], freq: 100, device: "RVL-005" });
	var servo1 = five.Servo({pin: 9});
	var servo2 = five.Servo({pin: 10});
	var servo3 = five.Servo({pin: 11});
	board.repl.inject({
		sensor: classicController
	});

	board.repl.inject({
	    servo: servo1
	});

	board.repl.inject({
	    servo: servo2
	});

	board.repl.inject({
	    servo: servo3
	});

	var max = 42;
	var min = 20;
	var range = max -min;
	servo1.move(min);
	servo2.move(min);
	servo3.move(min);


	var allUp = function () { 
		position = min;
		moveServos(position);
	}

	var allDown = function () {
		position = max;
		moveServos(position);
	}

	var stepUp = function () {
		position = Math.min(max, position + increment);
		moveServos(position);
	}
	var stepDown = function () {
		position = Math.min(max, position - increment);
		moveServos(position);
	}
	var toggle = 0;
	var dance = function () {
		console.log("dance");
		servo1.move(parseInt((Math.random() * range)+min, 10));
		servo2.move(parseInt((Math.random() * range)+min, 10));
		servo3.move(parseInt((Math.random() * range)+min, 10));
	};
	var dancer;

	var moveServos = function(value) {
		servo1.move(value);
		servo2.move(value);
		servo3.move(value);
	}

	var action = null;
	var doing = null;
	var position = min;
	var increment = 2;
	servo.on("error", function () { console.log(arguments);})
	classicController.on("up", function(err, event) {
		if (action) {
			clearInterval(action)
			action = null;
		}
	});
	classicController.on("down", function(err, event) { 	
		if (event.target.which == 'up') {
			allUp()
		} else if (event.target.which == 'down') {
			allDown();
		} else if (event.target.which == 'start') {
			if (!dancer)
				dancer = setInterval(dance, 500);

		}else if (event.target.which == 'select') {
			if (dancer){
				clearInterval(dancer);
				dancer=null;
			}
		}else if (event.target.which == 'x') {
			action = setInterval(stepUp, 100);
		}else if (event.target.which == 'y') {
			action = setInterval(stepDown, 100);
		}
	});
});