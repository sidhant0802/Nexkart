import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

interface Message {
  role: "user" | "bot";
  message: string;
  products?: any[];
  orders?: any[];
  timestamp?: number;
}

interface AiChatBotState {
  loading: boolean;
  error: string | null;
  messages: Message[];
  isOpen: boolean;
}

const initialState: AiChatBotState = {
  loading: false,
  error: null,
  messages: [],
  isOpen: false,
};

// 🆕 Smart chat thunk
export const sendSmartMessage = createAsyncThunk<any, { message: string; history: Message[] }>(
  "aiChatBot/sendSmart",
  async ({ message, history }, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      
      const response = await api.post(
        "/chat/smart",
        { message, history },
        {
          headers: jwt 
            ? { 
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json" 
              } 
            : { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Chat error:", error.response?.data);
      return rejectWithValue(error.response?.data?.error || "Failed to get response");
    }
  }
);

// Product-specific question
export const askProductQuestion = createAsyncThunk<any, any>(
  "aiChatBot/askProductQuestion",
  async ({ productId, question }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ answer: string }>(
        `/chat/product/${productId}`,
        { question }
      );
      return response.data.answer;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to get answer");
    }
  }
);

const aiChatBotSlice = createSlice({
  name: "aiChatBot",
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Smart chat
      .addCase(sendSmartMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.messages.push({
          role: "user",
          message: action.meta.arg.message,
          timestamp: Date.now(),
        });
      })
      .addCase(sendSmartMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          role: "bot",
          message: action.payload.reply,
          products: action.payload.products || [],
          orders: action.payload.orders || [],
          timestamp: Date.now(),
        });
      })
      .addCase(sendSmartMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.messages.push({
          role: "bot",
          message: "Sorry, I'm having trouble. Please try again! 😔",
          timestamp: Date.now(),
        });
      })
      // Product Q&A
      .addCase(askProductQuestion.pending, (state, action) => {
        state.loading = true;
        state.messages.push({
          role: "user",
          message: action.meta.arg.question,
          timestamp: Date.now(),
        });
      })
      .addCase(askProductQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          role: "bot",
          message: action.payload,
          timestamp: Date.now(),
        });
      })
      .addCase(askProductQuestion.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { toggleChat, openChat, closeChat, clearMessages } = aiChatBotSlice.actions;
export default aiChatBotSlice.reducer;