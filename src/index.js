const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)   // Creating raw http server out of express server
const io = socketio(server)     

const publicDirPath = path.join(__dirname + "/../public")
const PORT = process.env.PORT || 3000

app.use(express.static(publicDirPath))

io.on("connection", (socket) => {
    console.log("New connection request !")

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})

        if(error)
            return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage("Admin", `Welcome ${user.username} in ${user.room} room` ))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined !`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message))
            return callback("Profanity is not allowed !")

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (loc, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, loc))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left !`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})