import ChatRoom from './components/chat/ChatRoom';
import Header from "./components/Header";
import FriendsList from "./components/FriendsList";
import ChatInput from "./components/chat/ChatInput";

function App(): React.JSX.Element {    
  return (
    <>
      <Header/>
      <div id='layout'>
        <div id="users">
          <FriendsList/>
        </div>
        <div id="messages">
          <ChatRoom/>
          <div id="input"></div>
        </div>
      </div>
    </>
  )
}

export default App