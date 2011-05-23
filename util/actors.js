/**
 * These functions have nothing to do with Tweeny core code.  They are just useful for testing it out.
 * Actors can be functions or objects.
 */


var circle = {
	setup: function (kapiInst, actorInst, params) {
		if (window.console) {
			console.log('Setting up: ' + this.id)
		}
	},
	draw: function (ctx, kapiInst, actorInst){
		ctx.beginPath();
		ctx.arc(
			this.x || 0,
			this.y || 0,
			this.radius || 0,
			0,
			Math.PI*2, 
			true
			);
		ctx.fillStyle = this.color || '#f0f';
		ctx.fill();
		ctx.closePath();

		return this;
	},
	teardown: function (actorName, kapiInst) {
		if (window.console) {
			console.log('Tearing down ' + actorName);
			console.dir(kapiInst);
		}
	}
}


function square(ctx){
	ctx.beginPath();
	
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x + this.width, this.y);
	ctx.lineTo(this.x + this.width, this.y + this.height);
	ctx.lineTo(this.x, this.y + this.height);
	
	ctx.fillStyle = ctx.strokeStyle = this.color || '#f0f';
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}
