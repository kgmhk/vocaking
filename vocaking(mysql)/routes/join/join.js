var easyimage = require('easyimage');
var async = require('async');
var db =require('../../models/db');
var path = require('path');
var fs = require('fs');

exports.joinform = function(req,res){
	res.render('join',{title: 'Express'});
};


/* trigger 사용
// delimiter |
//	create trigger update_ver after insert on member
//	for each row begin
//		insert into memupdate set email = new.email , up_ver = new.cur_ver;
//	end;
//	|
*/

exports.join = function(req, res){
	try{
		var email = req.body.email;
		var pw = req.body.pw;
		var name = req.body.name;
		var cur_ver = req.body.cur_ver;
		var hasimage = req.body.hasimage;
		if(hasimage == "true"){
			var check = 1;
			var upfile = req.files.image;
					console.log('email : ', email, 'pw : ', pw , 'name :', name, 'cur_ver:', cur_ver, 'hasimage : ', hasimage, 'image:', 'hasimage' + upfile);
		}
		else{
		console.log('email : ', email, 'pw : ', pw , 'name :', name, 'cur_ver:', cur_ver, 'hasimage : ', hasimage);
			var check = 0;
		}
	}catch(e){
		res.json({result : false, result_msg : "join param" + e});
		console.log('--------params err-----------');
		return;
	}
	

	async.waterfall([
		function(callback){
			try{
				db.getConnection(function(err, connection){ // email 중복확인
					connection.query('select count(*) cnt from member where email=?',[email],function(err, result){
						if(err){
							console.log('email query err : ', err);
							res.json({'result':false, 'result_msg' : 'There is no param'})
							return;
						}
						connection.release();
						console.log('wefwef', result[0].cnt);
						if(result[0].cnt == 0)
							callback(null, result[0].cnt);
						else
							res.json({'result':false, 'result_msg': 'email 중복'});
							return;
					})// email 중복 확인 query		
				}); // pool
			}catch(e){
				console.log('-----------join  email 중복 체크 err----------');
			}
		},
		function(emailchk ,callback){
			try{
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
			}catch(e){
				console.log('------------image 생성 err--------------');
			}
		}
	],function(err, result){
		try{

		db.getConnection(function(err, connection){ // insert 회원가입 
			console.log('before insert image name = ', result);
				//connection.query('insert into member(email,pw,name,cur_ver,image) values(?,?,?,?,?)',[email,pw,name,cur_ver,result],function(err,result){
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
		}catch(e){
			console.log('---------------join insert err--------------');
		}
	}// function(err, result)
	);//async
};