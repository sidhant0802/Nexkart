// require("dotenv").config();
// const { GoogleGenAI } = require("@google/genai");
// const Product = require("../models/Product");
// const Order = require("../models/Order");
// const Cart = require("../models/Cart");

// // ✅ Verify API key on startup
// if (!process.env.GEMINI_API_KEY) {
//   console.error("❌ GEMINI_API_KEY missing in .env");
// }

// // ✅ New SDK initialization
// const ai = new GoogleGenAI({ 
//   apiKey: process.env.GEMINI_API_KEY?.trim() 
// });

// const MODEL_NAME = "gemini-2.0-flash";

// class ChatbotService {

//   // ─────────────────────────────────────────
//   // 🤖 MAIN SMART CHAT (with product context)
//   // ─────────────────────────────────────────
//   async smartChat({ message, userId, history = [], productId = null }) {
//     try {
//       console.log("💬 SmartChat — userId:", userId, "| productId:", productId, "| msg:", message);

//       // 🎯 Load current product context if user is on product page
//       let currentProduct = null;
//       if (productId) {
//         currentProduct = await this.getCurrentProduct(productId);
//         if (currentProduct) {
//           console.log("📦 Product context loaded:", currentProduct.title);
//         }
//       }

//       // Detect intent (now product-aware)
//       const intent = await this.detectIntent(message, currentProduct);
//       console.log("🎯 Intent:", intent);

//       let context = "";
//       let products = [];
//       let orders = [];
//       let needsLogin = false;

//       // 🎯 If on product page and asking about this product
//       if (currentProduct && (intent.type === "product_question" || intent.type === "general")) {
//         context = this.buildCurrentProductContext(currentProduct);
//       }
//       // Search products
//       else if (intent.type === "search_products") {
//         products = await this.searchProducts(intent.query, intent.filters);
//         context = this.buildProductContext(products);
        
//         if (currentProduct) {
//           context = `USER IS CURRENTLY VIEWING:\n${this.buildCurrentProductContext(currentProduct)}\n\nSEARCH RESULTS:\n${context}`;
//         }
//       }
//       else if (intent.type === "track_order") {
//         if (!userId) {
//           needsLogin = true;
//           context = "User is NOT logged in. Politely ask them to login first to track orders.";
//         } else {
//           orders = await this.getUserOrders(userId, intent.orderId);
//           context = this.buildOrderContext(orders);
//         }
//       }
//       else if (intent.type === "view_cart") {
//         if (!userId) {
//           needsLogin = true;
//           context = "User is NOT logged in. Politely ask them to login to view their cart.";
//         } else {
//           const cart = await this.getUserCart(userId);
//           context = this.buildCartContext(cart);
//         }
//       }
//       // 🎯 NEW: Find similar products
//       else if (intent.type === "find_similar" && currentProduct) {
//         products = await this.findSimilarProducts(currentProduct);
//         context = `USER IS VIEWING:\n${this.buildCurrentProductContext(currentProduct)}\n\nSIMILAR PRODUCTS FOUND:\n${this.buildProductContext(products)}`;
//       }
//       // 🎯 NEW: Compare with another product
//       else if (intent.type === "compare" && currentProduct) {
//         if (intent.query) {
//           products = await this.searchProducts(intent.query, {});
//           context = `USER WANTS TO COMPARE:\nCURRENT PRODUCT:\n${this.buildCurrentProductContext(currentProduct)}\n\nCOMPETITORS FOUND:\n${this.buildProductContext(products)}`;
//         }
//       }

//       const systemPrompt = this.buildSystemPrompt(context, intent.type, !!currentProduct);
//       const response = await this.generateResponse(systemPrompt, message, history);

//       return {
//         reply: response,
//         intent: intent.type,
//         products: products.slice(0, 5),
//         orders: orders.slice(0, 3),
//         needsLogin,
//         currentProduct: currentProduct ? {
//           _id: currentProduct._id,
//           title: currentProduct.title,
//         } : null,
//       };

//     } catch (error) {
//       console.error("❌ Chatbot error:", error.message);
//       console.error("Stack:", error.stack);
//       return {
//         reply: "I'm having trouble right now. Please try again in a moment! 😔",
//         intent: "error",
//         products: [],
//         orders: [],
//       };
//     }
//   }

//   // ─────────────────────────────────────────
//   // 🎯 GET CURRENT PRODUCT (product page context)
//   // ─────────────────────────────────────────
// async getCurrentProduct(productId) {
//   try {
//     if (!productId) return null;
    
//     // Validate it's a valid MongoDB ObjectId
//     const mongoose = require("mongoose");
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       console.log("⚠️ Invalid productId format:", productId);
//       return null;
//     }

//     const product = await Product.findById(productId)
//       .populate("category", "name")
//       .lean();
    
//     if (!product) {
//       console.log("⚠️ Product not found in DB:", productId);
//       return null;
//     }

//     console.log("✅ Product loaded:", product.title);
//     return product;
//   } catch (e) {
//     console.error("❌ Current product fetch error:", e.message);
//     return null;
//   }
// }

