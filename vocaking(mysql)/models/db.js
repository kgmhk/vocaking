var mysql = require('mysql');

var pool;

console.log('process.env.UPLOAD_PATH ==', process.env.UPLOAD_PATH == undefined);
if(process.env.UPLOAD_PATH == undefined){

pool = mysql.createPool({
	host: "127.0.0.1",
	user: "root",
	password: "12345",
	database: "test"
});
/*
//	waitForConnections: false,
	queueLimit : 100
	*/
}else{

pool = mysql.createPool({
	host: "192.168.8.242",
	user: "uhT9YvEa60zRP",
	password: "pNhijYZOdksGm",
	database: "dcfdf6c30b925444b8aada0d34ba71297",
	connectionLimit : 100
});

	/*

pool = mysql.createPool({
	host: "192.168.4.242",
	user: "uUm27U6BnyJgR",
	password: "1234",
	database: "d404685f6d40c41548e586498d19edbf8"
});
*/

}

exports.getConnection = function(callback){
	pool.getConnection(function(err, connection){
		if(err){
			return callback(err);
		}
		callback(err, connection);
		

	}); // pool
}