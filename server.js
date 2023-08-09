// Desc: 服务器端代码
/**
 * npm install express socket.io
 */

const express = require('express')
const app = express() //创建ap对象

// 使用http模块创建server，同时将express的app对象传递给server
const server = require('http').createServer(app)
const io = require('socket.io')(server) // 引入socket.io模块并绑定到server

// 配置静态文件目录
app.use(express.static('web'))

let users = []

// 监听客户端的连接事件
io.on('connection', socket => {
  // socket是当前连接到服务器的那个客户端
  console.log('有客户端连接到服务器--', socket.id)

  // // 不管是服务器端还是客户端都有on和emit方法，这两个方法就是socket.io的核心
  // // on方法用来监听客户端发送的消息
  // socket.on('request', data => { console.log('接收到客户端发送的消息：', data) })
  // /**
  //  * io.emit() 用来广播消息，即服务器端向所有客户端发送消息
  //  * socket.emit() 用来向客户端发送消息，只有当前客户端会收到该消息
  //  * socket.broadcast.emit() 用来向除当前客户端外的所有客户端发送消息
  //  */
  // // emit方法用来向客户端发送消息
  // socket.emit('response', '欢迎连接')

  socket.on('login', user => {
    users.push({id:socket.id,...user})  // 存储用户信息
    io.emit('join', `${user.nickName}加入了聊天室`)
    io.emit('userList', users)
  })

  socket.on('sendMsg',data => {
    data.user = users.find(u => u.id == socket.id)
    if(data.id == ''){
      // 群聊
      socket.broadcast.emit('getMsg',data)
    } else {
      // 私聊
      socket.to(data.id).emit('getMsg',data)
    }
  })

  // 监听客户端断开连接
  socket.on('disconnect', () => {
    console.log('有客户端断开连接--', socket.id)
    const idx = users.findIndex(u => u.id == socket.id)
    if(idx == -1) return
    const user = users[idx]
    users.splice(idx,1)
    io.emit('leave', `${user.nickName}离开了聊天室`)
    io.emit('userList', users)
  })
})

// 启动server并监听9000端口
server.listen(2160, () => {
  console.log('Server is run at 2160, http://127.0.0.1:2160')
})