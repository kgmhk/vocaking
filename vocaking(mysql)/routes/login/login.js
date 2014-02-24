var async = require('async');
var db =require('../../models/db');
var request = require('request');

exports.loginform = function(req,res){
	res.render('login',{title: 'Express'});
};

exports.login = function(req, res){
	//세션에 저장된 사용자인지 확인
	if(!req.session.email){
		req.session.name = undefined;
		req.session.image = undefined;
		req.session.email = req.body.email;

		var email = req.session.email;
		var pw = req.body.pw;
		db.getConnection(function(err, connection){
			try{
				connection.query('select count(*) cns, name, image from member where email=? and pw=?',[email,pw],function(err,results){
					if(err){
						console.log('id,pw확인 query err', err);
						req.session.email = undefined;
						req.session.image = undefined;
						res.json({'result':false, 'result_msg': 'There is no param'});
						return;	
					} 
					
					if(results[0].cns == 1){  // id, pw 맞을 때
						//req.session.id = eamil; // session에 id 저장
						req.session.name = results[0].name;
						req.session.image = results[0].image;
						res.json({'result':true, 'name' : results[0].name , 'image': 'http://vocaking.gihyunkwak.cloulu.com/uploads/memberimage/' + results[0].image});
					}

					else{ // id, pw 틀렸을 때
						req.session.email = undefined;
						req.session.image = undefined;
						res.json({'result' : false ,'result_msg': '아이디 & 비밀번호를 확인하세요.'});
					}
				}); // id, pw 확인 query
			}catch(e){
				console.log('--------------login query err-------------');
				req.session.email = undefined;
				res.json({result: false, result_msg: 'login err'});
			}
		});// id,pw 확인 pool
	}else{
		res.json({'result':true , 'name' : req.session.name , 'image': 'http://vocaking.gihyunkwak.cloulu.com/uploads/memberimage/' + req.session.image ,'result_msg' : 'Welcom VocaKing'})
	}	

};

exports.snslogin = function(req, res){

	try{
		console.log('session email',req.session.email);
		console.log('token',req.body.facebook_token);
		console.log('id',req.body.id);
		console.log('name',req.body.name);
		if(!req.session.email){

			try{
				req.session.name = undefined;
				req.session.image = undefined;
			    var access_token = req.body.facebook_token; //액세스 토큰을 얻음
			    console.log('client token',req.body.facebook_token);
			}catch(e){
				console.log('FIELD TRANSFER FAIL', e);
			    res.json({result : "FAIL", resultMsg : e});
			    return;
			}
			
			async.waterfall([
				function(callback){
					try{
						console.log('access_token', access_token);
						var snsquery = 'me?fields=id,name,picture.height(250)&access_token=' + access_token; //id, email, 프로필 사진, 이름

						//Graph API에 쿼리를 날려서 가져온 페이스북 id로 기존 회원인지 확인
						request({method: 'GET', uri: 'https://graph.facebook.com/' + snsquery},
							function (error, response, body) {
						      if(error){
						        console.log('facebook Graph API request 에러', error);
						        res.json({result : "FAIL", resultMsg : error});
						        return;
						      } else {
						         var facebookInfo = JSON.parse(body); //페이스북 응답 파싱
						         console.log('facebook인포',facebookInfo.id);
						         callback(null, facebookInfo);
						      } // end of if(error)
						    } // end of function (error, response, body)
						); // end of request
					}catch(e){
						console.log('access_token err', e);
						res.json({result:false, result_msg: 'access_token Err'});
						return;	
					}
				}
			],function(err, result){
					console.log('facebook id: ', result.id, 'client id:', req.body.id);
					if(result.id == req.body.id){
						try{
						req.session.email = req.body.id;
						var email = req.session.email;
						var name = req.body.name;
						var cur_ver = '';

						req.session.name = result.name;
						
						req.session.image = result.picture.data.url;
						
						console.log('param input');
						}catch(e){
							console.log('-----waterfall 2 err--------- :', e);
							res.json({result: false , result_msg: 'param Err' + e});
							return;
						}

						try{
							console.log('select in');
							db.getConnection(function(err, connection){ // email 중복확인
								connection.query('select count(*) cnt from member where email=?',[email],function(err, resultsel){
									if(err){
										console.log('email query err : ', err);
										res.json({'result':false, 'result_msg' : 'There is no param'});
									}
									console.log('wefwef', resultsel[0].cnt);
									if(resultsel[0].cnt == 0){// 중복 email 이 없을 경우
										try{
											console.log('before insert image name = ', result);
											db.getConnection(function(err, connection){ // insert 회원가입 
												connection.query('insert into member(email,pw,name,cur_ver) values(?,"facebook",?,?)',[email,name,cur_ver],function(err,resultin){
													if(err){
														console.log('insert err', err);
														req.session.email = undefined;
														req.session.image = undefined;
														res.json({'result': false , 'result_msg':'There is no param'})
														return;
													} 
													if(resultin.affectedRows == 1){
														
														res.json({'result':true , 'name' : req.session.name , 'image': req.session.image ,'result_msg' : 'Welcom VocaKing'});
													}
													else{
														req.session.email = undefined;
														req.session.image = undefined;
														res.json({'result':false, 'result_msg':'insert fail'});	
													}
													connection.release();
												}); // insert 회원 가입 query
											});// pool

											console.log('join reusult', result);
										}catch(e){
											console.log('---------------join insert err--------------');
											res.json({result:false , result_msg : 'insert Err' +e});
											return;
										}
									}  
									else{
										console.log('111');
										//req.session.email = undefined;
										res.json({'result':true , 'name' : req.session.name, 'image': req.session.image ,'result_msg' : 'Welcom VocaKing'});
										return;
										//res.json({'result':false, 'result_msg': '세션 생성 실패'});
									}
								})// email 중복 확인 query		
									connection.release();
							}); // pool
						}catch(e){
							console.log('-----------join  email 중복 체크 err----------');
							res.json({result:false, result_msg: '요기??' + e});
							return; 
						}
					}
					else{
						console.log('not match client id & facebook id');
						res.json({'result': false, 'result_msg': '잘못된 접근'});
						return;
					}
				});  
		}else{
			console.log('session ok');
			//res.json({'result':true , 'name' : req.session.name , 'image': 'http://vocaking.gihyunkwak.cloulu.com/uploads/memberimage/' + req.session.image ,'result_msg' : 'Welcom VocaKing'});
					res.json({'result':true , 'name' : req.session.name , 'image': req.session.image ,'result_msg' : 'Welcom VocaKing'});
					return;

		}
	}catch(e){
		console.log('all' , e);
		res.json({result : false , result_msg : '여기??' + e});
		return;
	}

}



