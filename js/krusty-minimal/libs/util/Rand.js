define([],
function(){

	/**
	 * Contains methods to generate random numbers.
	 *
	 * @namespace Util
	 * @class Rand
	 * @static
	 */
	var Rand = {};

	/**
	 * Returns a random int number between the min and max parameters.
	 *
	 * @method getRandomInt
	 * @param {Integer} min The minimum value of the random.
	 * @param {Integer} max The maximum value of the random.
	 */
	Rand.getRandomInt = function (min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	return Rand;
});
