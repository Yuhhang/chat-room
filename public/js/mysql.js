var mysql  = require('mysql');  
 
var connection = mysql.createConnection({     
  host     : 'localhost',       
  user     : 'root',              
  password : '990308',       
  port: '3306',                   
  database: 'main', 
}); 
 
connection.connect();
 
var loginSuccess = false//是否登录成功

var username_input = 'yuhang111'
var password_innput = '990308'
var lookup_usernames = 'SELECT * FROM userinfo'
//查
var query = connection.query(lookup_usernames,function (err, result) {
  if(err){
    console.log('[SELECT ERROR] - ', err.message);
    return;
  }

  console.log('--------------------------SELECT----------------------------');
  console.log(result);
  console.log('------------------------------------------------------------\n\n'); 
  for(var i = 0; i < result.length; i++){
    if(result[i].userName === username_input) {
      if(result[i].password === password_innput) {
        loginSuccess = true
        console.log('登陆成功')

      }
    } 
  }
  if(!loginSuccess) {
    // var  addSql = "INSERT INTO userinfo(userName,password) VALUES ('yuhang', '990308')";
    var  addSql = "INSERT INTO userinfo(userName,password) VALUES ('"
                + username_input + "', '" + password_innput +"')"

    //写入数据
    connection.query(addSql,function (err) {
      if(err){
      console.log('[INSERT ERROR] - ',err.message);
      return;
      } else {
        console.log('注册成功')
        connection.end();
      }
    })
  }
  connection.end();//end一定要放到里面
})




