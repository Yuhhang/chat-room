

var http = require('http')
var fs = require('fs')
var path = require('path')
var express = require('express')
var SocketIo = require('socket.io')


var roomMap = {
    'aa1': 'roomA',
    'aa2': 'roomA',
    'bb1': 'roomB',
    'bb2': 'roomB',
}

var loginSuccess = false//是否登录成功
var g_userName = 'default'     //全局用户名变量

var getRoom = (userId) => {
    return roomMap[userId] || 'default-room'
}


var app = express()
app.use(express.static(path.join(__dirname, './public')))
var server = http.Server(app)
var io = new SocketIo(server, {
    pingTimeout: 1000 * 10, //default 1000*60,超时时间
    pingInterval: 1000 * 2, //default 1000*2.5,ping的频率
    transports: ['websocket', 'polling'],
    allowUpgrades: true, //default true， 传输方式是否允许升级
    httpCompression: true, //default true, 使用加密
    //path: '/socket.io',  //提供客户端js的路径
    serveClient: false //是否提供客户端js（socket.io-client）
})

//用户认证
io.set('authorization', (handshakeData, accept) => {
    if(handshakeData.headers.cookie){
        handshakeData.headers.userId = Date.now()
        accept(null, true)        
    }else{
        accept('Authorization Error', false)        
    }

})

var getUserList = (usersMap) => {
    var userList = []
    for(let client of usersMap.values()) {
        if(client.nickName) {
            userList.push(client.nickName)
        }
    }
    return userList
}
var usersMap = new Map()

//消息广播
io.on('connection', (socket) => {
    //传输用户名
    // socket.on('server.getnickName', () => {
    //     io.emit('client.getnickName', g_userName)
    // })
    socket.on('server.online', (nickName) => {
        socket.nickName = nickName        
        //设置昵称的时候，加入房间
        //var roomId = getRoom(nickName)
        //socket.join(roomId)
        //console.log(`${nickName} 加入了房间 ${roomId}`)
        //console.log('socket.adapter.rooms')
        io.emit('client.online', nickName, loginSuccess)//先上线
        loginSuccess = false
        //socket.emit('client.joinroom', {nickName: nickName, roomId: roomId})//然后加入房间

    })
    socket.on('server.newMsg', (msgObj) => {
        msgObj.now = Date.now()
        msgObj.nickName = socket.nickName
        io.emit('client.newMsg', msgObj)
    })

    socket.on('server.getOnlineList', () => {
        socket.emit('client.onlineList', getUserList(usersMap))
    })

    socket.on('server.sendfile', (fileMsgObj) => {
        var filePath = path.resolve(__dirname, `./public/files/${fileMsgObj.fileName}`)
        fs.writeFileSync(filePath, fileMsgObj.file, 'binary')
        io.emit('client.file', {
            nickName: socket.nickName,
            now: Date.now(),
            fileName: fileMsgObj.fileName,
            clientId: fileMsgObj.clientId
        })
    })

    socket.on('disconnect', () => {
        usersMap.delete(socket.id)
        socket.broadcast.emit('client.offline', socket.nickName)
    })


    usersMap.set(socket.id, socket)
    //io.emit('online', socket.id) //广播所有客户端
    //socket.broadcast.emit('online', socket.id)//通知除自己以外的所有客户端
    for(let client of usersMap.values()) {
        if(client.id !== socket.id) {
            client.emit('online', 'Welcome')   
        }
    }
})

//创建命名空间
// var newNsp = io.of('/nsp1')
// newNsp.on('connection1', (socket) => {
//     console.log('newNsp client connected.')
// })

server.listen('3000', (err) => {
    if(err){
        return console.error(err)
    }
    console.log('Server started, listening port %s', server.address().port)
})









//登陆注册页面

// var http = require('http');
var querystring = require('querystring');
 

//解析post请求
var httpServer = http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // 解析参数
    body = querystring.parse(body);

    if(body.inputUsername && body.inputPassword) { 
        var userName_input = body.inputUsername
        var password_input = body.inputPassword

        //在数据库中查询
        var mysql  = require('mysql');  
 
        var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : 'root',              
        password : '990308',       
        port: '3306',                   
        database: 'main', 
        }); 
        
        connection.connect();
        
        var lookup_usernames = 'SELECT * FROM userinfo'

        //查
        var query = connection.query(lookup_usernames,function (err, result) {
            if(err){
              console.log('[SELECT ERROR] - ', err.message);
              connection.end()
              return;
            }  
            loginSuccess = false        
            for(var i = 0; i < result.length; i++){
                if(result[i].userName === userName_input) {
                  if(result[i].password === password_input) {
                    loginSuccess = true
                    console.log('登陆成功')
                    g_userName = userName_input//设置用户名
                    res.writeHead(301, {'Location': "http://localhost:3000" + '?' + userName_input})
                    //console.log(res._header);
                    res.end();          
                    connection.end()
                    }
                } 
            }
            if(!loginSuccess) {
                // var  addSql = "INSERT INTO userinfo(userName,password) VALUES ('yuhang', '990308')";
                var  addSql = "INSERT INTO userinfo(userName,password) VALUES ('"
                            + userName_input + "', '" + password_input +"')"
            
                //写入数据
                connection.query(addSql,function (err) {
                  if(err){
                    res.write("<script>alert('Login Fail!')</script>")
                    res.end()
                    console.log('[INSERT ERROR] - ',err.message)
                    connection.end()
                    return
                  } else {
                    console.log('注册成功')
                    res.write("<script>alert('Register Success!')</script>")
                    res.end()
                    connection.end()
                  }
                })
            }
            //connection.end();//connection.end()一定要放到里面
        })
            
    } else { 
        console.log('no data')
        res.write("<script>alert('Please input your username and password')</script>")
        res.end()
    }
  })
}).listen(3001);

console.log('httpLoginServer started, listening port %s', httpServer.address().port)

