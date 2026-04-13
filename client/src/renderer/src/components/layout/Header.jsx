import { Link } from "react-router-dom";
import { useAuth } from "../context/authentication/AuthProvider";
import headset from "../../../../../resources/headset.png";
import Card from "../card/Card";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSocket } from "../context/socket/SocketContext";


export default function Header(){
	const { user, logout } = useAuth();
	const [showCreateGroup, setShowCreateGroup] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [groupUsers, setGroupUsers] = useState([]);
	const [nameError, setNameError] = useState(false);

	const socket = useSocket();

	function handleShowCreateGroup(){
		setShowCreateGroup(!showCreateGroup);
		setGroupName("");
		setGroupUsers([]);
		setNameError(false);
	}

	function handleCreateGroup(){
		if (!groupName.trim()) {
			setNameError(true);
			return;
		}

		const finalGroupUsers = [...groupUsers, user].map(u => ({
			user_id: u.user_id,
			publicname: u.publicname,
			nickname: u.nickname,
			timestamp: u.timestamp
		}));

		socket.emit("createGroup", {
			groupName: groupName,
			groupUsers: finalGroupUsers,
		});

		setShowCreateGroup(false);
		setGroupName("");
		setGroupUsers([]);
		setNameError(false);
	}

	return (
		<div className="header-container">
			<div id="home-button">
				<Link to="/"><img src={headset} alt="headset" width="20" height="20" /></Link>
			</div>
			<div id="user-search">
				<form>
					<input type="search" placeholder="Find Friends" />
				</form>
			</div>
			<div>
				<button onClick={() => {handleShowCreateGroup();}}>Create Group</button>
			</div>
			<div id="logout">
				<button onClick={() => {logout();}}>Logout</button>
			</div>

			{showCreateGroup && createPortal(
				<div className="custom-modal-overlay" onClick={() => setShowCreateGroup(false)}>
					<div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
						<Card component={
							<div className="rounded text-dark d-flex" style={{ minWidth: groupUsers.length > 0 ? '550px' : '350px' }}>
								{groupUsers.length > 0 && (
									<div className="p-3 border-end rounded-start" style={{ width: '180px', minHeight: '300px' }}>
										<h6 className="mb-3 text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Members</h6>
										<div className="d-flex flex-column gap-2">
											{groupUsers.map((selectedUser) => (
												<div key={selectedUser.user_id} className="badge bg-primary d-flex justify-content-between align-items-center p-2 text-start">
													<span className="text-truncate" style={{ maxWidth: '110px' }}>{selectedUser.publicname}</span>
													<button 
														type="button" 
														className="btn-close btn-close-white ms-2" 
														style={{ fontSize: '0.5rem' }}
														onClick={() => setGroupUsers(groupUsers.filter(u => u.user_id !== selectedUser.user_id))}
													></button>
												</div>
											))}
										</div>
									</div>
								)}

								<div className="p-3 flex-grow-1">
									<div className="d-flex justify-content-between align-items-center mb-4">
										<h5 className="m-0">Create Group</h5>
										<button type="button" className="btn-close" onClick={() => setShowCreateGroup(false)} aria-label="Close"></button>
									</div>
									<div className="mb-3">
										<div className="d-flex justify-content-between align-items-center mb-1">
											<label htmlFor="groupName" className="form-label small fw-bold m-0">Group Name</label>
											{nameError && (
												<span className="badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', padding: '0.3em 0.6em' }}>
													Name required
												</span>
											)}
										</div>
										<input 
											type="text" 
											className={`form-control ${nameError ? 'is-invalid' : ''}`} 
											id="groupName" 
											placeholder="Enter group name" 
											value={groupName} 
											onChange={(e) => {
												setGroupName(e.target.value);
												if (nameError) setNameError(false);
											}}
										/>
									</div>
									<div className="mb-4">
										<label htmlFor="groupUsers" className="form-label small fw-bold">Add Friends</label>
										<select 
											className="form-select" 
											id="groupUsers" 
											value=""
											onChange={(e) => {
												const selectedId = e.target.value;
												if (selectedId) {
													const friend = user.chats.private_chats.find(f => f.user_id == selectedId);
													if (friend && !groupUsers.some(u => u.user_id === friend.user_id)) {
														setGroupUsers([...groupUsers, friend]);
													}
												}
											}}
										>
											<option value="" disabled>Select friends</option>
											{user.chats.private_chats.map((friend) => (
												<option 
													key={friend.user_id} 
													value={friend.user_id}
													disabled={groupUsers.some(u => u.user_id === friend.user_id)}
												>
													{friend.publicname}
												</option>
											))}
										</select>
									</div>
									<div className="d-flex justify-content-end gap-2 mt-auto">
										<button className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateGroup(false)}>Cancel</button>
										<button className="btn btn-primary btn-sm" onClick={() => {handleCreateGroup();}}>Create Group</button>
									</div>
								</div>
							</div>
						}/>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
}