import ChatRoom from "../src/components/chat/ChatRoom";

export default function ChatPage() {
	return (
		<>
			<div id="messages"><ChatRoom/></div>
			<div id="input"></div>
		</>
	);
}
