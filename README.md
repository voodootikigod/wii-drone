wii Drone
=========

ARDrones are really freakin awesome. They are flying quadcopters that you normally control through an mobile device using an interface that is less than easy to work with. So we (Matt Podwysocki, Chris Williams and Fredrik Lassen) participated in the amazing [NodeCopter](http://nodecopter.com/) event in Berlin. We were able to connect a Nintendo Wii Classic Controller to an arduino and figure out all of the various protocol bits. Long story short - we made it so you can precisely control your quadcopter just as you would Super Mario. This is the code to allow you to do this via node.js. We have released the Johnny-Five module for the Wii classic controller as well.

To use this, you can purchase this awesome little $4 [Wii adapter for arduino](http://todbot.com/blog/2008/02/18/wiichuck-wii-nunchuck-adapter-available/) to break out the pins, or you can do as we did and cut the wires and splice them to the breadboard - your call. If you are cutting the cord, the wires map to the following:

<table>
<tr><th>Wire Color </th><th>Meaning </th><th>Arduino Pin Down</th></tr>
<tr><td>Yellow </td><td>SCK </td><td>A04</td></tr>
<tr><td>White </td><td>GND </td><td>Ground</td></tr>
<tr><td>Red </td><td>5v </td><td>5v</td></tr>
<tr><td>Green </td><td>SDA </td><td>A05</td></tr>
</table>

To install all the dependencies for this application, please run this in the wii-drone folder:

<pre>
	npm install
</pre>

With that in place and your [Arduino configured to operate in standard firmata mode](), you can now control your quadcopter! Get flying by entering: 


<pre>
	node wii-drone.js
</pre>

Start will take off and land the drone. Enjoy!