import ChatRoom from './components/chat/ChatRoom'

function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
    
  return (
    <>
      <ChatRoom/>
    </>
  )
}

export default App