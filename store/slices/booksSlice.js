import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { booksAPI } from '@/lib/api';

// Async thunks for API calls
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Support both 'query' (from old searchBooks) and 'search' parameter
      const apiParams = { ...params };
      if (apiParams.query) {
        apiParams.search = apiParams.query;
        delete apiParams.query;
      }
      
      const response = await booksAPI.getBooks(apiParams);
      // The API returns { success: true, data: [...], pagination: {...} }
      // booksAPI.getBooks already returns response.data, so response is the full object
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch books'
      );
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch book'
      );
    }
  }
);

export const addBook = createAsyncThunk(
  'books/addBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const response = await booksAPI.createBook(bookData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add book'
      );
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.updateBook(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update book'
      );
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await booksAPI.deleteBook(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete book'
      );
    }
  }
);

// searchBooks is deprecated - use fetchBooks with search parameter instead
// export const searchBooks = createAsyncThunk(
//   'books/searchBooks',
//   async ({ query, params = {} }, { rejectWithValue }) => {
//     try {
//       const response = await booksAPI.getBooks({ search: query, ...params });
//       return response;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to search books'
//       );
//     }
//   }
// );

export const updateBookStock = createAsyncThunk(
  'books/updateBookStock',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.updateBookStock(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update book stock'
      );
    }
  }
);

export const fetchRelatedBooks = createAsyncThunk(
  'books/fetchRelatedBooks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getRelatedBooks(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch related books'
      );
    }
  }
);

const initialState = {
  books: [],
  currentBook: null,
  relatedBooks: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    category: '',
    language: '',
    availability: '',
    sort: 'title',
    order: 'asc',
  },
  searchQuery: '',
  isSearching: false,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books (unified - handles both listing and search)
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.books = payload.data || [];
        
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
        
        // Set search query if it exists in params
        const searchParam = action.meta?.arg?.search || action.meta?.arg?.query;
        if (searchParam) {
          state.searchQuery = searchParam;
          state.isSearching = true;
        } else {
          // Only clear search if explicitly no search param
          if (action.meta?.arg?.search === '' || action.meta?.arg?.search === undefined) {
            state.isSearching = false;
          }
        }
        
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isSearching = false;
      })
      // Fetch Book By ID
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.unshift(action.payload.data || action.payload);
        state.error = null;
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.data || action.payload;
        const index = state.books.findIndex((b) => b._id === updatedBook._id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
        if (state.currentBook?._id === updatedBook._id) {
          state.currentBook = updatedBook;
        }
        state.error = null;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((b) => b._id !== action.payload);
        if (state.currentBook?._id === action.payload) {
          state.currentBook = null;
        }
        state.error = null;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Books - removed (now handled by fetchBooks)
      // Update Book Stock
      .addCase(updateBookStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookStock.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.data || action.payload;
        const index = state.books.findIndex((b) => b._id === updatedBook._id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
        state.error = null;
      })
      .addCase(updateBookStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Related Books
      .addCase(fetchRelatedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedBooks = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchRelatedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  setSearchQuery,
  resetFilters,
  clearCurrentBook,
} = booksSlice.actions;

// Selectors
export const selectBooks = (state) => state.books.books;
export const getselectBooks = (state) => state.books;
export const selectCurrentBook = (state) => state.books.currentBook;
export const selectRelatedBooks = (state) => state.books.relatedBooks;
export const selectBooksLoading = (state) => state.books.loading;
export const selectBooksError = (state) => state.books.error;
export const selectBooksPagination = (state) => state.books.pagination;
export const selectBooksFilters = (state) => state.books.filters;
export const selectSearchQuery = (state) => state.books.searchQuery;
export const selectIsSearching = (state) => state.books.isSearching;

export default booksSlice.reducer;

