import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '@/lib/api';
import { borrowsAPI } from '@/lib/api';
import { usersAPI } from '@/lib/api';

// Dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
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

// Admin borrow management
export const createBorrowAdmin = createAsyncThunk(
  'admin/createBorrowAdmin',
  async ({ bookId, userId }, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.createBorrowAdmin(bookId, userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create borrow record'
      );
    }
  }
);

export const deleteBorrowAdmin = createAsyncThunk(
  'admin/deleteBorrowAdmin',
  async (borrowId, { rejectWithValue }) => {
    try {
      const response = await borrowsAPI.deleteBorrow(borrowId);
      return { ...response, borrowId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete borrow record'
      );
    }
  }
);

// Admin user management
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getAllUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const updateUserAdmin = createAsyncThunk(
  'admin/updateUserAdmin',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUserAdmin = createAsyncThunk(
  'admin/deleteUserAdmin',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await usersAPI.deleteUser(userId);
      return { ...response, userId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

const initialState = {
  dashboardStats: null,
  users: [],
  usersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  usersFilters: {
    search: '',
    role: '',
    isActive: '',
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUsersFilters: (state, action) => {
      state.usersFilters = { ...state.usersFilters, ...action.payload };
    },
    resetUsersFilters: (state) => {
      state.usersFilters = { search: '', role: '', isActive: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create borrow admin
      .addCase(createBorrowAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBorrowAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBorrowAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete borrow admin
      .addCase(deleteBorrowAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBorrowAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteBorrowAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        if (action.payload.pagination) {
          state.usersPagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user admin
      .addCase(updateUserAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user admin
      .addCase(deleteUserAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.userId);
        state.usersPagination.total -= 1;
      })
      .addCase(deleteUserAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUsersFilters, resetUsersFilters } = adminSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.admin.dashboardStats;
export const selectUsers = (state) => state.admin.users;
export const selectUsersPagination = (state) => state.admin.usersPagination;
export const selectUsersFilters = (state) => state.admin.usersFilters;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;

