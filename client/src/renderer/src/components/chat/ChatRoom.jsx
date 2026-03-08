import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import Card from "../card/Card";
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
		socket.emit("message", payload);
	}

	//Connect to the server
	useEffect(() => {
		const socket = io("http://localhost:3000");
		setSocket(socket);

		socket.on("receive", (data) => {
			setMessages(prev => {return [...prev, data]});
			id.current++;
		});

		socket.on("history", (history) => {
			const data = history[0].messages;
			setMessages(data);
			id.current = data[data.length - 1].id;

		});

		return () => {
			socket.close();
		}
	}, []);

	return (
		<main>
			<Card component={
				<div id="messageContainer" ref={messageContainerRef}>
					<ChatMessage messages={messages} />
				</div>
			}/>
			{createPortal(
				<Card component={<ChatInput addMessage={addMessage} />}/>,
				document.getElementById("input")
			)}
		</main>	
	)
}

export default ChatRoom;