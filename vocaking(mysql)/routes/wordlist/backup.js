var async = require('async');
var db =require('../../models/db');
var util = require('util');

/*
// backup 처리
// 사용자가 자신의 리스트에 단어 추가 시 backup 테이블에 list,word를 저장한다.
// 따로 callback을 지정하여 함수 실행 전에 넘어가는 것을 방지.
*/

function backupquery(email, list, word, mean, callback){
		db.getConnection(function(err, connection){ // 사용자의 데이터 저장 query
			var a;
			var i = 0;
			console.log('word ::::', word);
			connection.query('select count(*) cnt from member where email=?',[email],function(err, result){ // 무결성 검사
				if(err) console.log('backup.select email query err:', err);
				if(result[0].cnt == 1){ // 등록 된 유저 일 경우
					//pool.getConnection(function(err, connection){

						connection.query('insert into backup(email,list,word,mean) values(?,?,?,?)',[email,list,word,mean],function(err, results){  // DB backup
							if(err)
							{
								console.log('backup query err : ', err);
								return callback(null,err);
					
							} 
							if(results.affectedRows == 1){
								a = {'result':true, 'result_msg': 'backup sucess'};
								return callback(null,a); 
							}
							else{
								a = {'result': false, 'result_msg':'backup fail'};
								return callback(null,a); 
							}
							connection.release();
						});// backup file DB save query
					//});
					i++;
					
				}
				else{
					a= {'result':false, 'result_msg':'invailed user'};
					return callback(null,a); 
				}
			}); // 등록 된 유저 확인 query
		});// pool
}

exports.backupform = function(req,res){
	res.render('backup',{title: 'Express'});
};
exports.backup = function(req, res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
	}else{
		var list = req.body.mylist;
		var email = req.session.email;
		var wordarray = req.body.word;
		var meanarray = req.body.mean;
		var result;
		console.log(wordarray[0]);
		try{

		 	async.waterfall([
		 		function(callback){
			 		if(util.isArray(wordarray) && util.isArray(meanarray)){
					    for(var i = 0; i < wordarray.length; i++){
					    	console.log("wordarray[]", wordarray[i]);
					    	result = backupquery(email, list, wordarray[i], meanarray[i], callback);
					    	
					    	//res.json({result : result});
						}
						//callback(null, result);
					}else{    
						result = backupquery(email, list, wordarray, meanarray, callback);
						//res.json({result : result});
					    console.log("wordarray", result);
						//callback(null, result);
					}
		 		}
		 	],function(err, result){
		 		res.json({result: result.result , result_msg : result.result_msg});
				console.log('wordarray1', result);
		 	});
		 }catch(e){
		 	console.log('------------------backupquery 함수 호출 에러--------------------------');
		 	res.json({'result': false, 'result_msg' : 'backupquery err'});
		 }
	}
};


