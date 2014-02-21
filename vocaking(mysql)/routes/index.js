
var db =require('../models/db');

//이미지 경로 저장
if(process.env.UPLOAD_PATH == undefined){
	process.env.UPLOAD_PATH = 'public';
} // 로컬 일 경우 (경로가 지정 되어 있지 않은 경우)

//이메일 설정
var email   = require("../node_modules/emailjs/email");
var server  = email.server.connect({
   user:    "gihyunkwak@gmail.com", 
   password:"k2015117", 
   host:    "smtp.gmail.com", 
   ssl:     true

});


var path = require('path');
var fs = require('fs');
var easyimage = require('easyimage');
var async = require('async');



exports.time = function(req, res){
	var time = new Date();
	console.log('sdjfaslkf');
	db.getConnection(function(err, connection){ // email 중복확인
				connection.query('insert into time values(now())',[],function(err, result){
					if(err){
						console.log('email query err : ', err);
						res.json({'result':false, 'result_msg' : 'There is no param'})
					}else{
						res.json({'db time':result, 'js time': time});
					}
				});// email 중복 확인 query		
			}); // pool
};

exports.index = function(req, res){
	


	res.render('index', { title: 'Express' });
};

/*
exports.join = function(req, res){
	var email = req.body.email;
	var pw = req.body.pw;
	var name = req.body.name;
	var cur_ver = req.body.cur_ver;
	if(req.files.image != undefined){
		var check = 1;
		var upfile = req.files.image;
	}
	else{
		var check = 0;
	}
	

	console.log('upfile', upfile);
	console.log('email : ', email);
	async.waterfall([
		function(callback){
			db.getConnection(function(err, connection){ // email 중복확인
				connection.query('select count(*) cnt from member where email=?',[email],function(err, result){
					if(err){
						console.log('email query err : ', err);
						res.json({'result':false, 'result_msg' : 'There is no param'})
					}
					connection.release();
					console.log('wefwef', result[0].cnt);
					if(result[0].cnt == 0)
						callback(null, result[0].cnt);
					else
						res.json({'result':false, 'result_msg': 'email 중복'});
				})// email 중복 확인 query		
			}); // pool
		},
		function(emailchk ,callback){
			if(check == 0 || upfile.originalFilename == ''){
					var imagename = '';
					callback(null, imagename);
			}
			else{ //file upload
				var userpolder = path.resolve(process.env.UPLOAD_PATH, 'memberimage');
				//console.log('userpolder', userpolder);   // 예) public/hong
				if(!fs.existsSync(userpolder)){  // 폴더가 없으면
					fs.mkdirSync(userpolder); // 폴더 생성
				}
				var imagename = email + "-" + upfile.name; // 예) Tulips.jpg
				var srcpath = upfile.path; // 예) c:\\users\\유저명\\AppData\\Local\\Temp\\파일명.jpg
				var destpath = path.resolve(__dirname, '..', userpolder, imagename)  //__dirname은 index.js 가 포함되어있는 폴더
																	// pubilc/hong
				var is = fs.createReadStream(srcpath);
				var os = fs.createWriteStream(destpath);
				is.pipe(os);  // is를 os 로 pipe
				console.log('image:', imagename);
				callback(null, imagename);
			}
		}
	],function(err, result){
		db.getConnection(function(err, connection){ // insert 회원가입 
			console.log('before insert image name = ', result);
				connection.query('insert into member(email,pw,name,cur_ver,image) values(?,?,?,?,?)',[email,pw,name,cur_ver,result],function(err,result){
					if(err){
						console.log('insert err', err);
						res.json({'result': false , 'result_msg':'There is no param'})
					} 
					if(result.affectedRows == 1){
								res.json({'result':true, 'result_msg':'join success'});
					}
					else{
								res.json({'result':false, 'result_msg':'insert fail'});	
					}
					connection.release();
				}); // insert 회원 가입 query
		});// pool

		console.log('join reusult', result);
	}// function(err, result)
	);//async

};
*/

// 비동기라서 for문이 돌기전에 아래 console.log(arr) 이 출력되지 않는다.
/*
exports.main = function(req, res){
	pool.getConnection(function(err, connection){
		connection.query('select distinct(list) from ex1',[],function(err2, results2){
			if(err2) console.log('err2', err2);
			//console.log('results2: ',results2);
			var arr =[];
			for(var i=0; i<results2.length; i++){
				connection.query('select word from ex1 where list=?',[results2[i].list],function(err3, results3){
					if(err3) console.log('err2', err3);
					console.log('results3:', results3);
					arr[i] = results3;
					//res.json({results:results2});
				}); // query
			} // for
			console.log('arr', arr);
			connection.release();
			
		}); // query
	}); // pool
};*/


