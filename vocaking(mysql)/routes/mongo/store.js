//몽고 DB 관련 설정
var mongoose = require('mongoose');
var UserSchema = require('../../models/mongodb');
//var backup = mongoose.model('backup', UserSchema);
var backupmodel = mongoose.model('Todo', UserSchema);  // todo 모델 쓰겠다.
//몽고 DB 이용한 Backup

exports.backupform = function(req,res){
	res.render('backup',{title: 'Express'});
};
exports.store = function(req, res){
  try{
    var backupmodel = mongoose.model('Todo', backup);  
    var email = req.body.email;
    console.log(email,list,word);
    backup.list = list;
    backup.word = word;
    backupmodel.find({email: email}).exec(function(err,todos){
    if(err){
      console.log('mongodb find err : ', err);
      res.json({'err':err});
      return;
    }
    console.log('mongodb find success');
    res.json({result : true, list :todos , result_msg : 'success'});
    return;
    });
  }catch(e){
    console.log('-------store err------ : ', e);
    res.json({result : false, result_msg : e});
    return;
  }
  
};
