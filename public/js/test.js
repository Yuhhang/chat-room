var http = require('http');
var querystring = require('querystring');
 
var loginSuccess = false

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
        
        var  sql = "SELECT password FROM userinfo WHERE userName='" + userName_input + "'";
        //查
        connection.query(sql,function (err, result) {
                if(err) {
                    return console.error(err)
                }     
                if(result[0].password === password_input) {
                    loginSuccess = true
                    console.log('登陆成功')
                    res.writeHead(301, {'Location': 'http://localhost:3000'})
                    console.log(res._header);
                    res.end();
                } else {
                    console.log('登陆失败')
                    res.write("<script>alert('Login Fail!')</script>");
                    res.end();
                }           
        });
        connection.end();
    } else { 
        console.log('no data')
        res.write("<script>alert('Please input your username and password')</script>");
        res.end();
    }
  })
}).listen(3001);

console.log('Server started, listening port %s', httpServer.address().port)

