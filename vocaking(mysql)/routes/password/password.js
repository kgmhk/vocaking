var async = require('async');
var db =require('../../models/db');
//var varrnum = require('./rnum');


//이메일 모듈 임포트
var email   = require("../../node_modules/emailjs/email");
	//이메일 설정
	var server  = email.server.connect({
	   user:    "gihyunkwak@gmail.com", 
	   password:"k2015117", 
	   host:    "smtp.gmail.com", 
	   ssl:     true

	});

/*
function set(rnum, callback){
	console.log('set fun rnum', rnum);
	this.varnum = rnum;
	callback(null, "ok");
}*/

/*
var varrnum = function(){
	var rnum;
};

varrnum.prototype = {
	set : function(rnum1){
		rnum = rnum1;
	},
	get : function(){
		return rnum;
	}
};*/

function Field(val){
    var value = val;
   
    this.getValue = function(){
        return value;
    };
   
    this.setValue = function(val){
        value = val;
    };
}


exports.passwordform = function(req, res){
	res.render('password');

};

exports.password = function(req, res){
	try{

		var email = req.body.email;
		var rnum = Math.floor(Math.random() * 1000000);
		console.log('email : ', email);
		//req.session.email = req.body.email;
		db.getConnection(function(err, connection){ //저장 된 회원인가 확인
			connection.query('select count(*) cnt, name from member where email=?',[email], function(err, result){
				if(err)
				{
					console.log('select err : ', err);
					res.json({'result':false, 'result_msg': err});
					return;
					
				} 
				if(result[0].cnt == 1){ // 저장된 회원의 이메일일 경우
					server.send({
					   text:    "비밀번호 찾기 인증키 :" + rnum, 
					   from:    "gihyun <gihyunkwak@gmail.com>", 
					   to:      result[0].name + "<"+email+">", // another <another@gmail.com> 여러명 보낼 때
					   cc:      "else <gihyunkwak@naver.com>", // 참조
					   subject: "Hello VocaKing"
					}, function(err, message) { 
						//console.log(err || message);
						if(err){
							console.log('email send err', err);
							res.json({'result': false, 'result_msg':err});
							return;
						} 
					});
					//Field.setvalue(rnum);
					console.log('rnum', rnum);
					res.json({result: true, key : rnum});
					return;
					//res.json({'result': true, 'key': rnum});
				}
				else{
					console.log('password invailed user');
					res.json({'result': false, 'result_msg': 'invailed user'});
					return;
				}
			}); //query
			connection.release();
		}); // pool
				// send the message and get a callback with an error or details of the message that was sent
	}catch(e){
		console.log('---------------password key err------------------');
		res.json({result: false, result_msg : e});
		return;
	}
};



// 인증 키 값 확인
exports.checkkey = function(req, res){


	var serverkey = Field.getValue();
	console.log('serverkey', serverkey);
	var userkey = req.body.userkey;

	console.log('serverkey : ',serverkey);

	if(serverkey == userkey){
		res.json({result : true, 'result_msg' : '인증키 확인'});
	}
	else{
		res.json({'result': false, 'result_msg': 'key_value invailed'});
	}


};

// 비밀번호 변경
exports.pwchange = function(req, res){
	var email = req.body.email;
	var pw = req.body.pw;
	console.log(email);
	db.getConnection(function(err, connection){
		connection.query('update member set pw=? where email=?',[pw,email], function(err, result){
			console.log('connection in');
			if(err){
				console.log('update err:', err);
				res.json({'result' : false, 'result_msg': err});
				return;
			}
			if(result.affectedRows == 1){
				console.log('pwchange success');
				res.json({'result':true, 'result_msg': 'pwchange success'});
				return;
			}
			else{
				console.log('pwchange fail');
				res.json({'result':false, 'result_msg': 'pwchange fail'});
				return;
			}

		}); //query
		connection.release();
	});//pool

	//res.json({'result': false});

};