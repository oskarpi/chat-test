const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const {use} = require('express/lib/router');
const io = new Server(server);
let users = [];


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.join('Living room');
  socket.on('add user', (obj)=>{
    users.push({nickname: obj.nickname, room: obj.room, socketId: socket.id});
    io.emit('add user', users);
  });
  socket.on('server message', (obj) => {
    io.to(Array.from(socket.rooms)[0]).emit('server message', obj);
  });

  socket.on('change nickname', (obj) =>{
    users = users.filter( user => user.socketId !== socket.id);
    users.push({nickname: obj.nickname, room: obj.room, socketId: socket.id});
    io.emit('add user', users);
  })

  socket.on('goToRoom', (obj) => {
    socket.leave(obj.prevRoom);
    socket.join(obj.room);
    io.emit('goToRoom', obj);
  })
  socket.on('chat message', (obj) => {
    io.to(obj.room).emit('chat message', obj);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users = users.filter( user => user.socketId !== socket.id);
    io.emit('add user', users);
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});
