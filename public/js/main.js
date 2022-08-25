const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


const socket = io() //creates new connection


// Join chatroom
socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})


//Message from server
socket.on('message', message => {
    outputMessage2(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on('message2', message => {
    outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text from the form
    const msg = e.target.elements.msg.value

    //Emiting message to the server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = ""
})

//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('msg-row');
    div.innerHTML = `    
    <div class="msg-text">
        <p class="meta"><em>${message.username}</em><span><em>${message.time}</em></span></p>
        <p class="text">
            ${message.text}
        </p>
    </div>
    `
    document.querySelector('.chat-messages').appendChild(div)
}

function outputMessage2(message){
    const div = document.createElement('div');
    div.classList.add('msg-row', 'msg-row2');
    div.innerHTML = `    
    <div class="msg-text">
        <p class="meta"><em>${message.username}</em><span><em>${message.time}</em></span></p>
        <p class="text">
            ${message.text}
        </p>
    </div>
    `
    document.querySelector('.chat-messages').appendChild(div)
}

//add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('\0')}`
}

