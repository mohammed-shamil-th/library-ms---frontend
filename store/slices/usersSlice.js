import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersAPI } from '@/lib/api';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'users/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUserStats(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user stats'
      );
    }
  }
);

const initialState = {
  profile: null,
  stats: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearProfile, clearStats } = usersSlice.actions;

// Selectors
export const selectProfile = (state) => state.users.profile;
export const selectUserStats = (state) => state.users.stats;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default usersSlice.reducer;

