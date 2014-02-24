var async = require('async');
var db =require('../../models/db');

exports.store = function(req, res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
	}else{
		try{
			var email = req.session.email;
			db.getConnection(function(err, connection){
				connection.query('select count(*) cns, name, image from member where email=?',[email],function(err,results){
					if(err){
						console.log('id,pw확인 query err', err);
						res.json({'result':false, 'result_msg': 'There is no param'})	
					} 
					if(results[0].cns == 1){  // id 맞을 때
						//req.session.id = eamil; // session에 id 저장
						async.waterfall([
								function(callback){
									try{
										//첫 번째 쿼리에서 list를 찾는다.
										//select distinct(list) from ex1 order by list
										db.getConnection(function(err, connection){
											connection.query('select distinct(list) from backup where email=?',[email], function(err2,results2){
											connection.release();
											callback(null, results2);
											}); // query
										}); // pool
									}catch(e){
										console.log('-------------store waterfall first err-----------------');
										res.json({'result': false, 'result_msg': 'store waterfall 1 err'});
									}
								},
								function(arg1, callback){
									try{
										//첫 번째에서 찾은 list를 이용하여 word를 찾는다.
										//select word from ex1 where list='list1' order by word
										
										//console.log('arg1 : ', arg1);
										var a = 0;
										var arr = [];
										async.each(arg1, function(item, callback){
											console.log('item', item);
											db.getConnection(function(err, connection){
												connection.query('select word, mean from backup where list=? and email=?',[item.list, email], function(err, results){
													if(err) {
														console('err', err);
													}
													else{
														console.log('query results :', results)
														var words = [];
														var means = [];
														for(var i=0; i<results.length; i++){
															console.log('results.word', results[i].word);
											 				words[i] = results[i].word;
											 				means[i] = results[i].mean;
														};// for
														arr[a] = {'list':item.list, words:words, means : means};
														a++;
														callback();
													}// else
												}); //query
											}); // pool
										}, function(err){ // each 작업 완료
											if(err) console.log('err', err);
											console.log('each 결과 arr=', arr);
											callback(null, arr);
										}); // each
									}catch(e){
										console.log('-------------store waterfall second err-----------------');
										res.json({'result': false, 'result_msg': 'store waterfall 2 err'});									
									}
							}
							],
							function(err,result){
								try{
									if(err) console.log('err', err);
									console.log('result', result);
									if(results[0].image == null || results[0].image == ''){
										res.json({'result' : true, 'vocabulary' : result});
									}
									else{
									res.json({'result':true, 'vocabulary' : result});	
									}
								}catch(e){
									console.log('-------------store waterfall third err-----------------');
									res.json({'result': false, 'result_msg': 'store waterfall 3 err'});								
								}

							}
						); //async 단어list 검색
					}

					else{ // id, pw 틀렸을 때
						res.json({'result' : false ,'result_msg': '등록되지 않은 사용자 입니다.'});
					}
				}); // id, pw 확인 query
			});// id,pw 확인 pool
		}catch(e){
			console.log('----------store err------------ :', e);
			res.json({result : true, result_msg : e});
			return;
		}
	}

};