/*
// login 처리
// 1. id, pw 확인 2. 확인 후 email을 이용하여 리스트 json 출력
// async 모듈 사용 => waterfall & each
// 회원 테이블 : member
	
	create table member(
	email varchar(10) not null,
	pw varchar(10) not null,
	name varchar(10) not null,
	cur_ver varchar(10) not null,
	primary key(email)
	)

// 단어 리스트 테이블 : backup

	create table backup(
		id int not null Auto_Increment,
		email varchar(10) not null,
		list varchar(10) not null,
		word varchar(10) not null,
		primary key(id)
	)DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
*/
exports.loginform = function(req,res){
	res.render('login',{title: 'Express'});
};

exports.login = function(req, res){
	var email = req.body.email;
	var pw = req.body.pw;
	db.getConnection(function(err, connection){
		connection.query('select count(*) cns, name, image from member where email=? and pw=?',[email,pw],function(err,results){
			if(err){
				console.log('id,pw확인 query err', err);
				res.json({'result':false, 'result_msg': 'There is no param'})	
			} 
			
			if(results[0].cns == 1){  // id, pw 맞을 때
				//req.session.id = eamil; // session에 id 저장
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
			}

			else{ // id, pw 틀렸을 때
				res.json({'result' : false ,'result_msg': '아이디 & 비밀번호를 확인하세요.'});
			}

		}); // id, pw 확인 query
	});// id,pw 확인 pool


};




/*
// join 처리
//
*/
exports.joinform = function(req,res){
	res.render('join',{title: 'Express'});
};
/*
exports.join = function(req, res){
	
	var email = req.body.email;
	var pw = req.body.pw;
	var upfile = req.files.image;
	var username = req.body.name;
	var cur_ver = req.body.cur_ver;
	console.log(upfile);

	// 회원정보 DB저장
	pool.getConnection(function(err, connection){ // email 중복확인
		connection.query('select count(*) cnt from member where email=?',[email],function(err, result){
			if(err) console.log('email query err : ', err);
			if(result[0].cnt == 1){ //중복 email 이 있을 경우
				res.json({'result':false, 'result_msg':'email 중복'});
			}
			else{ //중복 email이 없을 경우
				if(upfile.originalFilename != ''){ //file upload
					var userpolder = path.resolve(process.env.UPLOAD_PATH, 'memberimage');
					console.log('userpolder', userpolder);   // 예) public/hong
					if(!fs.existsSync(userpolder)){  // 폴더가 없으면
						fs.mkdirSync(userpolder); // 폴더 생성
					}
					var imagename = upfile.name; // 예) Tulips.jpg
					var srcpath = upfile.path; // 예) c:\\users\\유저명\\AppData\\Local\\Temp\\파일명.jpg
					var destpath = path.resolve(__dirname, '..', userpolder, imagename)  //__dirname은 index.js 가 포함되어있는 폴더
																		// pubilc/hong
					var is = fs.createReadStream(srcpath);
					var os = fs.createWriteStream(destpath);
					is.pipe(os);  // is를 os 로 pipe
					is.on('end', function(){
					fs.unlinkSync(srcpath);
					var srcimg = destpath;
					var idx = destpath.lastIndexOf('.');  // . 뒤에 파일명을 가져온다.
					var ext = destpath.substring(idx); // .jpg 로 확장자를 얻어온다.
					var filename = destpath.substring(0, idx); 
					var destimg = filename + '-thumnail' + ext; // thumnailimage 생성
					easyimage.resize({src:srcimg, dst:destimg, width:300, height:300}, function(err, image) {
						if(err) console.log('err', err);
						console.log('image', image);
						//res.json({filename:true});
						console.log('db save image name = ', upfile.originalFilename);
						//res.json({userid:email, status:'success', image:image, filename:true});
					}); // resize
				}); // is.on
				}else{
					imagename = '';
				}
				pool.getConnection(function(err, connection){ // insert 회원가입 
					connection.query('insert into member values(?,?,?,?,?)',[email,pw,username,cur_ver,imagename],function(err,result){
						if(err) console.log('insert err', err);
					if(result.affectedRows == 1){
						res.json({'result':true, 'result_msg':'회원가입 성공'});
					}
					}); // insert 회원 가입 query
				});// pool
			}
			
			connection.release();
		})// email 중복 확인 query

	}); // pool

};*/



