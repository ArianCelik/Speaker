import { useState } from "react";

export default function ChatInput({ addMessage }){
	const [input, setInput] = useState("");

	function sendMessage(e) {
		e.preventDefault();

		if(input === "") return;
		addMessage(input);
		
		setInput("");
	}
	

	return (
		<>
			<form onSubmit={sendMessage} >
				<div className="input-group" id="input-area">
					{/*<input class="form-control" type="file" id="formFileDisabled"/>*/}
					<input 
						className="form-control"
						value={input} 
						onChange={e => setInput(e.target.value)} 
						type="text"
						placeholder="Write a message..."
					/>
					<button type="submit" id="sendBtn" className="btn btn-outline-secondary">Send</button>
				</div>
			</form>
		</>
	)
}