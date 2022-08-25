const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server);

const botName = "MoonNet Bot"

//Sets 'public' folder as the static folder
app.use(express.static(path.join(__dirname, 'public')))

//Runs when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room);

        //only shows up to the client who is connecting
        socket.emit('message2', formatMessage(botName, `Welcome to ${user.room}!`))

        //shows up to everyone but the client who is connecting
        socket.broadcast
            .to(user.room)
            .emit('message2',  formatMessage(botName, `${user.username} has joined the chat.`))
        
        
        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        //io.to(user.room).emit('message2', formatMessage(user.username, msg));
        socket.emit('message', formatMessage(user.username, msg))
        socket.broadcast.to(user.room).emit('message2', formatMessage(user.username, msg))

    })

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user) {
            io.to(user.room).emit('message2',  formatMessage(botName, `${user.username} has left the chat.`))

        }

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

})


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))