//   // ─────────────────────────────────────────
//   // 🔄 FIND SIMILAR PRODUCTS
//   // ─────────────────────────────────────────
//   async findSimilarProducts(currentProduct) {
//     try {
//       const query = {
//         _id: { $ne: currentProduct._id },
//         isActive: true,
//         $or: [
//           { category: currentProduct.category?._id || currentProduct.category },
//           { brand: currentProduct.brand },
//         ],
//       };

//       // Price range: ±30% of current product
//       if (currentProduct.minPrice) {
//         const minRange = currentProduct.minPrice * 0.7;
//         const maxRange = currentProduct.minPrice * 1.3;
//         query.minPrice = { $gte: minRange, $lte: maxRange };
//       }

//       const products = await Product.find(query)
//         .select("title images minPrice minMrpPrice brand averageRating numRatings category")
//         .sort({ averageRating: -1 })
//         .limit(5)
//         .lean();

//       console.log(`🔄 Found ${products.length} similar products`);
//       return products;
//     } catch (e) {
//       console.error("Similar products error:", e.message);
//       return [];
//     }
//   }

//   // ─────────────────────────────────────────
//   // 📝 BUILD CURRENT PRODUCT CONTEXT
//   // ─────────────────────────────────────────
//   buildCurrentProductContext(product) {
//     if (!product) return "";
    
//     const discount = product.minMrpPrice && product.minPrice
//       ? Math.round(((product.minMrpPrice - product.minPrice) / product.minMrpPrice) * 100)
//       : 0;

//     return `
// 📦 PRODUCT DETAILS:
// - Title: ${product.title}
// - Brand: ${product.brand || "N/A"}
// - Category: ${product.category?.name || "N/A"}
// - Price: ₹${product.minPrice?.toLocaleString("en-IN") || "N/A"}
// - MRP: ₹${product.minMrpPrice?.toLocaleString("en-IN") || "N/A"}
// - Discount: ${discount}% OFF
// - Color: ${product.color || "N/A"}
// - Sizes: ${product.sizes || "N/A"}
// - Description: ${product.description || "N/A"}
// - Rating: ${product.averageRating || 0}/5 (${product.numRatings || 0} reviews)
// - Available from ${product.totalSellers || 1} seller(s)
// - Total Stock: ${product.totalStock || 0} units
// `.trim();
//   }

//   // ─────────────────────────────────────────
//   // 🧠 INTENT DETECTION (product-aware)
//   // ─────────────────────────────────────────
//   async detectIntent(message, currentProduct = null) {
//     const productContext = currentProduct
//       ? `\nUSER IS CURRENTLY VIEWING THIS PRODUCT: "${currentProduct.title}" (${currentProduct.brand || "no brand"})\nKeep this in mind — if they say "this", "it", "the product", they mean THIS product.\n`
//       : "";

//     const prompt = `You are an intent classifier for an e-commerce chatbot.
// Return ONLY a JSON object (no markdown, no explanation).
// ${productContext}
// User message: "${message}"

// Return JSON:
// {
//   "type": "search_products" | "track_order" | "view_cart" | "product_question" | "find_similar" | "compare" | "general",
//   "query": "search keywords if searching/comparing",
//   "filters": { "maxPrice": number, "minPrice": number, "brand": "string" },
//   "orderId": "order id if tracking"
// }

// INTENT RULES:
// - "product_question" → asking about CURRENT product (price, specs, worth it, pros/cons, reviews)
// - "find_similar" → "show similar", "alternatives", "other options like this"
// - "compare" → "compare with X", "vs iPhone", "better than samsung"
// - "search_products" → general search for new products
// - "general" → greetings, thank you, casual chat

// Examples (when viewing iPhone 15):
// - "is this worth buying" → {"type":"product_question"}
// - "what's the price" → {"type":"product_question"}
// - "show similar phones" → {"type":"find_similar"}
// - "compare with samsung s24" → {"type":"compare","query":"samsung s24"}
// - "show me laptops" → {"type":"search_products","query":"laptop"}
// - "hi" → {"type":"general"}`;

//     try {
//       const result = await ai.models.generateContent({
//         model: MODEL_NAME,
//         contents: prompt,
//         config: {
//           temperature: 0.3,
//           maxOutputTokens: 256,
//         },
//       });
//       const text = result.text.trim();
//       const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
//       return JSON.parse(cleaned);
//     } catch (e) {
//       console.error("⚠️ Intent detection failed:", e.message);
//       return { type: "general" };
//     }
//   }

//   // ─────────────────────────────────────────
//   // 🔍 PRODUCT SEARCH
//   // ─────────────────────────────────────────
//   async searchProducts(query, filters = {}) {
//     const mongoQuery = { isActive: true };

//     if (query) {
//       mongoQuery.$or = [
//         { title: { $regex: query, $options: "i" } },
//         { description: { $regex: query, $options: "i" } },
//         { brand: { $regex: query, $options: "i" } },
//       ];
//     }

