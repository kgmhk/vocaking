var async = require('async');

async.parallel([
	// 첫 번째 함수 
	function(callback){
		setTimeout(function(){
			console.log('function1 execute!!!');
			callback(null, 'one');
		}, 3000);
	},
	//두 번째 함수
	function(callback){
		setTimeout(function(){
			console.log('function2 execute!!!');
			callback(null, 'two');
		}, 500);
	}
],
function(err, result){
	if(err) console.log('err:' , err);
		console.log('result :',result)
	}


);