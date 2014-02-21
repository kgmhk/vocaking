var async = require('async');
var db =require('../../models/db');


exports.update_chkform = function(req, res){
	res.render('update_chk');
};

exports.update_chk = function(req, res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
	}else{
		var email = req.session.email;
		try{
			db.getConnection(function(err, connection){ // update테이블에서  ver 확인
				connection.query('select a.up_ver, a.contentname from chk_update a where not exists(select * from memupdate b where a.up_ver = b.up_ver and email = ?)',[email], function(err, result){
					if(err){
						res.json({'result': false,'result_msg': err});
						console.log('cur_ver err', err);
						return;
					} 
					console.log('result : ', result, 'cur_ver:', result[0].up_ver, 'cnt : ', result[0].contentname);
					res.json({result : true, data : result, result_msg : 'check success'});
					connection.release();
					return;
				});//query
			}); // pool
		}catch(e){
			console.log('-------------update_chk 최신버젼 확인 err-------------');
			res.json({'result': false, 'result_msg' : 'up_ver check err'});
		}
	}
};



/*
// update 요청 시 해당 버젼에 맞는 content를 찾아서 클라이언트에 전송
*/
exports.updateform = function(req, res){
	res.render('update');
};

exports.update = function(req,res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
	}else{		
		var up_ver = req.body.up_ver;
		var email = req.session.email;
			async.waterfall([
				function(callback){
					//content 테이블에서 요구하는 버젼의 아이템을 찾는다.
					try{
						db.getConnection(function(err, connection){
							connection.query('select distinct(up_ver) from content where up_ver=?',[up_ver], function(err2,results2){
								if(err2){
									res.json({'result': false,'result_msg': err});
									console.log('cur_ver err', err);
									return;
								} 
								connection.release();
								callback(null, results2);
							}); // query
						}); // pool
					}catch(e){
						console.log('-------------content 테이블에서 요구 버젼 찾기 err-------------');
						res.json({'result': false, 'result_msg' : 'select content ver_chk err'});
					}
				},
				function(arg1, callback){
					//첫 번째에서 찾은 버젼을 이용하여 word와 mean을 뽑아 낸다.
					try{
						var a = 0;
						var arr = [];
						async.each(arg1, function(item, callback){
							console.log('item', item);
							db.getConnection(function(err, connection){
								connection.query('select word, mean from content where up_ver=?',[item.up_ver], function(err, results){
									if(err){
										res.json({'result': false,'result_msg': err});
										console.log('cur_ver err', err);
										return;
									} 
									else{
										console.log('query results :', results);
										var words = [];
										var means = [];
										for(var i=0; i<results.length; i++){
											console.log('results.word', results[i].word);
							 				words[i] = results[i].word;
							 				means[i] = results[i].mean
										};// for
										arr[a] = {words:words, mean:means};
										a++;
										callback();
									}// else
									connection.release();
								}); //query
							}); // pool
						}, function(err){ // each 작업 완료
							if(err) console.log('err', err);
							console.log('each 결과 arr=', arr);
							callback(null, arr);
						}); // each
						
					}catch(e){
						console.log('-------------content 테이블에서 word, mean select err-------------');
						res.json({'result': false, 'result_msg' : 'select content word, mean err'});
					}
				}
				],
				function(err,result){
					try{
						if(err){
							res.json({'result': false,'result_msg': err});
							console.log('cur_ver err', err);
							return;
						} 
						console.log('result', result);
						db.getConnection(function(err, connection){ // member 테이블에 cur_ver를 최신 up_ver으로 수정
							connection.query('update member set cur_ver=? where email=?',[up_ver,email],function(err,result){
								if(err) console.log('member update query:', err);
								if(result.affectedRows == 1){
									console.log('success');
								}
								connection.release();
							}); // query
						}); // pool
						res.json({'result' : true, 'version':up_ver, 'content' : result});	
					}catch(e){
						console.log('-------------member의 버전을 최신버전으로 수정-------------');
						res.json({'result': false, 'result_msg' : 'version modify err'});						
					}
				}
			); //async 단어list 검색
	}
}

/*


exports.update_chk = function(req, res){
	var email = req.body.email;
	var arr = [];
	var up_ver;
	async.waterfall([
		function(callback){
			db.getConnection(function(err, connection){ // 최신 ver 확인
				connection.query('select up_ver from chk_update order by up_ver desc limit 0,1',[], function(err, result){
					if(err) console.log('cur_ver err', err);
					up_ver = result[0].up_ver;
					console.log('up_ver', result[0].up_ver);
					callback(null, result[0].up_ver);
					
			});//query
		}); // pool
		},
		function(arg1, callback){
			db.getConnection(function(err, connection){ // 최신 ver 확인
				connection.query('select count(*) cnt from member where email=? and cur_ver=?',[email,arg1], function(err, result){
					if(err) console.log('cur_ver err', err);
					console.log('arg1 : ', arg1);
					console.log('result : ', result);
					callback(null, result[0].cnt);
			});//query
		}); // pool
		}
		],
		function(err, result){
			if(err) console.log('err', err);
			console.log(result);
			if(result == 0){ // 새로운 업데이트 ver 있음
				res.json({'result':true, version:up_ver});
			}
			else{
				res.json({'result':false});
			}
		} );// async
};*/