var varrnum = function(){
	this.rnum;
	set : function(rnum1){
		this.rnum = rnum1;
	console.log(this.rnum);
	},
	get : function(){
		return this.rnum;
	}
};

//varrnum.prototype = {
//}/;

var Rnum = new varrnum();

module.exports = Rnum;