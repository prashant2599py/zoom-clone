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
    
    
    // socket.on('join-room', (data) => {
    //     const { roomId, emailId} = data;
    //     emailToSocketMapping.set(emailId, socket.id)
    //     socketToEmailMapping.set(socket.id, emailId);

    //     // console.log(socket.id);
    //     console.log('user', emailId, 'joined room ', roomId);
    //     socket.join(roomId);
    //     socket.emit('joined-room', { roomId } )
    //     socket.broadcast.to(roomId).emit('user-joined', { emailId });
    // })
    socket.on('room:join', (data) => {
        console.log(data);
        const { email, room } = data;
        emailToSocketMapping.set(email, socket.id);
        socketToEmailMapping.set(socket.id, email);
        socket.join(room);
        socket.emit('room:joined', { room });
        socket.broadcast.to(room).emit('user:joined', { email, id: socket.id});

    })

    // socket for offer from user 1 
    socket.on('user:call', ({ to, offer}) => {
        socket.to(to).emit('incomming:call', { from : socket.id, offer }); // it emits the incomming call from user 1 to user 2
    })

    socket.on('call:accepted', ({ to, ans }) => {
        socket.to(to).emit('call:accepted', { from : socket.id, ans }); // emits the call accepted event to user 1
    })

    socket.on('peer:nego:needed', ({ to, offer}) => {
        socket.to(to).emit('peer:nego:needed', { from: socket.id, offer})
    })

    socket.on('peer:nego:done', ({ to, ans }) => {
        socket.to(to).emit('peer:nego:final', { from: socket.id, ans})
    })

    // socket.on('call-user', (data) => {
    //     const {emailId, offer} = data;
    //     const fromEmail = socketToEmailMapping.get(socket.id)
    //     const socketId = emailToSocketMapping.get(emailId)
    //     socket.to(socketId).emit('incomming-call', {from : fromEmail, offer })
    // })

    // socket.on('call-accepted', (data) => {
    //     const {emailId, ans} = data;
    //     const socketId = emailToSocketMapping.get(emailId)
    //     socket.to(socketId).emit('call-accepted', { ans })
    // })
})

app.listen(8000, () => console.log('running on port 8000'));
io.listen(8001);