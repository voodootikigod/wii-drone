var five = require("johnny-five"),
	board, sensor;

board = new five.Board({
	debug: true
});

board.on("ready", function() {

	var classicController = five.Nunchuk({
		pins: ["A4", "A5"],
		freq: 100,
		device: "RVL-005"
	});

	board.repl.inject({
		sensor: classicController
	});


	classicController.on("read", function() {
		
	});
});