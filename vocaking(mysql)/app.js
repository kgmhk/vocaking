
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

//회원가입 관련
var join = require('./routes/join/join');

//로그인 관련
var login = require('./routes/login/login');
//로그아웃 관련
var logout = require('./routes/login/logout');
//업데이트 관련
var update = require('./routes/update/update');
//단어리스트 백업 관련
var backup = require('./routes/wordlist/backup');
//단어리스트 폴더명 변경
var folderchange = require('./routes/wordlist/folderchange');
//비밀번호 찾기 관련 이메일 설정
var password = require('./routes/password/password');
//단어 복구 관련
var store = require('./routes/wordlist/store');

// Mongo DB
var mongobak = require('./routes/mongo/backup');
var mongostr = require('./routes/mongo/store');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.multipart()); // upload에 추가 된 것. 업로드 가능, req.files를 사용하기 위해 추가
app.use(app.router);

//
// cloulu network storage
// connect directory middleware 사용
//
app.use('/uploads', express.directory(path.join(__dirname, 'uploads')));  // 업로드할 폴더를 지정 클라이언트가 접속하는 URL(/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 웹에 표시할 주소??


app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

//시간 테스트
app.post('/time', routes.time);



//비밀번호 찾기위한 인증키 전송
app.get('/password', password.passwordform);
app.post('/password', password.password);
//비밀번호 변경을 위한 키 값 체크
app.post('/checkkey', password.checkkey);
//비밀번호 변경
app.post('/pwchange', password.pwchange);

//로그인
app.get('/login', login.loginform);
app.post('/login', login.login);
//로그아웃
app.post('/logout', logout.logout);
//sns 회원가입
app.post('/snslogin', login.snslogin);
//app.post('/snslogin1', login.login_facebook);




//회원가입
app.get('/join', join.joinform);
app.post('/join', join.join);

//폴더리스트 변경
app.post('/folderchange', folderchange.folderchange);


//업데이트 체크
app.get('/update_chk', update.update_chkform)
app.post('/update_chk', update.update_chk);

//업데이트
app.get('/update',update.updateform);
app.post('/update', update.update);

//리스트백업
app.get('/backup', backup.backupform);
app.post('/backup', backup.backup);

//리스트복구
//app.get('/store', store.storeform);
app.post('/store', store.store);

//mongoDB backup
app.post('/mongobak', mongobak.backup);
//mongoDB store
app.post('/mongostr', mongostr.store);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
