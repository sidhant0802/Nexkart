import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export interface AppNotification {
  _id:           string;
  type:          'ORDER_STATUS' | 'NEW_MESSAGE' | 'RETURN_UPDATE' | 'ORDER_PLACED' | 'GENERAL';
  title:         string;
  message:       string;
  link:          string;
  read:          boolean;
  data?:         any;
  createdAt:     string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount:   number;
  loading:       boolean;
  error:         string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount:   0,
  loading:       false,
  error:         null,
};

export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.get('/api/notifications/user', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed');
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationIds?: string[]) => {
    const jwt = localStorage.getItem('jwt');
    await api.put(
      '/api/notifications/user/read',
      { notificationIds },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return notificationIds;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Called when socket emits notification:new
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchUserNotifications.pending,   (s) => { s.loading = true; })
      .addCase(fetchUserNotifications.fulfilled, (s, a: any) => {
        s.loading       = false;
        s.notifications = a.payload.notifications;
        s.unreadCount   = a.payload.unreadCount;
      })
      .addCase(fetchUserNotifications.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })
      .addCase(markNotificationsRead.fulfilled, (s, a) => {
        const ids = a.payload;
        if (ids?.length) {
          s.notifications = s.notifications.map((n) =>
            ids.includes(n._id) ? { ...n, read: true } : n
          );
        } else {
          s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
        }
        s.unreadCount = 0;
      });
  },
});

export const { addNotification, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;