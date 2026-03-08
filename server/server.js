import { MongoClient } from 'mongodb';

const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');

//const cert = fs.readFileSync('./certs/localhost.pem');
//const key = fs.readFileSync('./certs/localhost-key.pem');
const server = http.Server(app);

const uri = process.env.MONGODB_URI;

if(!process.env.MONGODB_URI) {
	console.error("Please provide a MongoDB URI");
}
let db;

async function connectToDatabase() {
	console.log("Connceting to MongoDB...");
	const client = new MongoClient(uri);
	await client.connect();
	console.log("Connected to MongoDB!");
	db = client.db("Speaker");
}

async function getChatHistory(chat_id) {
	console.log("Fetching messages...");
	const messagesCollection = await db.collection("Messages");
	const messages = await messagesCollection.find({ chat_id }).toArray();
	console.log("Length: " + messages[0].messages.length);
	messages[0].messages.forEach(msg => {
		console.log(msg);
	});
	return messages;
}

async function setMessage(chat_id, message) {
	const messagesCollection = await db.collection("Messages");
	const messages = await messagesCollection.find({ chat_id }).toArray();
	console.log("Message: " + message);
	messages[0].messages.push(message);
	await messagesCollection.updateOne({ chat_id }, { $set: { messages: messages[0].messages } });
}

const io = socketio(server, { 
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST']
	}
});

io.on('connection', async socket => {
	console.log(socket.id + ': has connected');
	const chat_History = await getChatHistory(1);
	
	io.emit("history", chat_History);

	socket.on('message', (data) => {
		setMessage(1, data);
		io.emit('receive', data);
	});	

	socket.on('disconnect', () => {
		console.log(socket.id + ': has disconnected');
	});
});

server.listen(3000, async () => {
	console.log(`Server is running on port ${server.address().port}`);
	await connectToDatabase();
});

//TODO: Implement rooms, token handeling