//     if (filters?.maxPrice) {
//       mongoQuery.minPrice = { ...(mongoQuery.minPrice || {}), $lte: filters.maxPrice, $gt: 0 };
//     }
//     if (filters?.minPrice) {
//       mongoQuery.minPrice = { ...(mongoQuery.minPrice || {}), $gte: filters.minPrice };
//     }
//     if (filters?.brand) {
//       mongoQuery.brand = { $regex: filters.brand, $options: "i" };
//     }

//     const products = await Product.find(mongoQuery)
//       .select("title images minPrice minMrpPrice brand averageRating numRatings category")
//       .sort({ averageRating: -1, minPrice: 1 })
//       .limit(10)
//       .lean();

//     console.log(`🔍 Found ${products.length} products for "${query}"`);
//     return products;
//   }

//   // ─────────────────────────────────────────
//   // 📦 ORDERS
//   // ─────────────────────────────────────────
//   async getUserOrders(userId, orderId = null) {
//     try {
//       const query = orderId ? { _id: orderId, user: userId } : { user: userId };
//       const orders = await Order.find(query)
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .lean();
//       console.log(`📦 Found ${orders.length} orders for user ${userId}`);
//       return orders;
//     } catch (e) {
//       console.error("Order fetch error:", e.message);
//       return [];
//     }
//   }

//   // ─────────────────────────────────────────
//   // 🛒 CART
//   // ─────────────────────────────────────────
//   async getUserCart(userId) {
//     try {
//       const cart = await Cart.findOne({ user: userId })
//         .populate({
//           path: "cartItems",
//           populate: { path: "product", select: "title images minPrice" }
//         })
//         .lean();
//       console.log("🛒 Cart:", cart ? `${cart.cartItems?.length || 0} items` : "empty");
//       return cart;
//     } catch (e) {
//       console.error("Cart fetch error:", e.message);
//       return null;
//     }
//   }

//   // ─────────────────────────────────────────
//   // 📝 CONTEXT BUILDERS
//   // ─────────────────────────────────────────
//   buildProductContext(products) {
//     if (products.length === 0) return "No products found matching the criteria.";
//     return `Found ${products.length} products:\n` +
//       products.slice(0, 5).map((p, i) =>
//         `${i + 1}. ${p.title} - ₹${p.minPrice?.toLocaleString("en-IN")} ${p.brand ? `(${p.brand})` : ""}`
//       ).join("\n");
//   }

//   buildOrderContext(orders) {
//     if (orders.length === 0) return "No orders found for this user. Their order history is empty.";
//     return `User's recent orders:\n` +
//       orders.map((o, i) =>
//         `${i + 1}. Order #${o._id.toString().slice(-6).toUpperCase()} | Status: ${o.orderStatus || "Processing"} | Total: ₹${(o.totalSellingPrice || 0).toLocaleString("en-IN")}`
//       ).join("\n");
//   }

//   buildCartContext(cart) {
//     if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
//       return "User's cart is currently empty.";
//     }
//     const items = cart.cartItems.map((ci, i) => {
//       const title = ci.product?.title || "Unknown product";
//       const qty = ci.quantity || 1;
//       const price = ci.product?.minPrice || 0;
//       return `${i + 1}. ${title} (Qty: ${qty}, ₹${price.toLocaleString("en-IN")})`;
//     }).join("\n");
//     return `User's cart has ${cart.cartItems.length} item(s) — Total: ₹${(cart.totalSellingPrice || 0).toLocaleString("en-IN")}\n\n${items}`;
//   }

//   // ─────────────────────────────────────────
//   // 🎭 SYSTEM PROMPT (product-aware)
//   // ─────────────────────────────────────────
//   buildSystemPrompt(context, intentType, hasCurrentProduct = false) {
//     const productAwareness = hasCurrentProduct
//       ? `\n🎯 IMPORTANT: The user is currently viewing a specific product page. 
// When they say "this", "it", "the product", or ask without specifying, they mean the PRODUCT shown in context.
// Always reference the product by name when relevant.\n`
//       : "";

//     return `You are Nexkart AI Assistant - a friendly, helpful e-commerce shopping assistant.

// PERSONALITY:
// - Friendly and conversational (use emojis occasionally 😊)
// - Concise responses (2-4 sentences max)
// - Helpful, honest, and proactive
// - Use Indian Rupees (₹) format (e.g., ₹1,000)
// ${productAwareness}
// CAPABILITIES:
// - Answer questions about the product user is viewing
// - Search products & find alternatives
// - Compare products
// - Track orders, view cart
// - Give buying advice (pros, cons, worth it)

// CONTEXT FROM DATABASE:
// ${context || "No specific context for this query."}

// RULES:
// - Answer based on the CONTEXT — don't invent prices/specs
// - For "is this worth buying" → give honest pros/cons + recommendation
// - For "find similar" → mention you've found alternatives (UI shows cards)
// - For "compare" → highlight key differences
// - If info isn't in context, say "I don't have that detail" + suggest contacting seller
// - Format prices in Indian style: ₹79,999 (not $79999)

