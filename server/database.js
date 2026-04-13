import { MongoClient } from 'mongodb';
import bcrypt from "bcrypt";

export class DB {
	constructor(uri) {
		this.uri = uri;
	}
	
	async connect() {
		console.log("Connecting to MongoDB...");
		const client = new MongoClient(this.uri);
		await client.connect();
		console.log('\x1b[32m%s\x1b[0m', "Connected to MongoDB!");
		this.db = await client.db("Speaker");
	}

	async getPrivateChatHistory(chat_id) {
		console.log("Fetching messages...");
		const chatCollection = await this.db.collection("Private_Chats");
		const chat = await chatCollection.find({ chat_id }).toArray();
		console.log('\x1b[32m%s\x1b[0m', "Messages fetched.")
		return chat;
	}

	async pushPrivateMessage(chat_id, message) {
		console.log("Pushing message...");
		const chatCollection = await this.db.collection("Private_Chats");
		const chat = await chatCollection.find({ chat_id }).toArray();
		chat[0].messages.push(message);
		await chatCollection.updateOne({ chat_id }, { $set: { messages: chat[0].messages } });
		console.log('\x1b[32m%s\x1b[0m', "Message pushed.")
	}

	async createPrivateChat(chat_id){
		const chatCollection = await this.db.collection("Private_Chats");
		const chat = {
			chat_id: chat_id,
			timestamp: new Date().toString(),
			messages: []
		}
		const result = await chatCollection.insertOne(chat)
		console.log('\x1b[32m%s\x1b[0m', "Chat created.")
	}

	async createGroupChat(group_name, users){
		const chatCollection = await this.db.collection("Group_Chats");
		const chat = {
			chat_id: crypto.randomUUID(),
			timestamp: new Date().toString(),
			messages: [],
			group_name: group_name,
			users: users
		}
		const result = await chatCollection.insertOne(chat)
		await this.addToGroupChat(chat, users);
		console.log('\x1b[32m%s\x1b[0m', "Chat created.")
	}

	async addToGroupChat(group_chat, users){
		const userCollection = await this.db.collection("Users");
		const group_chat_data = {
			chat_id: group_chat.chat_id,
			group_name: group_chat.group_name,
			timestamp: group_chat.timestamp
		}
		for (const user of users) {
			const user_data = await userCollection.findOne({ user_id: user.user_id });
			user_data.chats.group_chats.push(group_chat_data);
			await userCollection.updateOne({ user_id: user_data.user_id }, { $set: { chats: user_data.chats } });
		}
	}

	async getUser(user_id) {
		const userCollection = await this.db.collection("Users");
		const user = await userCollection.findOne({ user_id });
		return user;
	}

	async createUser(username, firstname, lastname, email, password) {
		const userCollection = await this.db.collection("Users");
		const hashedpw = await bcrypt.hash(password, 15);
		const user = {
			user_id: crypto.randomUUID(),
			firstname: firstname,
			lastname: lastname,
			publicname: username,
			username: username,
			email: email,
			password: hashedpw,
			timestamp: new Date().toString(),
			chats: {
				private_chats: [],
				group_chats: []
			}
		};
		await userCollection.insertOne(user);
	}

	async addFriend(my_user_id, friend_user_id) {
		const userCollection = await this.db.collection("Users");
		const me = await this.getUser(my_user_id);
		const friend = await this.getUser(friend_user_id);

		if (!me || !friend) {
			console.error("User not found");
			return;
		}
		const chat_id = crypto.randomUUID();

		await userCollection.updateOne(
			{ user_id: friend_user_id },
			{ 
				$push: { 
					chats: {
						private_chats: {
							user_id: me.user_id, 
							publicname: me.publicname, 
							nickname: me.publicname, 
							chat_id: chat_id, 
							timestamp: new Date().toString() 
						} 
					} 
				} 
			}
		);

		await userCollection.updateOne(
			{ user_id: my_user_id },
			{ 
				$push: { 
					friends: { 
						user_id: friend.user_id, 
						publicname: friend.publicname, 
						nickname: friend.publicname, 
						chat_id: chat_id, 
						timestamp: new Date().toString() 
					} 
				} 
			}
		);
		
		await this.createChat(chat_id);

		console.log('\x1b[32m%s\x1b[0m', `Friendship created between ${me.username} and ${friend.username}`);
	}

	async getFriends(user_id) {
		const userCollection = await this.db.collection("Users");
		const user = await userCollection.findOne({ user_id });
		console.log('\x1b[32m%s\x1b[0m', `User ${user.username} friends fetched.`);
		return user.chats.private_chats;
	}

	async login(email, password){
		const userCollection = await this.db.collection("Users");
		const user = await userCollection.findOne({ email }, { projection: { _id: 0 } });

		if (!user) {
			console.error("User not found");
			return null;
		}
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			console.error("Invalid password");
			return null;
		}
		const { password: _, ...safeUser } = user;
		return safeUser;
	}
}