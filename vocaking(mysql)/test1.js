var async = require('async');

async.series([
	// 첫 번째 함수 정의
	function(callback){
		console.log('function1 execute!!!!');
		/*
		/ select 문
		/ 이곳에 select문을 사용한 후 결과를 callback 안에 담는다.
		*/
		callback(null, 'one');
	},
	// 두 번째 함수 정의
	function(callback){
		console.log('function2 execute!!!!');
		/*
		/ select 문
		/ 이곳에 select문을 사용한 후 결과를 callback 안에 담는다.
		*/
		callback(null, 'two');
	}
	],
	// 최종 결과를 얻는 함수 (err or result)
	function(err, result){
		if(err) console.log(err);
		console.log('result', result); // 최종결과가 배열 형태로 ['one', 'two']로 들어간다.
 	
	}
);