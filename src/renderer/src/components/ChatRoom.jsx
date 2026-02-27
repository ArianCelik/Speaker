import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

function ChatRoom(){
	const [messages, setMessages] = useState([]);
	const [ws, setWs] = useState(null);

	const id = useRef(0);

	function addMessage(input){
		if (ws && ws.readyState === WebSocket.OPEN) {
		const payload = {
			id: messages[messages.length-1] ? messages[messages.length-1].id+1 : 1,
			user: "Me",
			text: input.valueOf(),
			timestamp: new Date().toString()
		};
		ws.send(JSON.stringify(payload));
		}
	}
	
	useEffect(() => {
		const socket = new WebSocket('ws://localhost:3000');
		setWs(socket);

		socket.onmessage = (event) => {
			const response = JSON.parse(event.data);
			if (response.type === "history") {
				const data = response.data.reverse();
				setMessages(data);
				id.current = data[data.length - 1].id;
			} else {
				setMessages(prev => {return [...prev, response.data]});
				id.current++;
			}
		}
		return () => {
			socket.close();
		}
	}, []);
	
	function sendMessage(e) {
		e.preventDefault();
		if (ws && ws.readyState === WebSocket.OPEN) {
		const payload = {
			id: messages[messages.length-1] ? messages[messages.length-1].id+1 : 1,
			user: "Me",
			text: input.valueOf(),
			timestamp: new Date().toString()
		};
		ws.send(JSON.stringify(payload));
		console.log("Payload: " + JSON.stringify(payload));
		setInput("");
		}
	}

	return (
		<>
			<section>
				<div class="card p-1 m-1">
					<div class="card-body p-1 m-1">
						<div id="messageContainer">
							<ChatMessage messages={messages} />
						</div>
					</div>
				</div>
			</section>
			{createPortal(
				<section>
					<div class="card p-1 m-1">
						<div class="card-body p-1 m-1">
							<ChatInput addMessage={addMessage} />
						</div>
					</div>
				</section>,
				document.getElementById("input")
			)}
		</>	
	)
}

export default ChatRoom;