/*
 * 페이스북 로그인
 */
 /*
exports.login_facebook = function(req, res){
  try{
    var access_token = req.body.FACEBOOK_TOKEN; //액세스 토큰을 얻음
  }catch(e){
    console.log('FIELD TRANSFER FAIL', e);
    res.json({result : "FAIL", resultMsg : e});
    return;
  }
  
  console.log('access_token', access_token);
  var query = 'me?fields=id&access_token=' + access_token; //id, email, 프로필 사진, 이름

  //Graph API에 쿼리를 날려서 가져온 페이스북 id로 기존 회원인지 확인
  request({method: 'GET', uri: 'https://graph.facebook.com/' + query},
    function (error, response, body) {
      if(error){
        console.log('facebook Graph API request 에러', error);
        res.json({result : "FAIL", resultMsg : error});
        return;
      } else {
         var facebookInfo = JSON.parse(body); //페이스북 응답 파싱
         console.log(facebookInfo.id);
      } // end of if(error)
    } // end of function (error, response, body)
  ); // end of request
}; // end of login_facebook
*/




/*
async.waterfall([
						function(callback){
							
							//첫 번째 쿼리에서 list를 찾는다.
							//select distinct(list) from ex1 order by list
							
							db.getConnection(function(err, connection){
								connection.query('select distinct(list) from backup where email=?',[email], function(err2,results2){
								connection.release();
								callback(null, results2);
								}); // query
							}); // pool
						},
						function(arg1, callback){
						
						//첫 번째에서 찾은 list를 이용하여 word를 찾는다.
						//select word from ex1 where list='list1' order by word
						
						//console.log('arg1 : ', arg1);
						var a = 0;
						var arr = [];
						async.each(arg1, function(item, callback){
						console.log('item', item);
						db.getConnection(function(err, connection){
							connection.query('select word from backup where list=? and email=?',[item.list, email], function(err, results){
								if(err) {
									console('err', err);
								}
								else{
									console.log('query results :', results)
									var words = [];
									for(var i=0; i<results.length; i++){
										console.log('results.word', results[i].word);
						 				words[i] = results[i].word;
									};// for
									arr[a] = {'list':item.list, words:words};
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
					}
					],
					function(err,result){
						if(err) console.log('err', err);
						console.log('result', result);
						if(results[0].image == null || results[0].image == ''){
							res.json({'result' : true, 'name' : results[0].name , 'image': '', 'vocabulary' : result});
						}
						else{
						res.json({'result':true, 'name' : results[0].name , 'image': 'http://vocaking.gihyunkwak.cloulu.com/uploads/memberimage/' + results[0].image, 'vocabulary' : result});	
						}

					}
				); //async 단어list 검색

				*/