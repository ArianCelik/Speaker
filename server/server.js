const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const mongoose = require('mongoose');

const cert = fs.readFileSync('./certs/localhost.pem');
const key = fs.readFileSync('./certs/localhost-key.pem');
const secureExpressServer = https.createServer({key, cert}, app);

function connectToDatabase() {
	let db_username = prompt('Enter database username: ');
	let db_password = prompt('Enter database password: ');
	mongoose.connect(`mongodb+srv://${db_username}:${db_password}@speaker.x6lt817.mongodb.net/Speaker`);

	const db = mongoose.connection;
	db.on('connected', () => {
		console.log('Database connected');
	});
	db.on('error', console.error.bind(console, 'connection error: '));
}

const io = socketio(secureExpressServer, { 
	cors: {
		origin: 'https://localhost:5173',
		methods: ['GET', 'POST']
	}
});

io.on('connection', socket => {
	console.log(socket.id + ': has connected');

	socket.on('message', (data) => {
		io.emit('receive', data);
	});	

	socket.on('disconnect', () => {
		console.log(socket.id + ': has disconnected');
	});
});

secureExpressServer.listen(3000, () => {
	console.log(`Server is running on port ${secureExpressServer.address().port}`);
});

connectToDatabase();
//TODO: Implement rooms, token handeling