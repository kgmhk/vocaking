exports.logout = function(req, res){
	req.session.email = undefined;
	res.json({result:true, 'result_msg': 'logout'});
};