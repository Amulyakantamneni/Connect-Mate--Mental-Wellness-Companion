import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Moon, Sun, Menu, Settings, MessageCircle, Info, LogOut, Sparkles, Shield } from 'lucide-react';

const API_URL = 'https://connect-mate-mental-wellness-companion-1.onrender.com';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showStory, setShowStory] = useState(false);
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
    const savedTheme = localStorage.getItem("connectmate_theme");

    if (savedTheme) setDarkMode(savedTheme === 'dark');
    if (savedName) {
      setUserName(savedName);
      setShowWelcome(false);
    }
    if (savedMsgs.length) setMessages(savedMsgs);
  }, []);

  useEffect(() => {
    if (userName) localStorage.setItem("connectmate_name", userName);
    localStorage.setItem("connectmate_msgs", JSON.stringify(messages));
    localStorage.setItem("connectmate_theme", darkMode ? 'dark' : 'light');
  }, [messages, userName, darkMode]);

  const handleStartChat = () => {
    if (!userName.trim()) return;
    setShowWelcome(false);
    setMessages([{
      role: 'assistant',
      content: `Hi ${userName} 💙\n\nIt's wonderful to meet you. I'm Connect-Mate, your personal wellness companion. This is a safe, judgment-free space where you can share anything on your mind.\n\nHow are you feeling today?`,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_input: userMessage.content,
            user_name: userName,
            messages_state: messages.map(m => ({ role: m.role, content: m.content })),
            session_start: ""
          })
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        const botMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "💙 I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        }]);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    if (confirm('Start a new conversation? Your current chat will be saved.')) {
      setMessages([]);
      setShowMenu(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Log out? Your chat history will be cleared.')) {
      localStorage.clear();
      setUserName('');
      setMessages([]);
      setShowWelcome(true);
      setShowMenu(false);
    }
  };

  return (
    <>
      {/* your app code here including chat interface, sidebar, welcome screen */}

      {showStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full p-6 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Why I Created ConnectMate 💜</h2>
              <button onClick={() => setShowStory(false)} className="text-sm hover:underline">
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
              <p>
                I built ConnectMate because I know how important it is to have someone who just listens — without judgment, advice, or expectations.
              </p>
              <p>
                Life can be overwhelming, and not everyone has a friend available 24/7. I wanted to create a space that feels warm, safe, and supportive — especially when you need it most.
              </p>
              <p>
                Powered by AI, but shaped by empathy, ConnectMate is my way of saying: <em>"You're not alone, and your feelings matter."</em>
              </p>
              <p>
                Whether you're venting, reflecting, or just need a moment to be heard — I'm here. And so is this app.
              </p>
              <p className="italic text-purple-400">With love,<br />AK 💙</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
