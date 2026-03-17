import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/context/authentication/AuthProvider';
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChatPage from "../pages/ChatPage";
import Card from "../src/components/card/Card";

function App(): React.JSX.Element {    
  const { user } = useAuth();
  console.log(user);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={user ? <Home main={<Card component={<div id="home"></div>}/>}/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={!user ? <LoginPage/> : <Navigate to="/"/>}/>
        <Route path="/signup" element={!user ? <RegisterPage/> : <Navigate to="/"/>}/>
        {user.friends.map(friend => (
          <Route path={`/chat/${friend.user_id}`} element={<Home main={<ChatPage/>}/>}/>
        ))}
      </Routes>
    </HashRouter>
  );
}

export default App