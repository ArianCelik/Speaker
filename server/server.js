import https from "https";
import express from "express";
import { Server } from "socket.io";
import fs from "fs";
import { DB } from "./database";
import { SignJWT, jwtVerify } from "jose";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const uri = process.env.MONGODB_URI;
const jwtsecret = new TextEncoder().encode(process.env.JWT_SECRET);

const cert = fs.readFileSync('./certs/localhost.pem');
const key = fs.readFileSync('./certs/localhost-key.pem');
const server = https.createServer({key, cert}, app);


if(!process.env.MONGODB_URI) {
	console.error("Please provide a MongoDB URI");
}

const db = new DB(uri);

const io = new Server(server, { 
	cors: {
		origin: ['https://localhost:5173', 'https://localhost:5174'],
		methods: ['GET', 'POST'],
		credentials: true,
	}
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: ['https://localhost:5173', 'https://localhost:5174'],
	credentials: true,
}));

async function createAccessToken(payload) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(jwtsecret);
}

async function createRefreshToken(payload) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("30d")
		.sign(jwtsecret);
}

function getBearerToken(req) {
	const header = req.headers.authorization;
	if (!header || !header.startsWith("Bearer ")) return null;
	return header.slice(7);
}

// TODO: Implement get friends and chat ids
app.post("/auth/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await db.login(email, password);
	if (!user) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const payload = { user_id: user.user_id, email: user.email };
	const accessToken  = await createAccessToken(payload);
	const refreshToken = await createRefreshToken(payload);

	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 30 * 24 * 60 * 60 * 1000,
		path: "/auth/refresh",
	});

	res.json({ user, accessToken });
});

app.post("/auth/register", async (req, res) => {
	const { username, firstname, lastname, email, password } = req.body;
	try {
		await db.createUser(username, firstname, lastname, email, password);

		const user = await db.login(email, password);
		const payload = { user_id: user.user_id, email: user.email };
		const accessToken  = await createAccessToken(payload);
		const refreshToken = await createRefreshToken(payload);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 30 * 24 * 60 * 60 * 1000,
			path: "/auth/refresh",
		});
		res.status(201).json({ user, accessToken });
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: "Registration failed" });
	}
});

app.post("/auth/refresh", async (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		return res.status(401).json({ error: "Refresh Token not found" });
	}
	try {
		const { payload } = await jwtVerify(refreshToken, jwtsecret);
		const accessToken = await createAccessToken({
			user_id: payload.user_id,
			email:   payload.email,
		});
		res.json({ accessToken });
	} catch {
		res.clearCookie("refresh_token", { path: "/auth/refresh" });
		res.status(401).json({ error: "Refresh Token invalid - please login again" });
	}
});

app.get("/auth/me", async (req, res) => {
	const token = getBearerToken(req);
	if (!token) {
		return res.status(401).json({ error: "Not logged in" });
	}
	try {
		const { payload } = await jwtVerify(token, jwtsecret);
		const user = await db.getUser(payload.user_id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const { password: _, ...safeUser } = user;
		res.json({ user: safeUser });
	} catch {
		res.status(401).json({ error: "Access Token invalid or expired" });
	}
});

app.post("/auth/logout", (req, res) => {
	res.clearCookie("refresh_token", { path: "/auth/refresh" });
	res.json({ message: "Logged out" });
});

io.use(async (socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error("Authentication error: Token not found"));
		}
		const { payload } = await jwtVerify(token, jwtsecret);
		socket.user = payload;
		next();
	} catch (err) {
		console.error("Socket Auth Error:", err.message);
		next(new Error("Authentication error: Token invalid or expired"));
	}
});


io.on('connection', async socket => {
	console.log('\x1b[32m%s\x1b[0m', socket.id + ': has connected');	

	socket.on("getFriends", async () => {
		const friends = await db.getFriends(socket.user.user_id);
		socket.emit("friends", friends);
	});

	socket.on("addFriend", async (data) => {
		await db.addFriend(socket.user.user_id, data.friend_id);
		socket.emit("friends", await db.getFriends(socket.user.user_id));
	});

	socket.on("getPrivateChatHistory", async (data) => {
		console.log("Chat_id: " + data.chat_id);
		const chat_History = await db.getPrivateChatHistory(data.chat_id);
		const history = {chat_id: data.chat_id, messages: chat_History}
		socket.emit("privateChatHistory", history);
	});

	//Send and receive messages
	socket.on('privateChatMessage', async (data) => {
		await db.pushPrivateMessage(data.chat_id, data.message);
		io.emit('ReceivePrivateMessage', data.message);
	});	

	socket.on('disconnect', () => {
		console.log('\x1b[31m%s\x1b[0m', socket.id + ': has disconnected');
	});
});

server.listen(3000, async () => {
	console.log('\x1b[32m%s\x1b[0m', `Server is running on port ${server.address().port}`);
	await db.connect();
});

//TODO: Implement rooms, token handling