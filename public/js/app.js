

$(function() {
    $(window).on('resize', function() {
        var clientHeight = document.documentElement.clientHeight
        $('.app-user-list-body').height(clientHeight - 210)
        $('.app-chat-body').height(clientHeight - 97)
    }).resize()



    // 定义变量
	var nickName;
    var $appChatContent = $('.app-chat-content')
	var $elTemplate = $('#el_template')
	var $elInputMsg = $('#el_input_msg')
	var $elBtnSend = $('#el_btn_send')
	var $elBtnSendfile = $('#el_btn_sendfile')//调出发送文件控件按钮
	var $elUserList = $('#table_userlist')
	var $elBtnFileSend = $('#el_btn_file_send')//发送文件按钮
	var $elBtnFileCancel = $('#el_btn_file_cancel')//取消发送文件按钮
	var $elFileUpLoadElements = $('.app-file-container, .backup')//显示，取消文件发送控件

    var client = io.connect('http://localhost:3000', {
        reconnectionAttempts: 3, //重连次数
        reconnection: true, //是否重连
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000, 
        timeout: 2000, //超时时间
        autoConnect: true //自动连接
	})
	
	// 命名空间
	// var clientForNewNsp = io.connect('http://localhost:3000/nsp1')
	// clientForNewNsp.on('connection1', function() {
	// 	console.log('clientForNewNsp connect server succeed')
	// })

    // 工具方法
    function writeMsg(type, msg, title, isSelf) {
		title = title || (type === 'system' ? '系统消息' : 'User')
		
        var template = $elTemplate.html()
        .replace('${bgClass}', type === 'system' ? 'label-danger' : 'label-info')
        .replace('${title}', title)
		.replace('${pullRight}', isSelf ? 'pull-right' : '')
		.replace('${textRight}', isSelf ? 'text-right' : '')
        .replace('${info-icon}', type === 'system' ? 'glyphicon-info-sign' : 'glyphicon-user')
        .replace('${time}', new Date().toLocaleTimeString())
		.replace('${msg}', msg)

		$appChatContent.append($(template))
	}

	function sendMsg(msg, type) {
		var msgObj = {
			type: type || 'text',
			data: msg,
			clientId: client.id
		}
		client.emit('server.newMsg', msgObj)
	}
	
	//发送消息按钮
	$elBtnSend.on('click', function() {
		var value = $elInputMsg.val()
		if(value) {
			sendMsg(value)
			$elInputMsg.val('')
		}
	})

	//调出发送文件控件发送文件按钮
	$elBtnSendfile.on('click', function() {
		$elFileUpLoadElements.show()
	})

	//发送文件
	$elBtnFileSend.on('click', function() {
		var files = document.getElementById('el_file').files
		if(files.length === 0) {
			return window.alert("Must select a file")
		}
		var file = files[0]
		//发送文件
		client.emit('server.sendfile', {
			clientId: client.id,
			file: file,
			fileName: file.name
		})
		$elFileUpLoadElements.hide()
	})

	//取消发送文件
	$elBtnFileCancel.on('click', function() {
		$elFileUpLoadElements.hide()
	})

	//粘贴图片发送
	$(document).on('paste', function(e) {
		var originalEvent = e.originalEvent
		var items
		if(originalEvent.clipboardData && originalEvent.clipboardData.items) {
			items = originalEvent.clipboardData.items
		}
		if(items) {
			for(var i = 0, len = items.length; i < len; i ++) {
				var item = items[i]
				if(item.kind === 'file') {
					var pasteFile = item.getAsFile()
					// if(pasteFile.size > 1024 * 1024) {//文件过大则返回
					// 	return
					// }
					var reader = new FileReader()
					reader.onloadend = function() {
						var imgBase64str = reader.result
						document.getElementById('el_input_msg').value += "<img> ";
						$elBtnSend.on('click', function() {

						sendMsg(imgBase64str, 'image')
						})
					}
					//读取数据
					reader.readAsDataURL(pasteFile)
				}
			}
		}

	})




	// client.emit('server.getnickName')
	// client.on('client.getnickName', function(userName_input) {
	// 		nickName = userName_input
	// 		console.log(nickName, '用户名获取成功')
	// 		client.emit('server.online', nickName)
	// 		})

	var getUrlInfo = window.location.search//获取 href 属性中跟在问号后面的部分
	// console.log('test: ',test)
	nickName = getUrlInfo.slice(1)//去掉问号
	console.log(nickName)

	client.emit('server.online', nickName)

	$('#span_nickname').text(nickName)

	
	client.on('client.newMsg', function(msgObj) {
		if(msgObj.type === 'image') {
			msgObj.data = '<img src="' + msgObj.data + '" alt="image" >'
		}
		writeMsg('user', msgObj.data, msgObj.nickName, msgObj.clientId === client.id)
		$appChatContent[0].scrollTop = $appChatContent[0].scrollHeight
	})

    client.on('client.online', function(nickName, loginSuccess) {
		if(!loginSuccess) {
			window.location.href='./login.html'
		}
		writeMsg('system', '[' + nickName + ']上线了')
		client.emit('server.getOnlineList')
	})

	client.on('client.offline', function(nickName) {
		writeMsg('system', '[' + nickName + ']下线了')
		client.emit('server.getOnlineList')
	})

	//加入房间
	client.on('client.joinroom', function(msgObj) {
		writeMsg('user', '我加入了房间' + msgObj.roomId, msgObj.nickName)
	})

	//用户列表
	client.on('client.onlineList', function(userList) {
		 $elUserList.find('tr').not(':eq(0)').remove()
		 userList.forEach(function(userNick) {
			 var $tr = $('<tr><td>' + '<span class="glyphicon glyphicon-comment"></span>' + userNick + '</td></tr>')
			 $elUserList.append($tr)
		 })
	})

	var intervalId = setInterval(function() {
		client.emit('server.getOnlineList')
		// if(client.)如果client断开 就停止刷新在线列表
		//	clearInterval(intervalId)
	}, 1000 * 5)

	client.on('client.file', function(fileMsgObj) {
		var content = '文件: <a href="/files/' + fileMsgObj.fileName + '">' + fileMsgObj.fileName + '</a>'
		writeMsg('user', content, fileMsgObj.nickName, client.id === fileMsgObj.clientId)
	})

	client.on('err', function(err) {
		console.log(err)
	})
	client.on('connect', function() {
		console.log('connect')
	})
	client.on('disconnect', function(err) {
		console.log('disconnect', err)
	})
	client.on('reconnect', function(count) {
		console.log('reconnect', count)
	})
	client.on('reconnect_attempt', function(count) {
		console.log('reconnect', count)
	})
	client.on('reconnecting', function(count) {
		console.log('reconnecting', count)
	})
	client.on('reconnect_error', function(err) {
		console.log('reconnect_error', err)
	})
	client.on('reconnect_failed', function() {
		console.log('reconnect_failed')
	})

})



