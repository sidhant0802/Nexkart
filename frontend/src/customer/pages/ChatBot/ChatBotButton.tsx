// src/customer/pages/ChatBot/ChatBotButton.tsx
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { toggleChat } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { X, Sparkles } from "lucide-react";

const ChatBotButton = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(s => s.aiChatBot);

  return (
    <button
      onClick={() => dispatch(toggleChat())}
      className="fixed z-[9998] rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group
                 bottom-4 right-4 w-12 h-12
                 sm:bottom-6 sm:right-6 sm:w-14 sm:h-14"
      style={{ 
        background: "linear-gradient(135deg, #6C63FF, #8B7FFF)",
        boxShadow: "0 8px 32px rgba(108,99,255,0.5)",
      }}
      aria-label={isOpen ? "Close chat" : "Open AI assistant"}
    >
      {isOpen ? (
        <X size={20} className="text-white sm:hidden" />
      ) : (
        <>
          <Sparkles size={20} className="text-white sm:hidden" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        </>
      )}
      {isOpen ? (
        <X size={24} className="text-white hidden sm:block" />
      ) : (
        <Sparkles size={24} className="text-white hidden sm:block" />
      )}
    </button>
  );
};

export default ChatBotButton;