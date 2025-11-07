import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoritesAPI } from '@/lib/api';

// Async thunks
export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.addFavorite(bookId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add favorite'
      );
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (favoriteId, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.removeFavorite(favoriteId);
      return { ...response, favoriteId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove favorite'
      );
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.getFavorites(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch favorites'
      );
    }
  }
);

export const toggleReadStatus = createAsyncThunk(
  'favorites/toggleReadStatus',
  async ({ favoriteId, isRead }, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.toggleReadStatus(favoriteId, isRead);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update read status'
      );
    }
  }
);

export const checkFavorite = createAsyncThunk(
  'favorites/checkFavorite',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.checkFavorite(bookId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check favorite'
      );
    }
  }
);

const initialState = {
  favorites: [],
  favoriteStatus: {}, // { bookId: { isFavorited: bool, favoriteId: string } }
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFavorites: (state) => {
      state.favorites = [];
      state.favoriteStatus = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Add favorite
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites.push(action.payload.data);
        const bookId = action.payload.data.book._id || action.payload.data.book;
        state.favoriteStatus[bookId] = {
          isFavorited: true,
          favoriteId: action.payload.data._id,
        };
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove favorite
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(
          (fav) => fav._id !== action.payload.favoriteId
        );
        // Find and remove from favoriteStatus
        Object.keys(state.favoriteStatus).forEach((bookId) => {
          if (state.favoriteStatus[bookId].favoriteId === action.payload.favoriteId) {
            delete state.favoriteStatus[bookId];
          }
        });
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.data || [];
        // Update favoriteStatus
        action.payload.data?.forEach((fav) => {
          const bookId = fav.book._id || fav.book;
          state.favoriteStatus[bookId] = {
            isFavorited: true,
            favoriteId: fav._id,
            isRead: fav.isRead,
          };
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle read status
      .addCase(toggleReadStatus.fulfilled, (state, action) => {
        const favorite = action.payload.data;
        const index = state.favorites.findIndex((f) => f._id === favorite._id);
        if (index !== -1) {
          state.favorites[index] = favorite;
        }
        const bookId = favorite.book._id || favorite.book;
        if (state.favoriteStatus[bookId]) {
          state.favoriteStatus[bookId].isRead = favorite.isRead;
        }
      })
      // Check favorite
      .addCase(checkFavorite.fulfilled, (state, action) => {
        const bookId = action.meta.arg;
        if (action.payload.data) {
          state.favoriteStatus[bookId] = {
            isFavorited: true,
            favoriteId: action.payload.data._id,
            isRead: action.payload.data.isRead,
          };
        } else {
          state.favoriteStatus[bookId] = {
            isFavorited: false,
          };
        }
      });
  },
});

export const { clearError, clearFavorites } = favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoriteStatus = (state) => state.favorites.favoriteStatus;
export const selectIsFavorited = (state, bookId) =>
  state.favorites.favoriteStatus[bookId]?.isFavorited || false;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesError = (state) => state.favorites.error;

export default favoritesSlice.reducer;

