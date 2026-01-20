import React, { useState, useEffect } from 'react';
// useState - A special variable that survives re-renders and triggers updates when changed.
// useState is like a memory
// useEffect - performs side effects in function components (like network calls, event listeners)
import './App.css';

function App() {
  // content → stores the text currently in editor
  // setContent → function to update content state
  const [content, setContent] = useState("");  

  // socket → stores WebSocket connection object
  const [socket, setSocket] = useState(null);  

  // when component mounts (runs once)
  useEffect(() => {
    // creating new websocket connection to server
    const newSocket = new WebSocket('ws://localhost:5000');
    setSocket(newSocket);

    // triggers when connection established
    newSocket.onopen = () => {
      console.log('ws connection established');
    };

    // to handle incoming messages and update document state
    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data); // parsing JSON string message
        if (message.type === 'init') {
          // sets initial document data when user joins
          setContent(message.data);
        } else if (message.type === 'update') {
          // updates text when other users make changes
          setContent(message.data);
        }
      } catch (error) {
        console.error('error in parsing document:', error);
      }
    };

    // triggers when connection closed
    newSocket.onclose = () => {
      console.log('ws connection closed');
    };

    // triggers when there is any websocket error
    newSocket.onerror = (error) => {
      console.error('websocket error', error);
    };

    // when component unmounts, closes ws connection to avoid memory leak
    return () => {
      newSocket.close();
    };
  }, []); // empty dependency array → runs only once (on mount)

  // function to handle changes in textarea input
  const handleChange = (e) => {
    const newContent = e.target.value; // get latest text value
    setContent(newContent); // update local state immediately

    // check if ws connection is open and valid
    // then send updated content to server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'update', data: newContent }));
    }
  };

  return (
    <div className='App'>
      <h1>Text Editor</h1>

      {/* Controlled textarea → value always tied to 'content' state */}
      <textarea
        value={content}
        onChange={handleChange}
        rows="20"
        cols="80"
      />
    </div>
  );
}

export default App;