// Current intent: ${intentType}`;
//   }

//   // ─────────────────────────────────────────
//   // 💬 GENERATE RESPONSE (NEW SDK)
//   // ─────────────────────────────────────────
//   async generateResponse(systemPrompt, userMessage, history = []) {
//     try {
//       const contents = [];

//       const validHistory = history.slice(-6)
//         .filter(h => h.message && h.message.trim().length > 0);
      
//       while (validHistory.length > 0 && validHistory[0].role !== "user") {
//         validHistory.shift();
//       }

//       validHistory.forEach(h => {
//         contents.push({
//           role: h.role === "user" ? "user" : "model",
//           parts: [{ text: h.message }],
//         });
//       });

//       contents.push({
//         role: "user",
//         parts: [{ text: userMessage }],
//       });

//       const result = await ai.models.generateContent({
//         model: MODEL_NAME,
//         contents: contents,
//         config: {
//           systemInstruction: systemPrompt,
//           temperature: 0.7,
//           maxOutputTokens: 1024,
//         },
//       });

//       return result.text;
//     } catch (error) {
//       console.error("❌ Generate response error:", error.message);
//       throw error;
//     }
//   }

//   // ─────────────────────────────────────────
//   // ❓ PRODUCT-SPECIFIC Q&A (kept for backward compat)
//   // ─────────────────────────────────────────
//   async askProductQuestion(productId, userQuestion) {
//     try {
//       const product = await Product.findById(productId)
//         .populate("category", "name")
//         .lean();
//       if (!product) return "Sorry, I couldn't find that product.";

//       const productInfo = `
// Title: ${product.title}
// Brand: ${product.brand || "N/A"}
// Price: ₹${product.minPrice || "N/A"}
// MRP: ₹${product.minMrpPrice || "N/A"}
// Description: ${product.description || "N/A"}
// Color: ${product.color || "N/A"}
// Sizes: ${product.sizes || "N/A"}
// Category: ${product.category?.name || "N/A"}
// Rating: ${product.averageRating || "Not rated"} (${product.numRatings || 0} reviews)
// Sellers: ${product.totalSellers || 1}
// `;

//       const prompt = `You are a helpful product expert. Answer the customer's question based ONLY on this product:

// ${productInfo}

// Customer question: ${userQuestion}

// Give a short, helpful answer (2-3 sentences). Use ₹ for prices. If info isn't available, say so honestly.`;

//       const result = await ai.models.generateContent({
//         model: MODEL_NAME,
//         contents: prompt,
//         config: { temperature: 0.7, maxOutputTokens: 512 },
//       });
//       return result.text;
//     } catch (error) {
//       console.error("Product Q&A error:", error.message);
//       return "Sorry, I'm having trouble answering that right now.";
//     }
//   }

//   // ─────────────────────────────────────────
//   // ✨ PRODUCT INSIGHTS
//   // ─────────────────────────────────────────
//   async getProductInsights(productId) {
//     try {
//       const product = await Product.findById(productId).lean();
//       if (!product) throw new Error("Product not found");

//       let reviews = [];
//       try {
//         const Review = require("../models/Review");
//         reviews = await Review.find({ product: productId })
//           .select("rating review")
//           .limit(20)
//           .lean();
//       } catch (e) {
//         console.log("⚠️ Reviews unavailable");
//       }

//       const productInfo = `
// Title: ${product.title}
// Brand: ${product.brand || "N/A"}
// Price: ₹${product.minPrice || "N/A"}
// MRP: ₹${product.minMrpPrice || "N/A"}
// Description: ${product.description || "N/A"}
// Color: ${product.color || "N/A"}
// Sizes: ${product.sizes || "N/A"}
// Rating: ${product.averageRating || "Not rated"} (${product.numRatings || 0} reviews)
// `;

//       const reviewsText = reviews.length > 0
//         ? reviews.map(r => `[${r.rating}⭐] ${r.review || ""}`).join("\n")
//         : "No reviews yet";

//       const prompt = `Analyze this product. Return ONLY valid JSON (no markdown).

// PRODUCT:
// ${productInfo}

// REVIEWS:
// ${reviewsText}

// Return:
// {
//   "summary": "2-line catchy summary",
//   "pros": ["pro1", "pro2", "pro3"],
//   "cons": ["con1", "con2"],
//   "bestFor": "Who would love this (1 line)",
//   "notFor": "Who should skip this (1 line)",
//   "buyRecommendation": "Strong Buy",
//   "buyReason": "1 line reason",
//   "isGoodGift": true,
//   "giftReason": "1 line why/why not",
//   "suggestedQuestions": ["q1", "q2", "q3", "q4"],
//   "keyFeatures": ["f1", "f2", "f3"],
//   "ratingBreakdown": { "quality": 4.5, "value": 4.0, "design": 4.2 }
// }

// NOTE: buyRecommendation must be one of: "Strong Buy", "Buy", "Consider", "Skip"`;

