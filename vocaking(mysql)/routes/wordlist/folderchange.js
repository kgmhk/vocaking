var async = require('async');
var db =require('../../models/db');
var util = require('util');


// 사용자가 폴더 리스트 이름을 변경 할 시......

exports.folderchange = function(req, res){
	if(!req.session.email){
		res.json({'result':false , 'result_msg' : 'session fail'});
		return;
	}else{
		try{
			var email = req.session.email;
			var oldlist = req.body.oldlist;
			var newlist = req.body.newlist;
			console.log('email:', email, 'oldlist :', oldlist, 'newlist:', newlist);
			db.getConnection(function(err, connection){ 
				connection.query('update backup set list = ? where email = ? and list = ?', [newlist, email, oldlist], function(err, result){
					if(err){
						console.log('query err',err);
						res.json({result:false, result_msg : err});
						return;
					}
					console.log(result);
					if(result.affectedRows >= 1){
						console.log('update query success');
						res.json({result : true, result_msg : 'folder change success'});
						return;
					}
					else{
						console.log('update query fail');
						res.json({result : false, result_msg : 'folder change fail'});
						return;
					}
				}); // query
			}); // db
		}catch(e){
			console.log('folderchange err');
			res.json({result : false, result_msg : e});
			return;
		}
	}
}