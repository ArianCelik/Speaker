import { useState, useEffect, useRef } from "react";
import data from '@emoji-mart/data';
import { SearchIndex, init } from 'emoji-mart';

export default function ChatInput({ addMessage }){
	const [input, setInput] = useState("");
	const inputRef = useRef(null);
	const [searchQuery, setSearchQuery] = useState(null); 
	const [searchResults, setSearchResults] = useState([]);
	
	useEffect(() => {
		init({ data });
	}, []);

	const handleInputChange = async (e) => {
		const val = e.target.value;
		setInput(val);

		const words = val.split(" "); 
		const lastWord = words[words.length - 1];

		if (lastWord.startsWith(":")) {
			const query = lastWord.slice(1).toLowerCase(); 
			
			const emojiList = await SearchIndex.search(query);

			setSearchQuery(query);
			setSearchResults(emojiList || []);
		} else {
			setSearchQuery(null);
			setSearchResults([]);
		}
	};

	const handleSelect = (selectedEmoji) => {
		const words = input.split(" ");
		words[words.length - 1] = `${selectedEmoji} `;

		setInput(words.join(" "));
		setSearchQuery(null);
		setSearchResults([]);

		if(inputRef.current) {
			inputRef.current.focus();
		}
	};

	function sendMessage(e) {
		e.preventDefault();

		if(input === "") return;
		addMessage(input);
		setInput("");
	};
	
	// This will focus the input when any key is pressed, but only if the input is not already focused.
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (document.activeElement === inputRef.current) return;
			if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
			if (inputRef.current) {
				inputRef.current.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
    	<div className="position-relative"> 
			{searchQuery !== null && searchResults.length > 0 && (
				<div 
					className="card position-absolute w-100" 
					style={{ bottom: "100%", left: 0, zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
				>
					<ul className="list-group list-group-flush">
						{searchResults.map(item => (
							<li 
								key={item.id} 
								className="list-group-item list-group-item-action d-flex align-items-center gap-2"
								style={{ cursor: "pointer" }}
								onClick={() => handleSelect(item.skins[0].native)}
							>
								<span style={{ fontSize: "1.2rem" }}>{item.skins[0].native}</span>
								<span className="text-muted">:{item.id}:</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<form onSubmit={sendMessage} >
				<div className="input-group">
					{/*<input class="form-control" type="file" id="formFileDisabled"/>*/}
					<input 
						ref={inputRef}
						className="form-control"
						value={input}
						onChange={handleInputChange} 
						type="text"
						placeholder="Write a message..."
					/>
					<button type="submit" className="btn btn-primary">Send</button>
				</div>
			</form>
		</div>
	)
}