import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { sendSmartMessage, closeChat, clearMessages } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { useNavigate } from "react-router-dom";
import { X, Send, Sparkles, Trash2, ShoppingBag, Package, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";

const QUICK_ACTIONS = [
  { icon: Search,      label: "Find products",     prompt: "Show me trending products" },
  { icon: Package,     label: "Track my order",    prompt: "Where is my latest order?" },
  { icon: ShoppingBag, label: "View my cart",      prompt: "What's in my cart?" },
  { icon: Sparkles,    label: "Best deals today",  prompt: "Show me the best deals today" },
];

const ChatBot = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { messages, loading, isOpen } = useAppSelector(s => s.aiChatBot);
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = (customMessage?: string) => {
    const msg = customMessage || input.trim();
    if (!msg || loading) return;
    
    dispatch(sendSmartMessage({ message: msg, history: messages }));
    setInput("");
  };

  const handleProductClick = (product: any) => {
    const catId = typeof product.category === "object" 
      ? product.category?.categoryId 
      : product.category || "all";
    navigate(`/product-details/${catId}/${encodeURIComponent(product.title)}/${product._id}`);
    dispatch(closeChat());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[9999] w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
         style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
           style={{ background: "linear-gradient(135deg, #6C63FF 0%, #8B7FFF 100%)", borderColor: "#2a2a3d" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Nexkart AI</h3>
            <p className="text-white/70 text-xs">Your shopping assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => dispatch(clearMessages())}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={16} className="text-white" />
            </button>
          )}
          <button
            onClick={() => dispatch(closeChat())}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg, #6C63FF, #8B7FFF)" }}>
              <Sparkles size={28} className="text-white" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Hi! I'm Nexkart AI 👋</h4>
            <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>
              I can help you find products, track orders, and more!
            </p>
            
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="p-3 rounded-xl text-left transition-all hover:scale-105"
                  style={{ backgroundColor: "#1f1f2e", border: "1px solid #2a2a3d" }}
                >
                  <action.icon size={16} style={{ color: "#6C63FF" }} className="mb-1" />
                  <p className="text-xs text-white font-medium">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
              
              {/* Message bubble */}
              <div 
                className={`px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "rounded-br-sm text-white" 
                    : "rounded-bl-sm text-white"
                }`}
                style={{
                  background: msg.role === "user" 
                    ? "linear-gradient(135deg, #6C63FF, #8B7FFF)"
                    : "#1f1f2e",
                  border: msg.role === "bot" ? "1px solid #2a2a3d" : "none",
                }}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              </div>

              {/* Product cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  {msg.products.map((p: any) => (
                    <div
                      key={p._id}
                      onClick={() => handleProductClick(p)}
                      className="flex gap-3 p-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: "#1f1f2e", border: "1px solid #2a2a3d" }}
                    >
                      <img 
                        src={p.images?.[0]} 
                        alt={p.title}
                        className="w-16 h-16 rounded-lg object-cover bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{p.title}</p>
                        {p.brand && (
                          <p className="text-xs" style={{ color: "#9ca3af" }}>{p.brand}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold" style={{ color: "#6C63FF" }}>
                            ₹{p.minPrice?.toLocaleString("en-IN")}
                          </span>
                          {p.minMrpPrice > p.minPrice && (
                            <span className="text-xs line-through" style={{ color: "#6b7280" }}>
                              ₹{p.minMrpPrice?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order cards */}
              {msg.orders && msg.orders.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  {msg.orders.map((o: any) => (
                    <div
                      key={o._id}
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: "#1f1f2e", border: "1px solid #2a2a3d" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm font-bold">
                          #{o._id.toString().slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full" 
                              style={{ backgroundColor: "rgba(108,99,255,0.2)", color: "#6C63FF" }}>
                          {o.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                        Total: ₹{o.totalPrice?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm" 
                 style={{ backgroundColor: "#1f1f2e", border: "1px solid #2a2a3d" }}>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#6C63FF", animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#6C63FF", animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#6C63FF", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="p-3 border-t" style={{ borderColor: "#2a2a3d", backgroundColor: "#0f0f17" }}>
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-full text-sm text-white outline-none transition-all"
            style={{ 
              backgroundColor: "#1f1f2e", 
              border: "1px solid #2a2a3d",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #6C63FF, #8B7FFF)" }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;