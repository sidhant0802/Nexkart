import { useEffect, useState } from "react";
import { api } from "../../../../Config/Api";
import { 
  Sparkles, ThumbsUp, ThumbsDown, Target, X, 
  Gift, TrendingUp, MessageCircle, Loader, Star,
  CheckCircle2, AlertCircle, Users
} from "lucide-react";
import { useAppDispatch } from "../../../../Redux Toolkit/Store";
import { openChat } from "../../../../Redux Toolkit/Customer/AiChatBotSlice";

interface Insights {
  summary: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  notFor: string;
  buyRecommendation: "Strong Buy" | "Buy" | "Consider" | "Skip";
  buyReason: string;
  isGoodGift: boolean;
  giftReason: string;
  suggestedQuestions: string[];
  keyFeatures: string[];
  ratingBreakdown: {
    quality: number;
    value: number;
    design: number;
  };
}

const AIInsights = ({ productId }: { productId: string }) => {
  const dispatch = useAppDispatch();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/chat/insights/${productId}`);
        setInsights(res.data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchInsights();
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-2xl p-6 my-6" 
           style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(139,127,255,0.05))", 
                    border: "1px solid rgba(108,99,255,0.3)" }}>
        <div className="flex items-center gap-3">
          <Loader size={20} className="animate-spin" style={{ color: "#6C63FF" }} />
          <span className="text-white">AI is analyzing this product...</span>
        </div>
      </div>
    );
  }

  if (error || !insights) return null;

  const recommendationColor = {
    "Strong Buy": "#22c55e",
    "Buy":        "#6C63FF",
    "Consider":   "#f59e0b",
    "Skip":       "#ef4444",
  }[insights.buyRecommendation];

  return (
    <div className="my-6 space-y-4">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #6C63FF, #8B7FFF)" }}>
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Product Insights</h2>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Powered by Gemini AI</p>
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div className="rounded-2xl p-5"
           style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(139,127,255,0.05))", 
                    border: "1px solid rgba(108,99,255,0.3)" }}>
        <p className="text-white text-lg leading-relaxed italic">"{insights.summary}"</p>
      </div>

      {/* ── Buy Recommendation Badge ── */}
      <div className="rounded-2xl p-5 flex items-center justify-between"
           style={{ backgroundColor: "#16161f", border: `2px solid ${recommendationColor}` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
               style={{ backgroundColor: `${recommendationColor}20` }}>
            <TrendingUp size={24} style={{ color: recommendationColor }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold mb-1" 
                 style={{ color: recommendationColor }}>
              AI Recommendation
            </div>
            <div className="text-2xl font-bold text-white">{insights.buyRecommendation}</div>
            <div className="text-sm mt-1" style={{ color: "#9ca3af" }}>{insights.buyReason}</div>
          </div>
        </div>
      </div>

      {/* ── Pros & Cons Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="rounded-2xl p-5" 
             style={{ backgroundColor: "#16161f", border: "1px solid rgba(34,197,94,0.3)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp size={18} style={{ color: "#22c55e" }} />
            <h3 className="font-bold text-white">Pros</h3>
          </div>
          <ul className="space-y-2">
            {insights.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#d1d5db" }}>
                <CheckCircle2 size={14} style={{ color: "#22c55e" }} className="mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-2xl p-5" 
             style={{ backgroundColor: "#16161f", border: "1px solid rgba(239,68,68,0.3)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown size={18} style={{ color: "#ef4444" }} />
            <h3 className="font-bold text-white">Cons</h3>
          </div>
          <ul className="space-y-2">
            {insights.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#d1d5db" }}>
                <AlertCircle size={14} style={{ color: "#ef4444" }} className="mt-0.5 flex-shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Who is it for ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" 
             style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} style={{ color: "#6C63FF" }} />
            <h3 className="font-bold text-white">Perfect For</h3>
          </div>
          <p className="text-sm" style={{ color: "#d1d5db" }}>{insights.bestFor}</p>
        </div>

        <div className="rounded-2xl p-5" 
             style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>
          <div className="flex items-center gap-2 mb-2">
            <X size={18} style={{ color: "#f59e0b" }} />
            <h3 className="font-bold text-white">Skip If</h3>
          </div>
          <p className="text-sm" style={{ color: "#d1d5db" }}>{insights.notFor}</p>
        </div>
      </div>

      {/* ── Key Features ── */}
      <div className="rounded-2xl p-5" 
           style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} style={{ color: "#6C63FF" }} />
          <h3 className="font-bold text-white">Key Features</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {insights.keyFeatures.map((feature, i) => (
            <span 
              key={i}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: "rgba(108,99,255,0.15)", 
                color: "#6C63FF",
                border: "1px solid rgba(108,99,255,0.3)" 
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* ── Gift Suggestion ── */}
      <div className="rounded-2xl p-5" 
           style={{ 
             backgroundColor: "#16161f", 
             border: `1px solid ${insights.isGoodGift ? "rgba(236,72,153,0.3)" : "#2a2a3d"}` 
           }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: insights.isGoodGift ? "rgba(236,72,153,0.15)" : "rgba(156,163,175,0.15)" }}>
            <Gift size={18} style={{ color: insights.isGoodGift ? "#ec4899" : "#9ca3af" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">
              {insights.isGoodGift ? "🎁 Great Gift Choice!" : "🤔 Not Ideal as Gift"}
            </h3>
            <p className="text-sm" style={{ color: "#d1d5db" }}>{insights.giftReason}</p>
          </div>
        </div>
      </div>

      {/* ── AI Quality Scores ── */}
      {insights.ratingBreakdown && (
        <div className="rounded-2xl p-5" 
             style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} style={{ color: "#f59e0b" }} />
            <h3 className="font-bold text-white">AI Quality Analysis</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(insights.ratingBreakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm capitalize text-white">{key}</span>
                  <span className="text-sm font-bold" style={{ color: "#6C63FF" }}>
                    {value.toFixed(1)}/5
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#2a2a3d" }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${(value / 5) * 100}%`,
                      background: "linear-gradient(90deg, #6C63FF, #8B7FFF)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggested Questions ── */}
      <div className="rounded-2xl p-5" 
           style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={18} style={{ color: "#6C63FF" }} />
          <h3 className="font-bold text-white">Ask AI About This Product</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {insights.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => dispatch(openChat())}
              className="text-left p-3 rounded-xl text-sm transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: "#1f1f2e", 
                border: "1px solid #2a2a3d",
                color: "#d1d5db" 
              }}
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AIInsights;