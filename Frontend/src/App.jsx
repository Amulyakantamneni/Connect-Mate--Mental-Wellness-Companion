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
  const [showAbout, setShowAbout] = useState(false);
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
      content: `Hi ${userName} 💙\n\nIt's wonderful to meet you. I'm Nira, your personal wellness companion. This is a safe, judgment-free space where you can share anything on your mind.\n\nHow are you feeling today?`,
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

  // About Modal
  if (showAbout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <div className={`max-w-2xl w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>About ConnectMate</h2>
            <button 
              onClick={() => setShowAbout(false)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-purple-500 animate-pulse" />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why ConnectMate Was Created</h3>
              </div>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mental health struggles can feel incredibly isolating. Sometimes you need someone to talk to at 3 AM, or you're not ready to reach out to friends and family. Traditional therapy isn't always accessible due to cost, wait times, or stigma.
              </p>
            </div>

            <div className="space-y-4">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  💜 The Mission
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ConnectMate was built to provide a safe, judgment-free space where anyone can share their thoughts and feelings at any time. It's not meant to replace professional help, but to be a supportive companion when you need one most.
                </p>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  🎯 Our Purpose
                </h4>
                <ul className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• When the world feels too loud, come here.</li>
                  <li>• Provide 24/7 emotional support without judgment</li>
                  <li>• Nira is your space to finally let them out — safely, softly.</li>
                  <li>• Create a safe space for self-reflection</li>
                  <li>• Encourage healthy conversations about mental health</li>
                </ul>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  🌟 The Vision
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  We envision a world where mental health support is accessible to everyone, anytime. Where reaching out doesn't feel scary, and where technology helps us feel more connected rather than isolated.
                </p>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  🛡️ Built with Care
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Created by AK with empathy and understanding. Every feature is designed with your wellbeing in mind - from secure local storage to crisis detection that connects you with real help when needed.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border-2 ${darkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-200'}`}>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                ⚠️ Important Reminder
              </h4>
              <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                ConnectMate is NOT a substitute for professional mental health care. If you're in crisis, please reach out to:
              </p>
              <div className={`mt-3 space-y-1 text-sm font-semibold ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                <p>🆘 National Suicide Prevention: 988</p>
                <p>💬 Crisis Text Line: Text HOME to 741741</p>
                <p>🚨 Emergency Services: 911</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Thank you for trusting ConnectMate with your thoughts 💜
              </p>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Version 1.0 • Built with care by AK
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50'} flex items-center justify-center p-6`}>
        <div className={`max-w-2xl w-full ${darkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-xl rounded-3xl shadow-2xl p-12 border ${darkMode ? 'border-purple-500/20' : 'border-purple-200'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
              <Heart className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to ConnectMate
            </h1>
            <p className={`text-lg ${darkMode ? 'text-purple-200' : 'text-purple-600'} mb-2`}>
              Your Personal Mental Wellness Companion
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              A safe space to share, reflect, and find support 💜
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'} flex items-start gap-3`}>
              <Shield className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Private & Secure</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your conversations are confidential and stored locally</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'} flex items-start gap-3`}>
              <MessageCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>24/7 Support</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>I'm here whenever you need someone to talk to</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'} flex items-start gap-3`}>
              <Sparkles className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI-Powered Empathy</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Thoughtful, caring responses powered by advanced AI</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
              placeholder="What should I call you?"
              className={`w-full px-6 py-4 rounded-xl outline-none text-center text-lg ${darkMode ? 'bg-slate-700 text-white placeholder-gray-400 border border-purple-500/30' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-2 border-purple-200'} focus:ring-4 focus:ring-purple-500/20`}
            />
            <button
              onClick={handleStartChat}
              disabled={!userName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Start Your Journey
            </button>
          </div>

          <p className={`text-xs text-center mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            💙 Not a replacement for professional mental health care. In crisis? Call 988 or text HOME to 741741
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50'}`}>
      {/* Sidebar Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className={`w-80 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl p-6 space-y-6 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
              <button onClick={() => setShowMenu(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleNewChat}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-100 text-gray-900'} transition-colors text-left`}
              >
                <MessageCircle className="w-5 h-5" />
                New Conversation
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-100 text-gray-900'} transition-colors text-left`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowAbout(true);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-100 text-gray-900'} transition-colors text-left`}
              >
                <Info className="w-5 h-5" />
                About ConnectMate
              </button>

              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors text-left`}
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-purple-500" />
                <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>About ConnectMate</h3>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your AI wellness companion, here to listen and support you 24/7. Remember, I'm here to help, but I'm not a replacement for professional care.
              </p>
            </div>

            <div className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>Version 1.0</p>
              <p className="mt-1">Built with 💜 by AK</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-700' : 'border-purple-100'} shadow-lg`}>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setShowMenu(true)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ConnectMate
                </h1>
                <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  with {userName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Start a conversation
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                I'm here to listen. Share what's on your mind.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : darkMode ? 'bg-slate-700/80 text-white' : 'bg-white text-gray-800'} p-5 rounded-2xl shadow-lg`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className={`flex gap-2 items-center ${darkMode ? 'bg-slate-700/80' : 'bg-white'} p-4 rounded-2xl shadow-lg`}>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className={`text-sm ml-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-xl border-t ${darkMode ? 'border-slate-700' : 'border-purple-100'} p-4 shadow-2xl`}>
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your thoughts..."
              disabled={isLoading}
              rows={1}
              className={`flex-1 px-5 py-4 rounded-2xl outline-none resize-none ${darkMode ? 'bg-slate-700 text-white placeholder-gray-400 border border-slate-600' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-2 border-purple-200'} focus:ring-4 focus:ring-purple-500/20 transition-all`}
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-xs text-center mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            💙 In crisis? Call 988 or text HOME to 741741 • Not a substitute for professional help
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
