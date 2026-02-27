import { Database } from "bun:sqlite";
import { join } from "path";

const dbPath = join(__dirname, "../database/chat.db");
const db = new Database(dbPath);

/*db.run(`CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY,
	user TEXT,
	text TEXT,
	timestamp TEXT
	)`);*/

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
	console.log('Client connected on ws://localhost:3000');

	const history = {
		type: "history",
		data: db.query(`SELECT id, user, text, timestamp FROM messages ORDER BY id DESC`).all()
	};
	
	if(history.data.length !== 0) {
		ws.send(JSON.stringify(history)); 
	}
	
	ws.on('message', (message) => {
		const data ={
			id: JSON.parse(message).id,
			user: JSON.parse(message).user,
			text: JSON.parse(message).text,
			timestamp: JSON.parse(message).timestamp
      	}
		const insert = db.prepare(`INSERT INTO messages (id, user, text, timestamp) VALUES (?, ?, ?, ?)`);
		insert.run(data.id, data.user, data.text, data.timestamp);
		console.log("Message: " + JSON.stringify({type: "message", data: data}));
		ws.send(JSON.stringify({type: "message", data: data}));
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});