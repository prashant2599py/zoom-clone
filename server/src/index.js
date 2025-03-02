const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const app = express();;
const io = new Server({
    cors: true,
});

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping  = new Map();


io.on('connection', (socket) => {
    console.log('a user connected');
    
    
    socket.on('join-room', (data) => {
        const { roomId, emailId} = data;
        emailToSocketMapping.set(emailId, socket.id)
        socketToEmailMapping.set(socket.id, emailId);

        // console.log(socket.id);
        console.log('user', emailId, 'joined room ', roomId);
        socket.join(roomId);
        socket.emit('joined-room', { roomId } )
        socket.broadcast.to(roomId).emit('user-joined', { emailId });
    })
    socket.on('call-user', (data) => {
        const {emailId, offer} = data;
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('incomming-call', {from : fromEmail, offer })
    })

    socket.on('call-accepted', (data) => {
        const {emailId, ans} = data;
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted', { ans })
    })
})

app.listen(8000, () => console.log('running on port 8000'));
io.listen(8001);