import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import { useAuth } from './components/context/authentication/AuthProvider';
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChatPage from "../pages/ChatPage";
import Card from "../src/components/card/Card";


function App(): React.JSX.Element {    
	const { user } = useAuth();
	const ipc = window.electron?.ipcRenderer;
	
	const userRef = useRef(user);
	useEffect(() => {
		userRef.current = user;
	}, [user]);

	useEffect(() => {
		const handleAppClose = () => {
			console.log("Close User: " + userRef.current);
			ipc?.send("closed")
		};

		if (ipc) {
			ipc.on("app-close", handleAppClose);
		}

		return () => {
			ipc?.removeAllListeners("app-close");
		};
	}, [ipc]);
		

	return (
		<HashRouter>
		<Routes>
			<Route path="/" element={user ? <Home main={<Card component={<div id="home"></div>}/>}/> : <Navigate to="/login"/>}/>
			<Route path="/login" element={!user ? <LoginPage/> : <Navigate to="/"/>}/>
			<Route path="/signup" element={!user ? <RegisterPage/> : <Navigate to="/"/>}/>
			{user?.chats.private_chats.map(friend => (
			<Route path={`/chat/${friend.chat_id}`} element={<Home main={<ChatPage/>}/>}/>
			))}
			{user?.chats.group_chats.map(group => (
			<Route path={`/chat/${group.chat_id}`} element={<Home main={<ChatPage/>}/>}/>
			))}
		</Routes>
		</HashRouter>
	);
}

export default App