//       const result = await ai.models.generateContent({
//         model: MODEL_NAME,
//         contents: prompt,
//         config: { temperature: 0.5, maxOutputTokens: 1024 },
//       });
//       const cleaned = result.text.replace(/```json\n?|```/g, "").trim();
//       return JSON.parse(cleaned);
//     } catch (error) {
//       console.error("Insights error:", error.message);
//       return null;
//     }
//   }

//   // ─────────────────────────────────────────
//   // 🔄 COMPARE PRODUCTS
//   // ─────────────────────────────────────────
//   async compareProducts(productId1, productId2) {
//     try {
//       const [p1, p2] = await Promise.all([
//         Product.findById(productId1).lean(),
//         Product.findById(productId2).lean(),
//       ]);
//       if (!p1 || !p2) throw new Error("Product(s) not found");

//       const prompt = `Compare these 2 products. Return ONLY valid JSON.

// PRODUCT A: ${p1.title} - ₹${p1.minPrice} - ${p1.brand || "N/A"}
// PRODUCT B: ${p2.title} - ₹${p2.minPrice} - ${p2.brand || "N/A"}

// Return:
// {
//   "winner": "A",
//   "reason": "1 line",
//   "comparisonPoints": [
//     { "aspect": "Price", "a": "value", "b": "value", "winner": "A" }
//   ]
// }

// NOTE: winner must be "A", "B", or "Tie"`;

//       const result = await ai.models.generateContent({
//         model: MODEL_NAME,
//         contents: prompt,
//         config: { temperature: 0.5, maxOutputTokens: 512 },
//       });
//       const cleaned = result.text.replace(/```json\n?|```/g, "").trim();
//       return JSON.parse(cleaned);
//     } catch (error) {
//       console.error("Compare error:", error.message);
//       return null;
//     }
//   }
// }

// module.exports = new ChatbotService();




require("dotenv").config();
const Groq = require("groq-sdk");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ✅ Verify API key on startup
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
}

// ✅ Groq initialization (OpenAI-compatible, super fast!)
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY?.trim() 
});

const MODEL_NAME = "llama-3.3-70b-versatile"; // Best free model, GPT-4 quality

class ChatbotService {

  // ─────────────────────────────────────────
  // 🤖 MAIN SMART CHAT (with product context)
  // ─────────────────────────────────────────
  async smartChat({ message, userId, history = [], productId = null }) {
    try {
      console.log("💬 SmartChat — userId:", userId, "| productId:", productId, "| msg:", message);

      let currentProduct = null;
      if (productId) {
        currentProduct = await this.getCurrentProduct(productId);
        if (currentProduct) {
          console.log("📦 Product context loaded:", currentProduct.title);
        }
      }

      // 🚀 Quick rule-based intent (no API call!)
      let intent = this.quickIntentDetect(message, !!currentProduct);
      
      if (!intent) {
        intent = await this.detectIntent(message, currentProduct);
        console.log("🎯 Intent (AI):", intent);
      } else {
        console.log("⚡ Intent (rule-based):", intent);
      }

      let context = "";
      let products = [];
      let orders = [];
      let needsLogin = false;

      if (currentProduct && (intent.type === "product_question" || intent.type === "general")) {
        context = this.buildCurrentProductContext(currentProduct);
      }
      else if (intent.type === "search_products") {
        products = await this.searchProducts(intent.query, intent.filters);
        context = this.buildProductContext(products);
        if (currentProduct) {
          context = `USER IS CURRENTLY VIEWING:\n${this.buildCurrentProductContext(currentProduct)}\n\nSEARCH RESULTS:\n${context}`;
        }
      }
      else if (intent.type === "track_order") {
        if (!userId) {
          needsLogin = true;
          context = "User is NOT logged in. Politely ask them to login first to track orders.";
        } else {
          orders = await this.getUserOrders(userId, intent.orderId);
          context = this.buildOrderContext(orders);
        }
      }
      else if (intent.type === "view_cart") {
        if (!userId) {
          needsLogin = true;
          context = "User is NOT logged in. Politely ask them to login to view their cart.";
        } else {
          const cart = await this.getUserCart(userId);
          context = this.buildCartContext(cart);
        }
      }
      else if (intent.type === "find_similar" && currentProduct) {
        products = await this.findSimilarProducts(currentProduct);
        context = `USER IS VIEWING:\n${this.buildCurrentProductContext(currentProduct)}\n\nSIMILAR PRODUCTS FOUND:\n${this.buildProductContext(products)}`;
      }
      else if (intent.type === "compare" && currentProduct) {
        if (intent.query) {
          products = await this.searchProducts(intent.query, {});
          context = `USER WANTS TO COMPARE:\nCURRENT PRODUCT:\n${this.buildCurrentProductContext(currentProduct)}\n\nCOMPETITORS FOUND:\n${this.buildProductContext(products)}`;
        }
      }

      const systemPrompt = this.buildSystemPrompt(context, intent.type, !!currentProduct);
      const response = await this.generateResponse(systemPrompt, message, history);

      return {
        reply: response,
        intent: intent.type,
        products: products.slice(0, 5),
        orders: orders.slice(0, 3),
        needsLogin,
        currentProduct: currentProduct ? {
          _id: currentProduct._id,
          title: currentProduct.title,
        } : null,
      };

    } catch (error) {
      console.error("❌ Chatbot error:", error.message);
      
      if (error.status === 429) {
        return {
          reply: "I'm a bit overwhelmed right now! 😅 Please try again in a moment.",
          intent: "quota_error",
          products: [],
          orders: [],
        };
      }
      
      return {
        reply: "I'm having trouble right now. Please try again in a moment! 😔",
        intent: "error",
        products: [],
        orders: [],
      };
    }
  }

