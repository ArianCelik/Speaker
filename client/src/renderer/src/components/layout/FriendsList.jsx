import Card from "../card/Card";
import { useAuth } from "../context/authentication/AuthProvider";
import { useSocket } from "../context/socket/SocketContext";
import { Link } from "react-router-dom";


export default function FriendsList(){
	const { user } = useAuth();
	const socket = useSocket();
	
	//let lastButtonId = null;

	function handleFriendClick(friend) {
		console.log(friend);
		socket.emit("getPrivateChatHistory", { chat_id: friend.chat_id });

		/*document.getElementById(`button-${friend.chat_id}`).disabled = true;
		if(lastButtonId !== null && lastButtonId !== `button-${friend.chat_id}`) {
			document.getElementById(lastButtonId).disabled = false;
		}
		lastButtonId = `button-${friend.chat_id}`;*/
	}

	return (
		<Card component={
			<>
				{user.friends.map(friend => 
					<div key={friend.user_id} className="mb-2">
						<Link to={`/chat/${friend.user_id}`}>
							<button 
								id={`button-${friend.chat_id}`}
								type="button"
								className="btn btn-primary w-100" 
								onClick={() => handleFriendClick(friend)}>
								{friend.nickname}
							</button>
						</Link>
					</div>
				)}
			</>
		}/>
	);
}