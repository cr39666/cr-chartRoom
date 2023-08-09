const socket = io('http://127.0.0.1:2160')

/**
 * 显示错误消息
 */
function error(msg) {
    document.getElementById('message-content').innerText = msg
    document.getElementById('message-error').style.display = 'block'
    setTimeout(() => {
        document.getElementById('message-error').style.display = 'none'
    }, 2000)
}

/**
 * 选择头像
 */
let avatar = ''
const imgs = document.getElementsByClassName('avatar')
for (let i = 0; i < imgs.length; i++) {
    imgs.item(i).onclick = function () {
        const active = document.querySelector('.active')
        if (active) active.className = 'avatar'
        this.className = 'avatar active'
        avatar = this.getAttribute('data-src')
    }
}

/**
 * 监听用户列表
 */
socket.on('userList', users => {
    let str = ''
    users.forEach(user => {
        str += `<li class="person" data-nick-name="${user.nickName}" data-id="${user.id}" onclick="toUser(this)">
            <img src="${user.avatar}" alt=""/>
            <span class="name">${user.nickName}</span>
        </li>`
    })
    document.getElementById('userList').innerHTML = str
})

/**
 * 加入聊天室
 */
let user = {}
document.getElementById('join-btn').onclick = () => {
    const nickName = document.getElementById('join-input').value
    if (!avatar || !nickName) return error('昵称和头像不能为空!')

    user = { nickName, avatar }
    socket.emit('login', user)
    socket.on('join', msg => {
        notify(msg)

        document.getElementById('join').style.display = 'none'
        document.getElementById('chat').style.display = 'block'
    })
}

/**
 * 提示消息
 */
function notify(msg) {
    let div = document.createElement('div')
    div.className = 'conversation-start'
    div.innerHTML = `<span>${msg}</span>`
    document.getElementById('chat-list').appendChild(div)
    scrollBottom()
}

/**
 * 点击发送消息
 */
document.getElementById('btn-send').onclick = sendMessage
document.onkeydown = event => {
    const e = event || window.e;
    const keyCode = e.keyCode || e.which;
    if (keyCode == 13) sendMessage()
}

function sendMessage() {
    const msg = document.getElementById('input-msg').value
    if (!msg) return error('不能发送空消息!')

    socket.emit('sendMsg',{msg,id:privateId})
    privateId = ''
    showMsg(msg, user, 'me')

    document.getElementById('input-msg').value = ''
}

/**
 * 监听收到消息
 */
socket.on('getMsg',data => {
    showMsg(data.msg,data.user,'you')
})

/**
 * 显示消息
 */
function showMsg(msg, userInfo, who) {
    const chatItem = document.createElement('div')
    chatItem.className = `bubble ${who}`
    chatItem.innerHTML = `
		<img src="${userInfo.avatar}" alt="" />
		<p class="username">${userInfo.nickName}</p>
		<span>${msg}</span>
	`
    document.getElementById('chat-list').appendChild(chatItem)
    scrollBottom()
}

/**
 * 点击用户私聊
 */
let privateId = ''
function toUser(dom) {
    const {nickName,id} = dom.dataset
    if (id == socket.id) return error('不能私聊自己!')
    privateId = id
    document.getElementById('input-msg').value = '@' + nickName + '：'
}

/**
 * 聊天区域滚动到底部
 */
function scrollBottom() {
    const chatList = document.getElementById('chat-list')
    chatList.scrollTop = chatList.scrollHeight
}

/**
 * 用户退出聊天室
 */
socket.on('leave', msg => {
    notify(msg)
})
