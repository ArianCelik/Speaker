import { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import Card from "../card/Card";
import { useSocket } from '../context/socket/SocketContext';
import { useAuth } from "../context/authentication/AuthProvider";

function ChatRoom() {
	const [messages, setMessages] = useState([]);
	const { user } = useAuth();
	const socket = useSocket();
	
	const messageContainerRef = useRef(null);
	const id = useRef(0);

	//Send message
	function addMessage(input){
		const payload = {
			id: crypto.randomUUID(),
			username: user.publicname,
			text: input.valueOf(),
			timestamp: new Date().toString()
		};
		const message = {chat_id: id.current, message: payload}
		if (socket) socket.emit("privateChatMessage", message);
	}

	//Connect to the server and receive message + history from db
	useEffect(() => {
		if (!socket) return;

		socket.on("ReceivePrivateMessage", (data) => {
			setMessages(prev => {return [...prev, data]});
		});

		socket.on("privateChatHistory", (history) => {
			id.current = history.chat_id;
			if (history.messages && history.messages.length > 0) {
				const data = history.messages[0].messages;
				setMessages(data);
			}
		});

		return () => {
			socket.off("ReceivePrivateMessage");
			socket.off("privateChatHistory");
		}
	}, [socket]);

	const inputPortal = document.getElementById("input");

	return (
		<>
			<Card component={
				<div id="messageContainer" ref={messageContainerRef}>
					<ChatMessage messages={messages} />
				</div>
			}/>
			{inputPortal && createPortal(
				<Card component={<ChatInput addMessage={addMessage} />}/>,
				inputPortal
			)}
		</>	
	)
}

export default ChatRoom;