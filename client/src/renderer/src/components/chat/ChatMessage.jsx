import React, { useState, useMemo, useRef } from "react";

export default function ChatMessage({ messages }){
	const lastDay = useRef("");
	const lastUser = useRef("");
	const lastMinute = useRef(0);
	const [editingId, setEditingId] = useState(null);
	const [editText, setEditText] = useState("");

	//TODO: Fix the edit message function
	const saveEdit = (id) => {
		const payload = {
			type: "edit_message",
			id: id,
			newText: editText
		};
		setEditingId(null); // Edit-Mode schließen
	};

	//TODO: Implement message encryption and decryption
	const processedMessages = useMemo(() => {
		lastDay.current = "";
		lastUser.current = "";
		lastMinute.current = 0;

		return messages.map((msg) => {
			const timestamp_parts = msg.timestamp.split(" ");
			
			const time = {
				day: timestamp_parts[2],
				month: timestamp_parts[1],
				year: timestamp_parts[3],
				hour: timestamp_parts[4].split(":")[0],
				minute: timestamp_parts[4].split(":")[1]
			};

			// Datums-Trenner Logik
			const showDateLine = lastDay.current !== time.day;
			if (showDateLine) lastDay.current = time.day;

			// User-Namen Logik
			let showUser = false;
			if (lastUser.current !== msg.user || Math.abs(lastMinute.current - Number(time.minute)) >= 5 || showDateLine) {
				showUser = true;
				lastUser.current = msg.user;
				lastMinute.current = Number(time.minute);
			}

			return { ...msg, time, showDateLine, showUser };
		});
	}, [messages]);
	
	return (
		<>
			{processedMessages.map((message) => (
				<div className="message-row" key={message.id}>
					{message.showDateLine && (
						<div id="dateLine">
							<small>{message.time.day} {message.time.month}. {message.time.year}</small>
						</div>
					)}
					{message.showUser ? <div className="avatar"/> : <div style={{ width: 56 }} />}

					<div className="message-content" style={{ width: '100%' }}>
					{message.showUser && (
						<div className="user-info">
							<span className="username">{message.user + ": "}</span>
							<span className="timestamp">{message.time.hour}:{message.time.minute}</span>
						</div>
					)}

					{editingId === message.id ? (
						<div className="edit-container">
							<textarea
								className="edit-input"
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										saveEdit(message.id);
									} else if (e.key === "Escape") {
										setEditingId(null);
									}
								}}
							autoFocus
						/>
							<small style={{ color: '#949ba4' }}>
								Escape zum <span style={{ color: '#00a8fc', cursor: 'pointer' }} onClick={() => setEditingId(null)}>Abbrechen</span> • 
								Enter zum <span style={{ color: '#00a8fc', cursor: 'pointer' }} onClick={() => saveEdit(message.id)}>Speichern</span>
							</small>
						</div>
					) : (
						<div className="text" onDoubleClick={() => {
							setEditingId(message.id);
							setEditText(message.text);
						}}>
							<div style={{paddingLeft: '15px' }}>
								{message.text}
							</div>
							{message.is_edited && <span style={{ fontSize: '0.6rem', color: '#949ba4', marginLeft: '4px' }}>(bearbeitet)</span>}
						</div>
					)}
					</div>
				</div>
			))}
		</>
	)
}