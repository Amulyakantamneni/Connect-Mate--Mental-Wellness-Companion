import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Sparkles, Moon, Sun } from 'lucide-react';

export default function MentalHealthCompanion() {
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
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello there 🕊️\n\nI'm here to listen and support you. This is a safe, judgment-free space where you can share what's on your mind.\n\nTo begin, what would you like me to call you?",
      timestamp: new Date()
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // If no name yet, this is the name input
    if (!userName) {
      const name = input.trim() || "friend";
      setUserName(name);
      setMessages(prev => [...prev, userMessage, {
        role: 'assistant',
        content: `Hi ${name} 💙\n\nIt's wonderful to meet you. How are you feeling today? What's on your mind?\n\nRemember, there's no pressure to share more than you're comfortable with. I'm here to listen.`,
        timestamp: new Date()
      }]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const responses = [
        `Thank you for sharing that with me, ${userName}. It sounds like you're carrying a lot right now. Those feelings are completely valid.\n\nWhat would feel most supportive for you in this moment?`,
        `I hear you, ${userName}. It takes courage to express these feelings. You're not alone in experiencing this.\n\nHave you noticed what tends to help you feel a bit better, even in small ways?`,
        `${userName}, I appreciate you opening up about this. Your feelings matter, and it's okay to not be okay sometimes.\n\nWould it help to explore what might be contributing to these feelings?`,
        `That sounds really challenging, ${userName}. I want you to know that what you're feeling is understandable given what you're going through.\n\nWhat's one small thing that brought you even a moment of peace recently?`
      ];

      const botMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950' 
        : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50'
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-purple-500' : 'bg-purple-300'
        } animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-pink-500' : 'bg-pink-300'
        } animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto h-screen flex flex-col p-6 relative">
        {/* Header */}
        <div className={`rounded-3xl p-8 backdrop-blur-xl ${
          darkMode 
            ? 'bg-slate-900/80 border-slate-700/50' 
            : 'bg-white/90 border-white/50'
        } border-2 shadow-2xl mb-4 transition-all duration-300 hover:shadow-purple-200/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${
                darkMode ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30' : 'bg-gradient-to-br from-purple-100 to-pink-100'
              } shadow-lg`}>
                <Heart className={`w-7 h-7 ${
                  darkMode ? 'text-purple-300' : 'text-purple-600'
                } animate-pulse`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                  darkMode ? 'from-purple-300 to-pink-300' : 'from-purple-600 to-pink-600'
                } bg-clip-text text-transparent`}>
                  Serenity — Mental Wellness Companion
                </h1>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-purple-300/80' : 'text-purple-600/80'
                }`}>
                  A gentle space for your emotions
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 hover:scale-110' 
                  : 'bg-slate-200 hover:bg-slate-300 hover:scale-110'
              } shadow-lg`}
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-amber-300" />
              ) : (
                <Moon className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
          {userName && (
            <div className={`flex items-center gap-2 mt-4 p-3 rounded-xl ${
              darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}>
              <Sparkles className={`w-5 h-5 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                Chatting with {userName}
              </span>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto px-6 py-8 space-y-6 ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-700/50' 
            : 'bg-white/70 border-white/50'
        } border-x-2 backdrop-blur-xl rounded-none`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                  msg.role === 'user'
                    ? darkMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : darkMode
                    ? 'bg-slate-700 text-gray-100 border border-slate-600'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-2 ${
                  msg.role === 'user'
                    ? 'text-purple-200'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-3xl p-6 ${
                darkMode ? 'bg-slate-800/90 border-2 border-slate-700/50' : 'bg-white border-2 border-purple-100'
              } shadow-xl`}>
                <div className="flex items-center gap-3">
                  <Heart className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'} animate-pulse`} />
                  <div className="flex gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                      darkMode ? 'bg-purple-400' : 'bg-purple-500'
                    }`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                      darkMode ? 'bg-purple-400' : 'bg-purple-500'
                    }`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${
                      darkMode ? 'bg-purple-400' : 'bg-purple-500'
                    }`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`rounded-3xl p-6 backdrop-blur-xl ${
          darkMode 
            ? 'bg-slate-900/80 border-slate-700/50' 
            : 'bg-white/90 border-white/50'
        } border-2 shadow-2xl mt-4 transition-all duration-300`}>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  userName 
                    ? "Share anything on your mind..." 
                    : "What would you like me to call you?"
                }
                className={`w-full rounded-2xl px-8 py-5 outline-none transition-all text-base ${
                  darkMode
                    ? 'bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 border-2 border-slate-700'
                    : 'bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 border-2 border-purple-100'
                } focus:scale-[1.01]`}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`rounded-2xl p-5 font-medium transition-all duration-300 ${
                darkMode
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white disabled:from-slate-600 disabled:to-slate-700'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:from-gray-300 disabled:to-gray-400'
              } disabled:cursor-not-allowed shadow-xl disabled:shadow-none hover:scale-110 active:scale-95`}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center justify-center mt-4">
            <p className={`text-xs text-center flex items-center gap-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Heart className="w-3 h-3" />
              Not a substitute for professional help. If you're in crisis, reach out to local emergency services.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}