var mongoose = require('mongoose');

//몽고 DB 관련 설정
var db = mongoose.connect('mongodb://localhost/backup');
var Schema = mongoose.Schema;
var backup = new Schema({
	email: String,
	list: String,
	//word : String,
	//mean : String
	word: { type: [String], unique : false},
	mean: { type : [String], unique : false}
});


module.exports = backup;