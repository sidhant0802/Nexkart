import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export interface ChatMessage {
  _id:       string;
  sender:    'user' | 'seller';
  senderId:  string;
  text:      string;
  mediaUrl:  string | null;
  mediaType: 'image' | 'video' | null;
  read:      boolean;
  createdAt: string;
}

export interface Chat {
  _id:           string;
  order:         string;
  user:          any;
  seller:        any;
  messages:      ChatMessage[];
  lastMessage:   string;
  lastMessageAt: string;
  userUnread:    number;
  sellerUnread:  number;
}

interface ChatState {
  chat:     Chat | null;
  allChats: any[];
  loading:  boolean;
  sending:  boolean;
  error:    string | null;
}

const initialState: ChatState = {
  chat:     null,
  allChats: [],
  loading:  false,
  sending:  false,
  error:    null,
};

// ── Helper: deduplicate messages by _id ──────────────────────
const dedup = (messages: ChatMessage[]): ChatMessage[] => {
  const seen = new Set<string>();
  return messages.filter((m) => {
    // Messages without _id (optimistic) always keep
    if (!m._id) return true;
    if (seen.has(m._id)) return false;
    seen.add(m._id);
    return true;
  });
};

// ── Thunks ───────────────────────────────────────────────────

export const fetchOrCreateChat = createAsyncThunk<Chat, string>(
  'chat/fetchOrCreate',
  async (orderId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.get(`/api/chat/order/${orderId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to load chat');
    }
  }
);

export const sendChatMessage = createAsyncThunk<
  { message: ChatMessage; chat: Chat },
  { orderId: string; text: string; mediaFile?: File | null }
>(
  'chat/sendMessage',
  async ({ orderId, text, mediaFile }, { rejectWithValue }) => {
    try {
      const jwt      = localStorage.getItem('jwt');
      const formData = new FormData();
      if (text)      formData.append('text', text);
      if (mediaFile) formData.append('media', mediaFile);

      const res = await api.post(
        `/api/chat/order/${orderId}/message`,
        formData,
        {
          headers: {
            Authorization:  `Bearer ${jwt}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.get('/api/chat/user/all', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue('Failed to fetch chats');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {

    // ✅ Called from socket — deduplicate before adding
    receiveMessage: (
      state,
      action: PayloadAction<{ orderId: string; message: ChatMessage }>
    ) => {
      if (!state.chat) return;
      if (state.chat.order !== action.payload.orderId) return;

      const incoming = action.payload.message;

      // ✅ Check duplicate by _id
      const alreadyExists = state.chat.messages.some(
        (m) => m._id && m._id === incoming._id
      );
      if (alreadyExists) return;

      state.chat.messages.push(incoming);
      state.chat.lastMessage   = incoming.text || 'Media';
      state.chat.lastMessageAt = incoming.createdAt;
    },

    clearChat: (state) => {
      state.chat    = null;
      state.error   = null;
      state.sending = false;
    },

    // ✅ Mark messages as read locally
    markMessagesRead: (state) => {
      if (!state.chat) return;
      state.chat.messages = state.chat.messages.map((m) =>
        m.sender === 'seller' ? { ...m, read: true } : m
      );
      state.chat.userUnread = 0;
    },
  },

  extraReducers: (b) => {
    b
      // ── fetchOrCreateChat ──────────────────────────────────
      .addCase(fetchOrCreateChat.pending, (s) => {
        s.loading = true;
        s.error   = null;
      })
      .addCase(fetchOrCreateChat.fulfilled, (s, a) => {
        s.loading = false;
        // ✅ Deduplicate messages from server too
        s.chat = {
          ...a.payload,
          messages: dedup(a.payload.messages || []),
        };
      })
      .addCase(fetchOrCreateChat.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // ── sendChatMessage ────────────────────────────────────
      .addCase(sendChatMessage.pending, (s) => {
        s.sending = true;
        s.error   = null;
      })
      .addCase(sendChatMessage.fulfilled, (s, a) => {
        s.sending = false;
        if (!s.chat) return;

        const newMsg = a.payload.message;

        // ✅ Only add if not already in messages (socket may have added it)
        const alreadyExists = s.chat.messages.some(
          (m) => m._id && m._id === newMsg._id
        );
        if (!alreadyExists) {
          s.chat.messages.push(newMsg);
          s.chat.lastMessage   = newMsg.text || 'Media';
          s.chat.lastMessageAt = newMsg.createdAt;
        }
      })
      .addCase(sendChatMessage.rejected, (s, a) => {
        s.sending = false;
        s.error   = a.payload as string;
      })

      // ── fetchUserChats ─────────────────────────────────────
      .addCase(fetchUserChats.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUserChats.fulfilled, (s, a) => {
        s.loading  = false;
        s.allChats = a.payload;
      })
      .addCase(fetchUserChats.rejected, (s) => {
        s.loading = false;
      });
  },
});

export const {
  receiveMessage,
  clearChat,
  markMessagesRead,
} = chatSlice.actions;

export default chatSlice.reducer;