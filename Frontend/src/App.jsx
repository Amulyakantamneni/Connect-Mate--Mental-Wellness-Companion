import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Sparkles, Moon, Sun } from 'lucide-react';

// API Configuration
const API_URL = import.meta.env?.VITE_API_URL || 'https://connect-mate-mental-wellness-companion-1.onrender.com';


export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedName = localStorage.getItem("connectmate_name");
    const savedMsgs = JSON.parse(localStorage.getItem("connectmate_msgs") || "[]");
    if (savedName) setUserName(savedName);
    if (savedMsgs.length) setMessages(savedMsgs);
    else {
      setMessages([{
        role: 'assistant',
        content: "Hey there 🕊️\n\nI'm here to listen. This is a safe space. Let's begin — what should I call you?",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("connectmate_name", userName);
    localStorage.setItem("connectmate_msgs", JSON.stringify(messages));
  }, [messages, userName]);

  const personalizeTone = (text) => {
    return text
      .replace(/I'm here/g, `I'm right here for you, ${userName} 💙`)
      .replace(/Let me know/g, "Tell me everything, I'm all ears 🥺")
      .replace(/You're not alone/g, "I've got your back 🤗");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    if (!userName) {
      const name = input.trim() || "friend";
      setUserName(name);
      setMessages(prev => [...prev, userMessage, {
        role: 'assistant',
        content: `Hi ${name} 💙\n\nIt's wonderful to meet you. How are you feeling today?\nTell me what's on your mind — I'm here.`,
        timestamp: new Date()
      }]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(async () => {
      try {
        console.log('Sending request to:', `${API_URL}/chat`);
        
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_input: userMessage.content,
            user_name: userName,
            messages_state: messages.map(m => ({ role: m.role, content: m.content })),
            session_start: ""
          })
        });

        console.log('Response status:', res.status);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Response data:', data);
        
        const botMessage = {
          role: 'assistant',
          content: personalizeTone(data.reply),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "💙 Oops! I'm having trouble responding. Can you try again in a moment?\n\nError: " + error.message,
          timestamp: new Date()
        }]);
      }
      setIsLoading(false);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-violet-50 to-pink-50'}`}>
      <div className="max-w-4xl mx-auto h-screen flex flex-col p-4">
        {/* Header */}
        <div className={`rounded-3xl p-6 backdrop-blur-xl mb-4 shadow-xl border ${darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-white'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className={`w-7 h-7 ${darkMode ? 'text-purple-300' : 'text-purple-600'} animate-pulse`} />
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ConnectMate — Your Mental Wellness Buddy
                </h1>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                  A friend who listens, anytime 💜
                </p>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:scale-110 transition">
              {darkMode ? <Sun className="text-yellow-300" /> : <Moon className="text-gray-700" />}
            </button>
          </div>
          {userName && (
            <div className="flex items-center gap-2 mt-2 text-sm text-purple-600 dark:text-purple-300">
              <Sparkles className="w-4 h-4" /> Chatting with {userName}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto space-y-4 px-4 py-6 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white'}`}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[75%] p-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : darkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 items-center bg-purple-100 dark:bg-purple-700 p-3 rounded-2xl animate-pulse">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300" />
                <span className="text-sm ml-2 text-purple-600 dark:text-purple-200">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 mt-4 rounded-3xl shadow-xl border backdrop-blur-xl ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/70 border-white'}`}>
          <div className="flex gap-3">
            <input
              className={`flex-1 rounded-2xl px-5 py-4 outline-none text-sm ${darkMode ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-800 placeholder-gray-400'}`}
              placeholder={userName ? "Type your thoughts…" : "What should I call you? 💙"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-4 rounded-2xl shadow-lg hover:scale-105 transition disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send />
            </button>
          </div>
          <p className="text-xs mt-3 text-center text-gray-500 dark:text-gray-400">
            💙 Not a substitute for professional help. If you're in crisis, please contact emergency services.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
