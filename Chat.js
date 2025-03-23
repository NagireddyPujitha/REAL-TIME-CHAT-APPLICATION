import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css'; // Import the CSS file for styling

const socket = io('http://localhost:5000'); // Connect to the backend server

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('User'); // Default username
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to the latest message

  // Set username on component mount
  useEffect(() => {
    const name = prompt('Enter your name:', 'User');
    setUsername(name || 'User');
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to the server
  const sendMessage = () => {
    if (message.trim()) {
      const data = {
        id: socket.id,
        username: username,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('send_message', data);
      setMessage('');
    }
  };

  // Handle "Enter" key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h1>Real-Time Chat</h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.id === socket.id ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <strong>{msg.username}</strong>
              <p>{msg.message}</p>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;