import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import adapter from 'webrtc-adapter';
import io, { Socket } from 'socket.io-client';

function ChatRoom(){
	const [messages, setMessages] = useState([]);
	const [socket, setSocket] = useState(null);
	
	const id = useRef(0);
	const messageContainerRef = useRef(null);

	//Auto-scroll to the bottom of the chat
	useEffect(() => {
		if (messageContainerRef.current) {
			messageContainerRef.current.lastElementChild?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	//Add a message to the chat
	function addMessage(input){
		const payload = {
			id: messages[messages.length-1] ? messages[messages.length-1].id+1 : 1,
			user: "Me",
			text: input.valueOf(),
			timestamp: new Date().toString()
		};
		socket.emit("message", JSON.stringify({type: "message", data: payload}));
	}

	//Connect to the server
	useEffect(() => {
		const socket = io("https://localhost:3000");
		setSocket(socket);
		socket.on("receive", (data) => {
			const response = JSON.parse(data);
			if (response.type === "history") {
				const data = response.data.reverse();
				setMessages(data);
				id.current = data[data.length - 1].id;
			} else {
				setMessages(prev => {return [...prev, response.data]});
				id.current++;
			}
		});

		return () => {
			socket.close();
		}
	}, []);

	return (
		<>
			<div className="card p-1 m-1">
				<div className="card-body p-1 m-1">
					<div id="messageContainer" ref={messageContainerRef}>
						<ChatMessage messages={messages} />
					</div>
				</div>
			</div>
			{createPortal(
				<div className="card p-1 m-1">
					<div className="card-body p-1 m-1">
						<ChatInput addMessage={addMessage} />
					</div>
				</div>,
				document.getElementById("input")
			)}
		</>	
	)
}

export default ChatRoom;