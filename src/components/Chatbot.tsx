import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const faqs: Record<string, string> = {
  "what is chaldean numerology": "Chaldean numerology is an ancient system that assigns numbers to letters based on sound frequencies rather than sequence.",
  "how do i buy": "Click 'Buy Now' on any number. You will be redirected to WhatsApp for the payment process.",
  "how to purchase": "Click 'Buy Now' on any number. You will be redirected to WhatsApp for the payment process.",
  "purchase": "Click 'Buy Now' on any number. You will be redirected to WhatsApp for the payment process.",
  "buy": "Click 'Buy Now' on any number. You will be redirected to WhatsApp for the payment process.",
  "is it secure": "Yes, we handle all transactions securely over WhatsApp, and your numbers are transferred directly to you.",
  "default": "I am a numerology assistant! I can help you with questions about Chaldean numerology or how to purchase VIP numbers.",
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Namaste! How can I assist you with your numerology journey today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      let botResponseText = faqs["default"];
      const lowerInput = input.toLowerCase();
      
      for (const key in faqs) {
        if (key !== "default" && lowerInput.includes(key)) {
          botResponseText = faqs[key];
          break;
        }
      }

      if (lowerInput.includes("my name is ")) {
        const nameMatch = lowerInput.match(/my name is ([a-z ]+)/);
        if (nameMatch) {
            botResponseText = `Welcome, ${nameMatch[1]}. Would you like me to calculate your numerology expression number? Use our free tool on the main page!`;
        }
      }

      const botMsg: Message = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window shadow-md"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <h3>VIPBot</h3>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="chatbot-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chatbot-input">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" disabled={!input.trim()}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .chatbot-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: var(--accent-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          z-index: 100;
          transition: transform 0.3s ease;
        }
        
        .chatbot-toggle:hover {
          transform: scale(1.05);
        }

        .chatbot-window {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 350px;
          height: 500px;
          max-height: calc(100vh - 4rem);
          max-width: calc(100vw - 4rem);
          background-color: var(--surface-color);
          border-radius: var(--radius-md);
          z-index: 101;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .chatbot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background-color: var(--secondary-bg);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .chatbot-header h3 {
          font-family: var(--font-sans);
          font-size: 1.1rem;
        }
        
        .chatbot-header button {
          color: #666;
        }

        .chatbot-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
        }

        .message.bot {
          justify-content: flex-start;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
        }

        .bot .message-bubble {
          background-color: var(--secondary-bg);
          color: var(--text-color);
          border-bottom-left-radius: 4px;
        }

        .user .message-bubble {
          background-color: var(--accent-color);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chatbot-input {
          display: flex;
          padding: 1rem;
          border-top: 1px solid rgba(0,0,0,0.05);
          background-color: var(--surface-color);
        }

        .chatbot-input input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: var(--radius-full);
          outline: none;
          font-family: var(--font-sans);
        }
        
        .chatbot-input input:focus {
          border-color: var(--accent-color);
        }

        .chatbot-input button {
          margin-left: 0.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--accent-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chatbot-input button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