//테스트
/*
exports.join = function(req, res){
	var email = req.body.email;
	var pw = req.body.pw;
	var username = req.body.name;
	var cur_ver = req.body.cur_ver;
	var changeimage;
	var upfile;
	var userpolder = path.resolve(process.env.UPLOAD_PATH, 'memberimage');

	if(!fs.existsSync(userpolder)){  // 폴더가 없으면
		fs.mkdirSync(userpolder); // 폴더 생성
	}

	async.waterfall([
    	function(callback){ 
			pool.getConnection(function(err, connection){ // email 중복확인
				connection.query('select count(*) cnt from member where email=?',[email],function(err, result){
					if(err){
						console.log('email query err : ', err);
						res.json({'result':false, 'result_msg':'There is no param'});
						connection.release();

					} 
					console.log(result[0].cnt);
					if(result[0].cnt == 1){
						res.json({'result':false, 'result_msg':'email 중복'});						
					}else{
						callback(null, '');
						connection.release();
					}
				})// email 중복 확인 query
			}); // pool
		},
		function(arg1,callback){
			var imagechk;
			if(req.files.image == undefined || req.files.image == ''){
				imagechk = 0;
				console.log('image chk: ', imagechk);
				console.log('req.files.image: ', req.files.image);
			}else{
				imagechk = 1;
				console.log('imagechk: ', imagechk);
				console.log('req.files.image: ', req.files.image);
				upfile = req.files.image;
			}
			callback(null, imagechk);

		},
		function(imagechk, callback){
			if(imagechk == 1)
			{ // upload file이 있을 경우

				console.log('userpolder', userpolder);   // 예) public/hong
					var imagename = upfile.name; // 예) Tulips.jpg
					var srcpath = upfile.path; // 예) c:\\users\\유저명\\AppData\\Local\\Temp\\파일명.jpg
					var destpath = path.resolve(__dirname, '..', userpolder, imagename); //__dirname은 index.js 가 포함되어있는 폴더
					console.log('destpath:', destpath);					// pubilc/hong
					var is = fs.createReadStream(srcpath);
					var os = fs.createWriteStream(destpath);
					callback(null, is,os,srcpath,destpath,'',check,1);

			}else
			{ // uploadfile이 없을 경우
				changeimage='';
				callback(null, '','','','',changeimage,0);
			}
		},
		function(arg0, arg1, arg2, arg3, changeimage, check, callback){
			if(check == 1){

					arg0.pipe(arg1);  // is를 os 로 pipe
					arg0.on('end', function(){
						fs.unlinkSync(arg2);
						var srcimg = arg3;
						var idx = arg3.lastIndexOf('.');  // . 뒤에 파일명을 가져온다.
						var ext = arg3.substring(idx); // .jpg 로 확장자를 얻어온다.
						var filename = arg3.substring(0, idx); 
						var destimg = filename + '-' + email + ext; // thumnailimage 생성
						changeimage = email + ext;
						console.log('destimag :',destimg);
						callback(null, srcimg, destimg);
					}); // is.on
			}else{

			}

		},
		function(arg1, arg2, callback){
						easyimage.resize({src:arg1, dst:arg2, width:300, height:300}, function(err, image) {
							if(err) {
								console.log('err', err);
								res.json({'result':false, 'result_msg':'image resize fail'});
							}
								//console.log('image', image);
								//res.json({filename:true});
								console.log('db save image name = ', changeimage);
								//es.json({userid:email, status:'success', image:image, filename:true});
							}); // resize
						callback(null, changeimage);

					
    	},
    	function(arg1, callback1){ 
					console.log('function2:', arg1);
					pool.getConnection(function(err, connection){ // insert 회원가입 
					console.log('before insert image name = ', arg1);
					connection.query('insert into member(email,pw,name,cur_ver,image) values(?,?,?,?,?)',[email,pw,username,cur_ver,arg1],function(err,result){
						if(err){
							console.log('insert err', err);
							res.json({'result': false , 'result_msg':'There is no param'})

						} 
						else{
							console.log('cur_ver:',cur_ver);
							console.log('result :', result)
							callback(null, result);
						}
					}); // insert 회원 가입 query
					connection.release();
				});// pool
				
    	 }
	],function(err,result){
			if(err) console.log('err', err);
						console.log('result', result);
							if(result.affectedRows == 1){
								res.json({'result':true, 'result_msg':'join success'});
							}
							else{
								res.json({'result':false, 'result_msg':'insert fail'});	
							}
					}
	);


};*/

//join 테스트
/*
exports.join = function(req, res){
	var email = req.body.email;
	var pw = req.body.pw;
	var name = req.body.name;
	var cur_ver = req.body.cur_ver;

	res.json({'email' : email, 'pw': pw , 'name' : name, 'cur_ver': cur_ver})
}*/

/*
// update_chk
// 사용자가 사용중인 앱이 최신버젼인지 체크한다.
*/
exports.update_chkform = function(req, res){
	res.render('update_chk');
};

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
};



/*
// update 요청 시 해당 버젼에 맞는 content를 찾아서 클라이언트에 전송
*/
exports.updateform = function(req, res){
	res.render('update');
};

