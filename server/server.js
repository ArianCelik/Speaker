//import clientPromise from './db.js';

const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');

//const cert = fs.readFileSync('./certs/localhost.pem');
//const key = fs.readFileSync('./certs/localhost-key.pem');
const server = http.Server(app);

//const client = await clientPromise;
//const db = client.db("Speaker");
//const collection = db.collection("messages");

const io = socketio(server, { 
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST']
	}
});

io.on('connection', socket => {
	console.log(socket.id + ': has connected');

	socket.on('message', (data) => {
		//collection.insertOne(data);
		io.emit('receive', data);
	});	

	socket.on('disconnect', () => {
		console.log(socket.id + ': has disconnected');
	});
});

server.listen(3000, () => {
	console.log(`Server is running on port ${server.address().port}`);
});
//TODO: Implement rooms, token handeling