  // ─────────────────────────────────────────
  // ⚡ QUICK INTENT DETECTION (no API call!)
  // ─────────────────────────────────────────
  quickIntentDetect(message, hasProduct) {
    const lower = message.toLowerCase().trim();
    
    if (/^(hi|hello|hey|yo|hii+|hai|namaste|good\s*(morning|evening|night|afternoon))[\s!.?]*$/i.test(lower)) {
      return { type: "general" };
    }
    
    if (/^(thanks|thank\s*you|thx|ty|ok|okay|cool|great|nice|good|bye|goodbye)[\s!.?]*$/i.test(lower)) {
      return { type: "general" };
    }
    
    if (/\b(my\s*cart|in\s*cart|view\s*cart|show\s*cart|cart\s*items|my\s*bag|basket)\b/i.test(lower)) {
      return { type: "view_cart" };
    }
    
    if (/\b(my\s*order|track\s*order|delivery\s*status|where\s*is\s*my|order\s*status|shipped)\b/i.test(lower)) {
      return { type: "track_order" };
    }
    
    if (hasProduct) {
      if (/^(is\s*this|how\s*is\s*this|what\s*about\s*this|tell\s*me\s*about\s*this|describe\s*this)/i.test(lower) ||
          /\b(this|it|product)\b.*\b(worth|buy|price|spec|review|rating|good|bad|recommend|features?)\b/i.test(lower) ||
          /\b(worth|buy|price|spec|review|rating|recommend|features?)\b.*\b(this|it|product)\b/i.test(lower)) {
        return { type: "product_question" };
      }
    }
    
    if (/\b(similar|alternative|like\s*this|other\s*option|something\s*like)\b/i.test(lower)) {
      return { type: "find_similar" };
    }
    
    return null;
  }

