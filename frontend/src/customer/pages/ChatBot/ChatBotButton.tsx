import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { toggleChat } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { MessageCircle, X, Sparkles } from "lucide-react";

const ChatBotButton = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(s => s.aiChatBot);

  return (
    <button
      onClick={() => dispatch(toggleChat())}
      className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
      style={{ 
        background: "linear-gradient(135deg, #6C63FF, #8B7FFF)",
        boxShadow: "0 8px 32px rgba(108,99,255,0.5)",
      }}
    >
      {isOpen ? (
        <X size={24} className="text-white" />
      ) : (
        <>
          <Sparkles size={24} className="text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        </>
      )}
    </button>
  );
};

export default ChatBotButton;