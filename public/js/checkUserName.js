var http = require('http')

var httpServer = http.createServer( (req, res) => {
    // res.writeHead(200)
    console.log(req)
    res.setHeader("Access-Control-Allow-Origin", "*");
    

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
    
    var lookup_usernames = 'SELECT userName FROM userinfo'
    //查
    var query = connection.query(lookup_usernames,function (err, result) {
    if(err){
        console.log('[SELECT ERROR] - ', err.message);
        return;
    }

    })


    res.write('<script>var myDiv = document.getElementById(\"login_fail_bar\")myDiv.style.display = \"\";</script>')
    console.log('send')
    res.end()
}).listen(3008)

console.log('Check Username Server started, listening port %s', httpServer.address().port)




