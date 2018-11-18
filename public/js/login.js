
    
//     xmlhttp.open("GET","http://localhost:3008",true);
//     xmlhttp.send();
//     console.log(xmlhttp.onreadystatechange)
//     // if(client.)如果client断开 就停止刷新在线列表
//     //	clearInterval(intervalId)
// }, 1000 * 10)

var tempUserInput = document.getElementById("intervalGetuserName").value
console.log(tempUserInput)
// $.get('http://localhost:3008', (data) => {
//     document.write(data)
// });
var xmlhttp = new XMLHttpRequest()
xmlhttp.onreadystatechange = function () { // 状态发生变化时，函数被回调
    // if (xmlhttp.readyState === 4) { // 成功完成
    //     // 判断响应结果:
    //     if (xmlhttp.status === 200) {
    //         // 成功，通过responseText拿到响应的文本:
    //         return xmlhttp.responseText;
    //     } else {
    //         // 失败，根据响应码判断失败原因:
    //         return xmlhttp.status;
    //     }
    // } else {
    //     // HTTP请求还在继续...
    //     return('dddd')
    // }
    //document.getElementById("blank1").innerHTML=xmlhttp.responseText;
    var loginFail = document.getElementById("login_fail_bar");
    console.log(loginFail)
    loginFail.style.display = "block";
    console.log(xmlhttp.responseText)
    return xmlhttp.responseText;

}

xmlhttp.open("GET","http://localhost:3008", true, { "userName": "tempUserInput" });
xmlhttp.send("ggggggggggggg");
