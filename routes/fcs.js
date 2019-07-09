var express = require('express');
var router = express.Router();
var d3 = require("d3")

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function randn_bm(min, max, skew) {
		if(!skew) skew=1
		if(!min) min=0
		if(!max) max=2
		var u = 0, v = 0;			
		while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
		while(v === 0) v = Math.random();
		let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

		num = num / 10.0 + 0.5; // Translate to 0 -> 1
		if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
		// num = Math.pow(num, skew); // Skew
		num *= max - min; // Stretch to fill range
		num += min; // offset to min
		return num
}

router.get('/gauss/?',  function(req, res, next) {
	const {x=500, y=200, xSD=100, ySD=250, n=50000} = req.query  // pull url params out of URL
	console.log(`x:${x}+- ${xSD}    y:${y}+- ${xSD}   for ${n} points  `)
	var particles = d3.range(n).map(function(i) {
		return { 
			x:Math.round(randn_bm((+x- +xSD),(+x+ +xSD))),
			y:Math.round(randn_bm((+y- +ySD),(+y+ +ySD)))
			};
	});

	console.log(JSON.stringify(particles[0]))
	res.json(particles)

});

router.get('/plot/?',  function(req, res, next) {
	res.render('plot')
});

router.get('/plot2/?',  function(req, res, next) {
	res.render('plot2')
});

router.get('/zoom/?',  function(req, res, next) {
	res.render('zoom')
	// res.render('login');

});

module.exports = router;