exports.update = function(req,res){
	var up_ver = req.body.up_ver;
	var email = req.body.email;
				async.waterfall([
						function(callback){
							
							//content 테이블에서 요구하는 버젼의 아이템을 찾는다.
							
							db.getConnection(function(err, connection){
								connection.query('select distinct(up_ver) from content where up_ver=?',[up_ver], function(err2,results2){
								connection.release();
								callback(null, results2);
								}); // query
							}); // pool
						},
						function(arg1, callback){
						
						//첫 번째에서 찾은 버젼을 이용하여 word와 mean을 뽑아 낸다.
						
						var a = 0;
						var arr = [];
						async.each(arg1, function(item, callback){
						console.log('item', item);
						db.getConnection(function(err, connection){
							connection.query('select word, mean from content where up_ver=?',[item.up_ver], function(err, results){
								if(err) {
									console.log('err', err);
								}
								else{
									console.log('query results :', results)
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
					}
					],
					function(err,result){
						if(err) console.log('err', err);
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

						res.json({'version':up_ver, 'content' : result});	

					}
				); //async 단어list 검색


}


/*
// backup 처리
// 사용자가 자신의 리스트에 단어 추가 시 backup 테이블에 list,word를 저장한다.
*/
exports.backupform = function(req,res){
	res.render('backup',{title: 'Express'});
};
exports.backup = function(req, res){
	var list = req.body.mylist;
	var email = req.body.id;
	var word = req.body.word;
	console.log(req.body.id);
	db.getConnection(function(err, connection){ // 사용자의 데이터 저장 query

		connection.query('select count(*) cnt from member where email=?',[email],function(err, result){ // 무결성 검사
			if(err) console.log('backup.select email query err:', err);
			console.log('selet count:',result);
			if(result[0].cnt == 1){ // 등록 된 유저 일 경우
				//pool.getConnection(function(err, connection){

					connection.query('insert into backup(email,list,word) values(?,?,?)',[email,list,word],function(err, results){  // DB backup
						if(err)
						{
							console.log('backup query err : ', err);
							res.json({'result':false, 'result_msg': err})
						} 
						if(results.affectedRows == 1){
							res.json({'result':true, 'result_msg': 'backup sucess'});
						}
						else{
							res.json({'result': false, 'result_msg':'backup fail'});
						}
						//res.json({'result': results});
						connection.release();
					});// backup file DB save query
				//});
			}
			else{
				res.json({'result':false, 'result_msg':'invailed user'});
			}
		}); // 등록 된 유저 확인 query

		

	});// pool
	//res.json({'result': 'success'});
};


// emailjs 모듈사용
// 이메일 인증 키 보내기
exports.passwordform = function(req, res){
	res.render('password');

};

exports.password = function(req, res){
	var email = req.body.email;
	var rnum = Math.floor(Math.random() * 1000000);
	req.session.email = req.body.email;
	console.log(rnum);
	console.log(email);
	db.getConnection(function(err, connection){ //저장 된 회원인가 확인
		connection.query('select count(*) cnt from member where email=?',[email], function(err, result){
			if(err) 
				console.log('select err : ', err);
			if(result[0].cnt == 1){ // 저장된 회원의 이메일일 경우
				server.send({
				   text:    "비밀번호 찾기 인증키 :" + rnum, 
				   from:    "gihyun <gihyunkwak@gmail.com>", 
				   to:      "hong" + "<"+email+">", // another <another@gmail.com> 여러명 보낼 때
				   cc:      "else <gihyunkwak@naver.com>", // 참조
				   subject: "Hello VocaKing"
				}, function(err, message) { 
					console.log(err || message);
					if(err){
						res.json({'result': false, 'result_msg':err});
					} 
				});
				res.render('checkkey', { title: rnum });
				//res.json({'result': true, 'key': rnum});
			}
			else{
				res.json({'result': false, 'result_msg': 'invailed user'});
			}
		}); //query
	}); // pool
	// send the message and get a callback with an error or details of the message that was sent
	
};



// 인증 키 값 확인
exports.checkkey = function(req, res){
	var serverkey = req.body.serverkey;
	var userkey = req.body.userkey;

	if(serverkey == userkey){
		res.render('pwchange',{title : 'hello'});
	}
	else{
		res.json({'result': false, 'result_msg': 'key_value invailed'});
	}


};

// 비밀번호 변경
exports.pwchange = function(req, res){
	var email = req.session.email;
	var pw = req.body.pw;
	console.log(email);
	db.getConnection(function(err, connection){
		connection.query('update member set pw=? where email=?',[pw,email], function(err, result){
			console.log('connection in');
			if(err)
				console.log('update err:', err);
			if(result.affectedRows == 1){
				res.json({'result':true, 'result_msg': 'pwchange success'});
			}
			else{
				res.json({'result':false, 'result_msg': 'pwchange fail'});
			}

		}); //query
	});//pool

	//res.json({'result': false});

};