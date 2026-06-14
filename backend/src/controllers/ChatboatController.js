const ChatbotService = require("../services/ChatbotService.js");

class ChatboatController {
  
async smartChat(req, res) {
  try {
    const { message, history, productId } = req.body;
    const userId = req.user?._id;

    // 🐛 Debug log
    console.log("📨 Backend received:", { 
      message, 
      productId, 
      userId: userId?.toString(),
      historyLength: history?.length || 0 
    });

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await ChatbotService.smartChat({
      message,
      userId,
      history: history || [],
      productId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("SmartChat Controller Error:", error);
    return res.status(500).json({ 
      error: error.message,
      reply: "Sorry, I'm having technical difficulties. Please try again!",
    });
  }
}
  async simpleChat(req, res) {
    try {
      const { message } = req.body;
      const result = await ChatbotService.smartChat({ message, history: [] });
      return res.status(200).json(result.reply);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async askProductQuestionController(req, res) {
    try {
      const { productId } = req.params;
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      const answer = await ChatbotService.askProductQuestion(productId, question);
      res.status(200).json({ answer });
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  async getProductInsights(req, res) {
    try {
      const { productId } = req.params;
      const insights = await ChatbotService.getProductInsights(productId);
      
      if (!insights) {
        return res.status(404).json({ message: "Could not generate insights" });
      }
      
      return res.status(200).json(insights);
    } catch (error) {
      console.error("Insights error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async compareProducts(req, res) {
    try {
      const { productId1, productId2 } = req.body;
      const comparison = await ChatbotService.compareProducts(productId1, productId2);
      return res.status(200).json(comparison);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChatboatController();