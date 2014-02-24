exports.logoutform = function(req,res){
	res.redirect('/logout');
	return;
};

exports.logout = function(req, res){
	req.session.email = undefined;
	console.log('logout success');
	res.json({result:true, 'result_msg': 'logout'});
	res.redirect('/login');
};