import { useEffect, useRef, useState, useMemo } from "react";
import api from "../api/axios";
import avatar from "../assets/ai-avatar.png";
import { Send } from "lucide-react";

function buildInitialMessage(analysis) {
  if (!analysis) {
    return "Upload your resume to get a personalized role transition plan.";
  }

  const readiness = analysis.readiness ?? 0;
  const surge = (analysis.topSurge || []).join(", ") || "your existing strengths";
  const missing = (analysis.missingSkills || []).slice(0, 3).join(", ") || "portfolio execution";
  const role = analysis.role || "your target role";

  return `You are ${readiness}% ready for ${role}. Double down on ${surge}. Next focus: ${missing}.`;
}

export default function ChatTwin({ analysis }) {
  const [messages, setMessages] = useState([
    { type: "ai", text: buildInitialMessage(analysis), timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const initial = useMemo(() => buildInitialMessage(analysis), [analysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{ type: "ai", text: initial, timestamp: new Date() }]);
  }, [initial]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: userMessage, timestamp: new Date() }]);

    try {
      // Call AI backend endpoint
      const response = await api.post("/chat", {
        message: userMessage,
        context: analysis || {}
      });

      const aiResponse = response.data.message || "I couldn't generate a response. Please try again.";
      
      setMessages((prev) => [...prev, { type: "ai", text: aiResponse, timestamp: new Date() }]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Fallback response
      const fallbackMessages = [
        "That's an interesting question! Tell me more about your career goals.",
        "I'm here to help you advance your career. What would you like to focus on?",
        "Let's discuss your skills and career path. What's on your mind?",
      ];
      
      const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      setMessages((prev) => [...prev, { type: "ai", text: randomFallback, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex justify-between items-center">
        <span className="font-bold text-slate-700 text-xs">Career Twin</span>
        <img src={avatar} className="w-8 h-8 rounded-full border-2 border-blue-100" alt="AI avatar" />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            {msg.type === "ai" && <img src={avatar} className="w-6 h-6 rounded-full flex-shrink-0" alt="AI" />}
            <div
              className={`max-w-xs px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                msg.type === "ai"
                  ? "bg-blue-600 text-white rounded-tl-none"
                  : "bg-slate-100 text-slate-800 rounded-br-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <img src={avatar} className="w-6 h-6 rounded-full flex-shrink-0" alt="AI" />
            <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-xl rounded-tl-none text-xs flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about skills, career..."
          disabled={loading}
          className="flex-1 bg-slate-100 rounded-lg px-3 py-2 outline-none text-xs focus:bg-slate-50 focus:ring-1 focus:ring-blue-300 transition-all disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-all disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}