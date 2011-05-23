/*global setTimeout:true */

(function tweenyActor (global) {
	var tweeny,
		guid,
		registeredActors,
		drawList;
		
	function updateActors () {
		var i, limit, actorInst;
		
		limit = drawList.length;
		
		for (i = 0; i < limit; i++) {
			actorInst = drawList[i];
			actorInst.state = actorInst.get();  // Won't work!
			actorInst.draw.call(actorInst.state, actorInst);
		}
		
		setTimeout(updateActors, 1000 / tweeny.fps);
	}
	
	/**
	 * Sorts an array numerically, from smallest to largest.
	 * @param {Array} array The Array to sort.
	 * @returns {Array} The sorted Array.
	 */
	function sortArrayNumerically (array) {
		return array.sort(function (a, b) {
			return a - b;
		});
	}
		
	guid = 0;
	registeredActors = {};
	drawList = [];
	
	if (!global.tweeny) {
		return;
	}
	
	tweeny = global.tweeny;
	updateActors();
	
	/**
	 * @param {Object|Function} actorTemplate A Kapi-style actor template
	 * @param {Object} context An HTML 5 canvas object context
	 */
	tweeny.actorInit = function actorInit (actorTemplate, context) {
		var actorController,
			actorId,
			actorInst,
			prop;
		
		actorId = guid++;
		
		// Normalize the actor template, regardless of whether it was passed as an Object or Function.
		if (actorTemplate.draw) {
			actorInst = {
				'draw': actorTemplate.draw,
				'setup': actorTemplate.setup || function () {},
				'teardown': actorTemplate.teardown || function () {}
			};
		} else {
			actorInst = {
				'draw': actorTemplate,
				'setup': function () {},
				'teardown': function () {}
			};
		}
		
		actorInst.context = context;
		actorInst.state = {};
		actorInst.template = actorTemplate;
		actorInst.data = {};
		
		// Need to store the actor instance internally.  Things that need to be stored:
		//   - Canvas context
		//   - A reference to the actor template
		//   - Arbitrary actor `data`
		registeredActors[actorId] = actorInst;
		
		actorController = {
			// Add the actor to the draw list
			'begin': function begin () {
				drawList.push(actorInst);
				sortArrayNumerically(drawList);
			},
			
			// Remove the actor from the draw list
			'stop': function stop () {
				var i, limit;
				
				limit = drawList.length;
				
				for (i = 0; i < limit; i++) {
					if (drawList[i] === actorId) {
						drawList.splice(i, 1);
						i = limit;
					}
				}
			},
			
			// Remove the actor completely
			'destroy': function destroy () {
				actorController.stop();
				actorInst.teardown.call(actorInst);
				delete registeredActors[actorId];
			},
			
			'data': function data (newData) {
				if (newData) {
					actorInst.data = newData;
				}
				
				return actorInst.data;
			}
		};
		
		// Attach all of the tweeny methods
		for (prop in tweeny) {
			if (tweeny.hasOwnProperty(prop) && typeof tweeny[prop] === 'function') {
				actorController[prop] = tweeny[prop];
			}
		}
		
		return actorController;
	};
	
}(this));