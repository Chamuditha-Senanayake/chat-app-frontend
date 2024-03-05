import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Import CSS file for styling

const socket = io('http://localhost:5000');

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9); // Generate a random alphanumeric string
}

function getOrCreateUserId() {
  let userId = localStorage.getItem('userId'); // Check if userId exists in local storage
  if (!userId) {
    userId = generateRandomId(); // Generate a random userId if it doesn't exist
    localStorage.setItem('userId', userId); // Store the userId in local storage
  }
  return userId;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const userId = getOrCreateUserId(); // Get or create a unique userId for the user
    setUserId(userId);

    socket.on('chat message', (msg) => {
      // When a new message is received, add the current timestamp to it
      const messageWithTimestamp = { ...msg, timestamp: new Date().toLocaleTimeString() };
      setMessages([...messages, messageWithTimestamp]);
    });

    // Clean up socket event listener when component unmounts
    return () => {
      socket.off('chat message');
    };
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() !== '') { // Check if input is not empty
      socket.emit('chat message', { userId, message: input }); // Include userId and message content
      setInput('');
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="message-container">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div className="avatar"></div> {/* Placeholder for user avatar */}
              <div className="message-content">
                <div className="username">{msg.userId === userId ? 'You' : `User ${msg.userId}`}</div> {/* Show "You" for the current user */}
                <div className="text">{msg.message}</div> {/* Message content */}
                <div className="timestamp">{msg.timestamp}</div> {/* Message timestamp */}
              </div>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
