import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '@/lib/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const fetchPopularBooks = createAsyncThunk(
  'dashboard/fetchPopularBooks',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getPopularBooks(limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch popular books'
      );
    }
  }
);

export const fetchActiveUsers = createAsyncThunk(
  'dashboard/fetchActiveUsers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getActiveUsers(limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active users'
      );
    }
  }
);

export const fetchBorrowingTrends = createAsyncThunk(
  'dashboard/fetchBorrowingTrends',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getBorrowingTrends(days);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch borrowing trends'
      );
    }
  }
);

const initialState = {
  stats: null,
  popularBooks: [],
  activeUsers: [],
  trends: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch popular books
      .addCase(fetchPopularBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.popularBooks = action.payload.data || [];
      })
      .addCase(fetchPopularBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch active users
      .addCase(fetchActiveUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeUsers = action.payload.data || [];
      })
      .addCase(fetchActiveUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch borrowing trends
      .addCase(fetchBorrowingTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowingTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.trends = action.payload.data || [];
      })
      .addCase(fetchBorrowingTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectPopularBooks = (state) => state.dashboard.popularBooks;
export const selectActiveUsers = (state) => state.dashboard.activeUsers;
export const selectBorrowingTrends = (state) => state.dashboard.trends;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;

