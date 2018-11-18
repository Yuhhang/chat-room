
var mysql  = require('mysql');  
 
var connection = mysql.createConnection({     
  host     : 'localhost',       
  user     : 'root',              
  password : '990308',       
  port: '3306',                   
  database: 'main', 
}); 
 
connection.connect();
 
var username_input = '111'
var password_innput = '222'
var  addSql = "INSERT INTO userinfo(userName,password) VALUES ('"
+ username_input + "', '" + password_innput +"')"

//写入数据
connection.query(addSql,function (err, result) {
if(err){
console.log('[INSERT ERROR] - ',err.message);
return;
} else {
    console.log('注册成功')      

}
})

connection.end()