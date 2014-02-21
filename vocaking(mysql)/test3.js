var async = require('async');

async.waterfall([
	function(callback){
		console.log('function1 execute!!!');
		callback(null, 'one', ' two');
	},
	function(arg1, arg2, callback){ // callback에 'one'이 arg1으로 'two'가 arg2로
		console.log('function2 execute!!!');
		console.log('arg1',arg1);
		console.log('arg2',arg2);
		callback(null, 'three');
	},
	function(arg1, callback){
		console.log('function3 execute!!!');
		console.log('arg3',arg1);
		callback(null,'done');
	}
	],
	function(err, result){
		if(err) console.log('err : ', err);
		console.log('result : ', result);

	}
);