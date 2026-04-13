import Card from "../card/Card";
import { useAuth } from "../context/authentication/AuthProvider";
import { useSocket } from "../context/socket/SocketContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


export default function ChatList(){
	const { user } = useAuth();
	const socket = useSocket();
	const [chats, setChats] = useState([]);
	
	console.log("User: " + user);

	//let lastButtonId = null;

	function handleChatOpen(chat) {
		console.log(chat);
		socket.emit("getPrivateChatHistory", { chat_id: chat.chat_id });

		/*document.getElementById(`button-${friend.chat_id}`).disabled = true;
		if(lastButtonId !== null && lastButtonId !== `button-${friend.chat_id}`) {
			document.getElementById(lastButtonId).disabled = false;
		}
		lastButtonId = `button-${friend.chat_id}`;*/
	}

	useEffect(() => {
		getChats();
	}, [user.chats]);
	

	function getChats() {
		const private_chats = user?.chats?.private_chats || [];
		const group_chats = user?.chats?.group_chats || [];
		setChats([...private_chats, ...group_chats]);
	}

	return (
		<Card component={
			<>	
				{chats.map((chat) => 
					<div className="mb-2" key={chat.chat_id}>
						<Link to={`/chat/${chat.chat_id}`}>
							<button 
								id={`button-${chat.chat_id}`}
								type="button"
								className="btn btn-primary w-100" 
								onClick={() => handleChatOpen(chat)}>
								{chat.nickname || chat.group_name}
							</button>
						</Link>
					</div>
				)}
			</>
		}/>
	);
}