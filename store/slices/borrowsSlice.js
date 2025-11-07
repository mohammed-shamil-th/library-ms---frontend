import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { borrowsAPI } from '@/lib/api';

// Async thunks
export const borrowBook = createAsyncThunk(
  'borrows/borrowBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.borrowBook(bookId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to borrow book'
      );
    }
  }
);

export const returnBook = createAsyncThunk(
  'borrows/returnBook',
  async (borrowId, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.returnBook(borrowId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to return book'
      );
    }
  }
);

export const fetchActiveBorrows = createAsyncThunk(
  'borrows/fetchActiveBorrows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.getActiveBorrows();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active borrows'
      );
    }
  }
);

export const fetchAllBorrows = createAsyncThunk(
  'borrows/fetchAllBorrows',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.getAllBorrows(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch borrows'
      );
    }
  }
);

export const fetchBorrowHistory = createAsyncThunk(
  'borrows/fetchBorrowHistory',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.getBorrowHistory(userId, params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch borrow history'
      );
    }
  }
);

export const fetchOverdueBorrows = createAsyncThunk(
  'borrows/fetchOverdueBorrows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.getOverdueBorrows();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch overdue borrows'
      );
    }
  }
);

const initialState = {
  activeBorrows: [],
  allBorrows: [],
  borrowHistory: [],
  overdueBorrows: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    status: '',
  },
};

const borrowsSlice = createSlice({
  name: 'borrows',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { status: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Borrow book
      .addCase(borrowBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBorrows.push(action.payload.data);
      })
      .addCase(borrowBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Return book
      .addCase(returnBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBorrows = state.activeBorrows.filter(
          (borrow) => borrow._id !== action.payload.data._id
        );
        state.allBorrows = state.allBorrows.map((borrow) =>
          borrow._id === action.payload.data._id ? action.payload.data : borrow
        );
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch active borrows
      .addCase(fetchActiveBorrows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBorrows.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBorrows = action.payload.data || [];
      })
      .addCase(fetchActiveBorrows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all borrows
      .addCase(fetchAllBorrows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBorrows.fulfilled, (state, action) => {
        state.loading = false;
        state.allBorrows = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllBorrows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch borrow history
      .addCase(fetchBorrowHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.borrowHistory = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchBorrowHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch overdue borrows
      .addCase(fetchOverdueBorrows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverdueBorrows.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueBorrows = action.payload.data || [];
      })
      .addCase(fetchOverdueBorrows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, resetFilters } = borrowsSlice.actions;

// Selectors
export const selectActiveBorrows = (state) => state.borrows.activeBorrows;
export const selectAllBorrows = (state) => state.borrows.allBorrows;
export const selectBorrowHistory = (state) => state.borrows.borrowHistory;
export const selectOverdueBorrows = (state) => state.borrows.overdueBorrows;
export const selectBorrowsLoading = (state) => state.borrows.loading;
export const selectBorrowsError = (state) => state.borrows.error;
export const selectBorrowsPagination = (state) => state.borrows.pagination;
export const selectBorrowsFilters = (state) => state.borrows.filters;

export default borrowsSlice.reducer;

