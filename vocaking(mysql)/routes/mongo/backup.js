//몽고 DB 관련 설정
var async = require('async');
var mongoose = require('mongoose');
var backup = require('../../models/mongodb');
var backupmodel = mongoose.model('Todo', backup);  // todo 모델 쓰겠다.

/*
var util = require('util');
var upfile = req.files.POPOL_PIC;
 
if(util.isArray(upfile)){
    for(var i = 0; i < upfile.length; i++){
      console.log("pofol_file", upfile[i]);
}
}else{    
    console.log("pofol_file", upfile);
}*/


//몽고 DB 이용한 Backup
exports.backupform = function(req,res){
	res.render('backup',{title: 'Express'});
};
exports.backup = function(req, res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
		return;
	}else{
		try{

			var email = req.session.email;
			var list = req.body.mylist;
			var saveword = req.body.word;
			var savemean = req.body.mean
			console.log('email' , email);
			console.log('list' ,saveword);
		}catch(e){
			console.log('-----------------backup param Err-------------------');
			res.json({result : true, result_msg : 'There is no param'});
			return;
		}
		async.waterfall([
			function(callback){
				try{

					backupmodel.find({email:email, list:list},function(err, result){ //저장된 사용자 인가 찾는다.
						if(err) console.log(err);
						//console.log('find count', count);
						console.log('result123 : ', result);
						if(result.length == 0){            // 저장된 사용자가 아닐 경우 새로 저장
							var b = new backupmodel();
							console.log('if : ');
							b.email = email;
							b.list = list;
							b.word = saveword;
							b.mean = savemean;
							console.log('b', b);
							b.save(function(err, result, count){
								if(err){
									console.log('save err : ', err);
									res.json({'result' :false, 'result_msg':err});
								}
								console.log('todo :', result, 'count :', count);
								mongoose.disconnect(function(err) {
		  							if (err) throw err;
		  								console.log('disconnected');
								});
								res.json({'result':true, 'result_msg' : 'backup success'});
							}); // backup.save
							//console.log('1');
						}
						else{				
							callback(null , result)
							console.log('2',email,saveword);
						}
					//res.json({'result':result});
					});
				}catch(e){
					console.log('-----------backup waterfall-1 err-----------------');
					res.json({result : false, result_msg : e});
					return;
				}
		}
		], function(err, result){
			try{

				console.log('waterfall : ', result[0]._id);
				backupmodel.update({_id : result[0]._id}, {$pushAll :{word: saveword, mean : savemean}}, { upsert : true }, function(err, update){
						if(err){
							console.log('update err', err);
							res.json({'result' : false, 'result_msg' : err})
							return;
						} 
						console.log('update', update);
						console.log('result[0] :', result[0]);
						res.json({'result': true, 'result_msg' : 'backup success'});
						return;
				});
			}catch(e){
				console.log('--------backup waterfall-2 err-----------------');
				res.json({result : false , result_msg : e});
				return;
			}
		});
	}



	/*backupmodel.findOneAndUpdate({email:email}, {'$push':{word:word}}, function(err,result){
		if(err)
			console.log('err', err);
		console.log(result);
		res.json({'result': result});
	});*/
	//var a = backupmodel;

	//backupmodel.update({email:email}, {$set:{list:list, word:word}});
  	
};