  // ─────────────────────────────────────────
  // 🎯 GET CURRENT PRODUCT
  // ─────────────────────────────────────────
  async getCurrentProduct(productId) {
    try {
      if (!productId) return null;
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log("⚠️ Invalid productId format:", productId);
        return null;
      }

      const product = await Product.findById(productId)
        .populate("category", "name")
        .lean();
      
      if (!product) {
        console.log("⚠️ Product not found:", productId);
        return null;
      }

      console.log("✅ Product loaded:", product.title);
      return product;
    } catch (e) {
      console.error("❌ Product fetch error:", e.message);
      return null;
    }
  }

  // ─────────────────────────────────────────
  // 🔄 FIND SIMILAR PRODUCTS
  // ─────────────────────────────────────────
  async findSimilarProducts(currentProduct) {
    try {
      const query = {
        _id: { $ne: currentProduct._id },
        isActive: true,
        $or: [
          { category: currentProduct.category?._id || currentProduct.category },
          { brand: currentProduct.brand },
        ],
      };

      if (currentProduct.minPrice) {
        query.minPrice = { 
          $gte: currentProduct.minPrice * 0.7, 
          $lte: currentProduct.minPrice * 1.3 
        };
      }

      const products = await Product.find(query)
        .select("title images minPrice minMrpPrice brand averageRating numRatings category")
        .sort({ averageRating: -1 })
        .limit(5)
        .lean();

      console.log(`🔄 Found ${products.length} similar products`);
      return products;
    } catch (e) {
      console.error("Similar products error:", e.message);
      return [];
    }
  }

  // ─────────────────────────────────────────
  // 📝 BUILD CURRENT PRODUCT CONTEXT
  // ─────────────────────────────────────────
  buildCurrentProductContext(product) {
    if (!product) return "";
    
    const discount = product.minMrpPrice && product.minPrice
      ? Math.round(((product.minMrpPrice - product.minPrice) / product.minMrpPrice) * 100)
      : 0;

    return `
📦 PRODUCT DETAILS:
- Title: ${product.title}
- Brand: ${product.brand || "N/A"}
- Category: ${product.category?.name || "N/A"}
- Price: ₹${product.minPrice?.toLocaleString("en-IN") || "N/A"}
- MRP: ₹${product.minMrpPrice?.toLocaleString("en-IN") || "N/A"}
- Discount: ${discount}% OFF
- Color: ${product.color || "N/A"}
- Sizes: ${product.sizes || "N/A"}
- Description: ${product.description || "N/A"}
- Rating: ${product.averageRating || 0}/5 (${product.numRatings || 0} reviews)
- Available from ${product.totalSellers || 1} seller(s)
- Total Stock: ${product.totalStock || 0} units
`.trim();
  }

  // ─────────────────────────────────────────
  // 🧠 INTENT DETECTION (Groq)
  // ─────────────────────────────────────────
  async detectIntent(message, currentProduct = null) {
    const productContext = currentProduct
      ? `\nUSER IS CURRENTLY VIEWING: "${currentProduct.title}" (${currentProduct.brand || "no brand"})\nIf they say "this", "it", "the product", they mean THIS product.\n`
      : "";

    const prompt = `You are an intent classifier. Return ONLY a JSON object, no other text.
${productContext}
User message: "${message}"

Return JSON like:
{
  "type": "search_products" | "track_order" | "view_cart" | "product_question" | "find_similar" | "compare" | "general",
  "query": "search keywords",
  "filters": { "maxPrice": 50000, "minPrice": 0, "brand": "nike" },
  "orderId": "order id"
}

RULES:
- "product_question" → about CURRENT product
- "find_similar" → "show similar"
- "compare" → "compare with X"
- "search_products" → general search
- "general" → greetings`;

    try {
      const result = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 256,
        response_format: { type: "json_object" },
      });
      
      const text = result.choices[0].message.content.trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("⚠️ Intent detection failed:", e.message);
      return { type: "general" };
    }
  }

  // ─────────────────────────────────────────
  // 🔍 PRODUCT SEARCH
  // ─────────────────────────────────────────
  async searchProducts(query, filters = {}) {
    const mongoQuery = { isActive: true };

    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
      ];
    }

    if (filters?.maxPrice) {
      mongoQuery.minPrice = { ...(mongoQuery.minPrice || {}), $lte: filters.maxPrice, $gt: 0 };
    }
    if (filters?.minPrice) {
      mongoQuery.minPrice = { ...(mongoQuery.minPrice || {}), $gte: filters.minPrice };
    }
    if (filters?.brand) {
      mongoQuery.brand = { $regex: filters.brand, $options: "i" };
    }

    const products = await Product.find(mongoQuery)
      .select("title images minPrice minMrpPrice brand averageRating numRatings category")
      .sort({ averageRating: -1, minPrice: 1 })
      .limit(10)
      .lean();

    console.log(`🔍 Found ${products.length} products for "${query}"`);
    return products;
  }

  // ─────────────────────────────────────────
  // 📦 ORDERS
  // ─────────────────────────────────────────
  async getUserOrders(userId, orderId = null) {
    try {
      const query = orderId ? { _id: orderId, user: userId } : { user: userId };
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      console.log(`📦 Found ${orders.length} orders`);
      return orders;
    } catch (e) {
      console.error("Order fetch error:", e.message);
      return [];
    }
  }

  // ─────────────────────────────────────────
  // 🛒 CART
  // ─────────────────────────────────────────
  async getUserCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId })
        .populate({
          path: "cartItems",
          populate: { path: "product", select: "title images minPrice" }
        })
        .lean();
      console.log("🛒 Cart:", cart ? `${cart.cartItems?.length || 0} items` : "empty");
      return cart;
    } catch (e) {
      console.error("Cart fetch error:", e.message);
      return null;
    }
  }

  // ─────────────────────────────────────────
  // 📝 CONTEXT BUILDERS
  // ─────────────────────────────────────────
  buildProductContext(products) {
    if (products.length === 0) return "No products found.";
    return `Found ${products.length} products:\n` +
      products.slice(0, 5).map((p, i) =>
        `${i + 1}. ${p.title} - ₹${p.minPrice?.toLocaleString("en-IN")} ${p.brand ? `(${p.brand})` : ""}`
      ).join("\n");
  }

  buildOrderContext(orders) {
    if (orders.length === 0) return "No orders found.";
    return `User's recent orders:\n` +
      orders.map((o, i) =>
        `${i + 1}. Order #${o._id.toString().slice(-6).toUpperCase()} | Status: ${o.orderStatus || "Processing"} | Total: ₹${(o.totalSellingPrice || 0).toLocaleString("en-IN")}`
      ).join("\n");
  }

  buildCartContext(cart) {
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return "User's cart is currently empty.";
    }
    const items = cart.cartItems.map((ci, i) => {
      const title = ci.product?.title || "Unknown product";
      const qty = ci.quantity || 1;
      const price = ci.product?.minPrice || 0;
      return `${i + 1}. ${title} (Qty: ${qty}, ₹${price.toLocaleString("en-IN")})`;
    }).join("\n");
    return `User's cart has ${cart.cartItems.length} item(s) — Total: ₹${(cart.totalSellingPrice || 0).toLocaleString("en-IN")}\n\n${items}`;
  }

  // ─────────────────────────────────────────
  // 🎭 SYSTEM PROMPT
  // ─────────────────────────────────────────
  buildSystemPrompt(context, intentType, hasCurrentProduct = false) {
    const productAwareness = hasCurrentProduct
      ? `\n🎯 IMPORTANT: User is viewing a specific product. When they say "this", "it", they mean the product in CONTEXT below. Reference product by name.\n`
      : "";

    return `You are Nexkart AI Assistant - a friendly e-commerce shopping assistant.

PERSONALITY:
- Friendly and conversational (occasional emojis 😊)
- Concise (2-4 sentences max)
- Honest and helpful
- Use Indian Rupees (₹) format
${productAwareness}
CONTEXT FROM DATABASE:
${context || "No specific context."}

RULES:
- Answer based on CONTEXT — never invent prices/specs
- For "worth buying" → honest pros/cons + recommendation
- For "find similar" → mention alternatives (UI shows cards)
- Format prices Indian style: ₹79,999
- Keep responses SHORT and helpful

Current intent: ${intentType}`;
  }

  // ─────────────────────────────────────────
  // 💬 GENERATE RESPONSE (Groq)
  // ─────────────────────────────────────────
  async generateResponse(systemPrompt, userMessage, history = []) {
    try {
      const messages = [
        { role: "system", content: systemPrompt }
      ];

      const validHistory = history.slice(-6)
        .filter(h => h.message && h.message.trim().length > 0);
      
      validHistory.forEach(h => {
        messages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.message,
        });
      });

      messages.push({
        role: "user",
        content: userMessage,
      });

      const result = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return result.choices[0].message.content;
    } catch (error) {
      console.error("❌ Generate response error:", error.message);
      throw error;
    }
  }

  // ─────────────────────────────────────────
  // ❓ PRODUCT-SPECIFIC Q&A (backward compat)
  // ─────────────────────────────────────────
  async askProductQuestion(productId, userQuestion) {
    try {
      const product = await Product.findById(productId)
        .populate("category", "name")
        .lean();
      if (!product) return "Sorry, I couldn't find that product.";

      const productInfo = this.buildCurrentProductContext(product);
      const prompt = `Answer this in 2-3 sentences. Use ₹ for prices.\n\n${productInfo}\n\nQuestion: ${userQuestion}`;

      const result = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });
      return result.choices[0].message.content;
    } catch (error) {
      console.error("Product Q&A error:", error.message);
      return "Sorry, I'm having trouble answering that right now.";
    }
  }

  // ─────────────────────────────────────────
  // ✨ PRODUCT INSIGHTS
  // ─────────────────────────────────────────
  async getProductInsights(productId) {
    try {
      const product = await Product.findById(productId).lean();
      if (!product) throw new Error("Product not found");

      let reviews = [];
      try {
        const Review = require("../models/Review");
        reviews = await Review.find({ product: productId })
          .select("rating review")
          .limit(20)
          .lean();
      } catch (e) {}

      const productInfo = this.buildCurrentProductContext(product);
      const reviewsText = reviews.length > 0
        ? reviews.map(r => `[${r.rating}⭐] ${r.review || ""}`).join("\n")
        : "No reviews yet";

      const prompt = `Analyze this product. Return ONLY valid JSON.

PRODUCT:
${productInfo}

REVIEWS:
${reviewsText}

Return:
{
  "summary": "2-line catchy summary",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "bestFor": "Who would love this",
  "notFor": "Who should skip this",
  "buyRecommendation": "Strong Buy",
  "buyReason": "1 line reason",
  "isGoodGift": true,
  "giftReason": "why/why not",
  "suggestedQuestions": ["q1", "q2", "q3", "q4"],
  "keyFeatures": ["f1", "f2", "f3"],
  "ratingBreakdown": { "quality": 4.5, "value": 4.0, "design": 4.2 }
}

buyRecommendation must be one of: "Strong Buy", "Buy", "Consider", "Skip"`;

      const result = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });
      
      return JSON.parse(result.choices[0].message.content);
    } catch (error) {
      console.error("Insights error:", error.message);
      return null;
    }
  }

  // ─────────────────────────────────────────
  // 🔄 COMPARE PRODUCTS
  // ─────────────────────────────────────────
  async compareProducts(productId1, productId2) {
    try {
      const [p1, p2] = await Promise.all([
        Product.findById(productId1).lean(),
        Product.findById(productId2).lean(),
      ]);
      if (!p1 || !p2) throw new Error("Product(s) not found");

      const prompt = `Compare these 2 products. Return ONLY valid JSON.

PRODUCT A: ${p1.title} - ₹${p1.minPrice} - ${p1.brand || "N/A"}
PRODUCT B: ${p2.title} - ₹${p2.minPrice} - ${p2.brand || "N/A"}

Return:
{
  "winner": "A",
  "reason": "1 line",
  "comparisonPoints": [
    { "aspect": "Price", "a": "value", "b": "value", "winner": "A" }
  ]
}

winner must be "A", "B", or "Tie"`;

      const result = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });
      
      return JSON.parse(result.choices[0].message.content);
    } catch (error) {
      console.error("Compare error:", error.message);
      return null;
    }
  }
}

module.exports = new ChatbotService();