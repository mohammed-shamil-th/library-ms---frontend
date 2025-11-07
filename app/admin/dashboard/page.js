'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import AdminRoute from '@/components/layout/AdminRoute';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import ToastContainer from '@/components/ui/ToastContainer';
import {
  fetchBooks,
  fetchBookById,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
  selectBooks,
  selectCurrentBook,
  selectBooksLoading,
  selectBooksError,
  selectBooksPagination,
  selectBooksFilters,
  selectSearchQuery,
  setFilters,
  setSearchQuery,
  clearError,
  clearCurrentBook,
} from '@/store/slices/booksSlice';
import {
  fetchAllBorrows,
  returnBook,
  selectAllBorrows,
  selectBorrowsLoading as selectBorrowsLoadingState,
  selectBorrowsPagination as selectBorrowsPaginationState,
  selectBorrowsFilters as selectBorrowsFiltersState,
  setFilters as setBorrowsFilters,
} from '@/store/slices/borrowsSlice';
import {
  fetchDashboardStats,
  fetchAllUsers,
  createBorrowAdmin,
  deleteBorrowAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  selectDashboardStats,
  selectUsers,
  selectUsersPagination,
  selectUsersFilters,
  selectAdminLoading,
  setUsersFilters,
} from '@/store/slices/adminSlice';

// Simple icon components
const BookOpen = () => <span className="icon">📚</span>;
const TrendingUp = () => <span className="icon">📈</span>;
const Clock = () => <span className="icon">⏰</span>;
const Users = () => <span className="icon">👥</span>;
const Plus = () => <span className="icon">+</span>;
const Pencil = () => <span className="icon">✏️</span>;
const Trash2 = () => <span className="icon">🗑️</span>;
const Search = () => <span className="icon">🔍</span>;

const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Philosophy',
  'Religion',
  'Art',
  'Literature',
  'Education',
  'Business',
  'Health',
  'Travel',
  'Cooking',
  'Sports',
  'Other',
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const books = useSelector(selectBooks);
  const currentBook = useSelector(selectCurrentBook);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const pagination = useSelector(selectBooksPagination);
  const filters = useSelector(selectBooksFilters);
  const searchQuery = useSelector(selectSearchQuery);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  // Admin state
  const dashboardStats = useSelector(selectDashboardStats);
  const allBorrows = useSelector(selectAllBorrows);
  const borrowsLoading = useSelector(selectBorrowsLoadingState);
  const borrowsPagination = useSelector(selectBorrowsPaginationState);
  const borrowsFilters = useSelector(selectBorrowsFiltersState);
  const users = useSelector(selectUsers);
  const usersPagination = useSelector(selectUsersPagination);
  const usersFilters = useSelector(selectUsersFilters);
  const adminLoading = useSelector(selectAdminLoading);

  // Statistics from API
  const totalBooks = dashboardStats?.totalBooks || pagination.total || 0;
  const activeBorrows = dashboardStats?.activeBorrows || 0;
  const overdueBorrows = dashboardStats?.overdueBooks || 0;
  const activeUsers = dashboardStats?.totalUsers || 0;

  // Additional state for borrows and users tabs
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [borrowFormData, setBorrowFormData] = useState({ bookId: '', userId: '' });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [borrowSearchQuery, setBorrowSearchQuery] = useState('');

  // Handle debounced search - automatically search when user stops typing
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      // Only update if the debounced value is different from current search query
      if (debouncedSearchQuery.trim() !== searchQuery) {
        dispatch(setSearchQuery(debouncedSearchQuery.trim()));
        dispatch(searchBooks({ query: debouncedSearchQuery.trim(), ...filters, page: 1, limit: pagination.limit }));
      }
    } else if (debouncedSearchQuery === '' && searchQuery) {
      // Clear search when input is cleared
      dispatch(setSearchQuery(''));
      dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearchQuery, filters, pagination.limit]);

  // Fetch books on mount and when filters/pagination change (when not searching)
  useEffect(() => {
    if (!searchQuery && !debouncedSearchQuery.trim()) {
      dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Fetch dashboard stats on mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Fetch borrows when filters change
  useEffect(() => {
    dispatch(fetchAllBorrows({ ...borrowsFilters, page: borrowsPagination.page, limit: 10 }));
  }, [dispatch, borrowsFilters, borrowsPagination.page]);

  // Fetch users when filters change
  useEffect(() => {
    const params = {
      ...usersFilters,
      page: usersPagination.page,
      limit: 10,
    };
    if (userSearchQuery.trim()) {
      params.search = userSearchQuery.trim();
    }
    dispatch(fetchAllUsers(params));
  }, [dispatch, usersFilters, usersPagination.page, userSearchQuery]);

  // Load book data when editing
  useEffect(() => {
    if (editingBookId && isModalOpen) {
      dispatch(fetchBookById(editingBookId));
    }
  }, [dispatch, editingBookId, isModalOpen]);

  // Populate form when currentBook is loaded
  useEffect(() => {
    if (currentBook && editingBookId && isModalOpen) {
      formik.setValues({
        title: currentBook.title || '',
        author: currentBook.author || '',
        isbn: currentBook.isbn || '',
        category: currentBook.category || 'Fiction',
        description: currentBook.description || '',
        totalCopies: currentBook.totalCopies || 1,
        availableCopies: currentBook.availableCopies || 1,
        publisher: currentBook.publisher || '',
        language: currentBook.language || 'English',
        publishedYear: currentBook.publishedYear || '',
        pages: currentBook.pages || '',
        coverImage: currentBook.coverImage || '',
      });
    }
  }, [currentBook, editingBookId, isModalOpen]);

  // Toast helper function
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Formik for add/edit book form
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: '',
      author: '',
      isbn: '',
      category: 'Fiction',
      description: '',
      totalCopies: 1,
      availableCopies: 1,
      publisher: '',
      language: 'English',
      publishedYear: '',
      pages: '',
      coverImage: '',
    },
    validate: (values) => {
      const errors = {};

      if (!values.title) errors.title = 'Title is required';
      if (!values.author) errors.author = 'Author is required';
      if (!values.isbn) {
        errors.isbn = 'ISBN is required';
      } else if (!/^\d{13}$/.test(values.isbn.replace(/-/g, ''))) {
        errors.isbn = 'ISBN must be exactly 13 digits';
      }
      if (!values.category) errors.category = 'Category is required';
      if (values.totalCopies < 1) errors.totalCopies = 'Total copies must be at least 1';
      if (values.availableCopies < 0) errors.availableCopies = 'Available copies cannot be negative';
      if (values.availableCopies > values.totalCopies) {
        errors.availableCopies = 'Available copies cannot exceed total copies';
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      dispatch(clearError());
      const bookData = {
        ...values,
        isbn: values.isbn.replace(/-/g, ''),
        totalCopies: parseInt(values.totalCopies) || 1,
        availableCopies: parseInt(values.availableCopies) || values.totalCopies,
        publishedYear: values.publishedYear ? parseInt(values.publishedYear) : undefined,
        pages: values.pages ? parseInt(values.pages) : undefined,
      };

      let result;
      if (editingBookId) {
        // Update book
        result = await dispatch(updateBook({ id: editingBookId, data: bookData }));
        if (updateBook.fulfilled.match(result)) {
          showToast('Book updated successfully!', 'success');
          setIsModalOpen(false);
          setEditingBookId(null);
          resetForm();
          dispatch(clearCurrentBook());
          // Refresh books list
          if (searchQuery) {
            dispatch(searchBooks({ query: searchQuery, ...filters, page: pagination.page, limit: pagination.limit }));
          } else {
            dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
          }
        } else {
          showToast(result.payload || 'Failed to update book', 'error');
        }
      } else {
        // Add book
        result = await dispatch(addBook(bookData));
        if (addBook.fulfilled.match(result)) {
          showToast('Book added successfully!', 'success');
          setIsModalOpen(false);
          resetForm();
          // Refresh books list
          if (searchQuery) {
            dispatch(searchBooks({ query: searchQuery, ...filters, page: 1, limit: pagination.limit }));
          } else {
            dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
          }
        } else {
          showToast(result.payload || 'Failed to add book', 'error');
        }
      }
      setSubmitting(false);
    },
  });

  const handleDeleteBook = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      dispatch(clearError());
      const result = await dispatch(deleteBook(id));
      
      if (deleteBook.fulfilled.match(result)) {
        showToast('Book deleted successfully!', 'success');
        // Refresh books list
        if (searchQuery) {
          dispatch(searchBooks({ query: searchQuery, ...filters, page: pagination.page, limit: pagination.limit }));
        } else {
          dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
        }
      } else {
        showToast(result.payload || 'Failed to delete book', 'error');
      }
    }
  };

  const handleEditBook = (bookId) => {
    setEditingBookId(bookId);
    setIsModalOpen(true);
  };

  const handleAddBook = () => {
    setEditingBookId(null);
    formik.resetForm();
    dispatch(clearCurrentBook());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBookId(null);
    formik.resetForm();
    dispatch(clearError());
    dispatch(clearCurrentBook());
  };

  // Search is now handled automatically via debounce, but keep manual search button for immediate search
  const handleSearch = useCallback(() => {
    if (localSearchQuery.trim()) {
      dispatch(setSearchQuery(localSearchQuery.trim()));
      dispatch(searchBooks({ query: localSearchQuery.trim(), ...filters, page: 1, limit: pagination.limit }));
    } else {
      dispatch(setSearchQuery(''));
      dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
    }
  }, [dispatch, localSearchQuery, filters, pagination.limit]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchBooks({ ...filters, [key]: value, page: 1, limit: pagination.limit }));
  };

  const handlePageChange = (newPage) => {
    if (searchQuery) {
      dispatch(searchBooks({ query: searchQuery, ...filters, page: newPage, limit: pagination.limit }));
    } else {
      dispatch(fetchBooks({ ...filters, page: newPage, limit: pagination.limit }));
    }
  };

  const handleSortChange = (sort, order) => {
    dispatch(setFilters({ sort, order }));
    if (searchQuery) {
      dispatch(searchBooks({ query: searchQuery, ...filters, sort, order, page: 1, limit: pagination.limit }));
    } else {
      dispatch(fetchBooks({ ...filters, sort, order, page: 1, limit: pagination.limit }));
    }
  };

  const getAvailabilityStatus = (book) => {
    if (book.availableCopies === 0) return 'out_of_stock';
    if (book.availableCopies <= 2) return 'low_stock';
    return 'available';
  };

  // Borrow management handlers
  const handleBorrowFilterChange = (key, value) => {
    dispatch(setBorrowsFilters({ [key]: value }));
    dispatch(fetchAllBorrows({ ...borrowsFilters, [key]: value, page: 1, limit: 10 }));
  };

  const handleBorrowPageChange = (page) => {
    dispatch(fetchAllBorrows({ ...borrowsFilters, page, limit: 10 }));
  };

  const handleReturnBorrow = async (borrowId) => {
    const result = await dispatch(returnBook(borrowId));
    if (returnBook.fulfilled.match(result)) {
      showToast('Book returned successfully!', 'success');
      dispatch(fetchAllBorrows({ ...borrowsFilters, page: borrowsPagination.page, limit: 10 }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to return book', 'error');
    }
  };

  const handleDeleteBorrow = async (borrowId) => {
    if (!confirm('Are you sure you want to delete this borrow record?')) return;
    const result = await dispatch(deleteBorrowAdmin(borrowId));
    if (deleteBorrowAdmin.fulfilled.match(result)) {
      showToast('Borrow record deleted successfully', 'success');
      dispatch(fetchAllBorrows({ ...borrowsFilters, page: borrowsPagination.page, limit: 10 }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to delete borrow record', 'error');
    }
  };

  const handleCreateBorrow = () => {
    setBorrowFormData({ bookId: '', userId: '' });
    setBorrowModalOpen(true);
  };

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    if (!borrowFormData.bookId || !borrowFormData.userId) {
      showToast('Please select both book and user', 'error');
      return;
    }
    const result = await dispatch(createBorrowAdmin({ bookId: borrowFormData.bookId, userId: borrowFormData.userId }));
    if (createBorrowAdmin.fulfilled.match(result)) {
      showToast('Book assigned successfully!', 'success');
      setBorrowModalOpen(false);
      dispatch(fetchAllBorrows({ ...borrowsFilters, page: 1, limit: 10 }));
      dispatch(fetchDashboardStats());
      dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
    } else {
      showToast(result.payload || 'Failed to assign book', 'error');
    }
  };

  // User management handlers
  const handleUserFilterChange = (key, value) => {
    dispatch(setUsersFilters({ [key]: value }));
    const params = {
      ...usersFilters,
      [key]: value,
      page: 1,
      limit: 10,
    };
    if (userSearchQuery.trim()) {
      params.search = userSearchQuery.trim();
    }
    dispatch(fetchAllUsers(params));
  };

  const handleUserPageChange = (page) => {
    const params = {
      ...usersFilters,
      page,
      limit: 10,
    };
    if (userSearchQuery.trim()) {
      params.search = userSearchQuery.trim();
    }
    dispatch(fetchAllUsers(params));
  };

  const handleEditUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    if (user) {
      setEditingUserId(userId);
      setUserModalOpen(true);
    }
  };

  const handleUpdateUser = async (userData) => {
    if (!editingUserId) return;
    const result = await dispatch(updateUserAdmin({ userId: editingUserId, userData }));
    if (updateUserAdmin.fulfilled.match(result)) {
      showToast('User updated successfully!', 'success');
      setUserModalOpen(false);
      setEditingUserId(null);
      dispatch(fetchAllUsers({ ...usersFilters, page: usersPagination.page, limit: 10, search: userSearchQuery.trim() || undefined }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    const result = await dispatch(deleteUserAdmin(userId));
    if (deleteUserAdmin.fulfilled.match(result)) {
      showToast('User deleted successfully', 'success');
      dispatch(fetchAllUsers({ ...usersFilters, page: usersPagination.page, limit: 10, search: userSearchQuery.trim() || undefined }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to delete user', 'error');
    }
  };

  const isEditMode = !!editingBookId;

  return (
    <AdminRoute>
      <div className="admin-dashboard">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="container">
          <h1 className="dashboard-title">Admin Dashboard</h1>

          <div className="stats-grid">
            <Card>
              <CardHeader className="stat-card-header">
                <CardTitle className="stat-card-title">Total Books</CardTitle>
                <BookOpen />
              </CardHeader>
              <CardContent>
                <div className="stat-value">{totalBooks}</div>
                <p className="stat-description">In library catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="stat-card-header">
                <CardTitle className="stat-card-title">Active Borrows</CardTitle>
                <TrendingUp />
              </CardHeader>
              <CardContent>
                <div className="stat-value">{activeBorrows}</div>
                <p className="stat-description">Currently borrowed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="stat-card-header">
                <CardTitle className="stat-card-title">Overdue Books</CardTitle>
                <Clock />
              </CardHeader>
              <CardContent>
                <div className="stat-value stat-value-danger">{overdueBorrows}</div>
                <p className="stat-description">Requires attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="stat-card-header">
                <CardTitle className="stat-card-title">Active Users</CardTitle>
                <Users />
              </CardHeader>
              <CardContent>
                <div className="stat-value">{activeUsers}</div>
                <p className="stat-description">Registered members</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="books" className="dashboard-tabs">
            <TabsList>
              <TabsTrigger value="books">
                Manage Books
              </TabsTrigger>
              <TabsTrigger value="borrows">
                Manage Borrows
              </TabsTrigger>
              <TabsTrigger value="users">
                Manage Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="books">
              <Card>
                <CardHeader className="card-header-with-action">
                  <div>
                    <CardTitle>Books</CardTitle>
                    <CardDescription>Manage your library's book collection</CardDescription>
                  </div>
                  <Button onClick={handleAddBook}>
                    <Plus /> Add Book
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="books-controls">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="form-input"
                      />
                      <Button onClick={handleSearch} variant="default">
                        <Search /> Search
                      </Button>
                      {(searchQuery || localSearchQuery) && (
                        <Button
                          onClick={() => {
                            setLocalSearchQuery('');
                            dispatch(setSearchQuery(''));
                            dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
                          }}
                          variant="outline"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <div className="filters-row">
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Categories</option>
                        {BOOK_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filters.availability}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Availability</option>
                        <option value="available">Available</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>

                      <select
                        value={`${filters.sort}-${filters.order}`}
                        onChange={(e) => {
                          const [sort, order] = e.target.value.split('-');
                          handleSortChange(sort, order);
                        }}
                        className="form-input"
                      >
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="author-asc">Author (A-Z)</option>
                        <option value="author-desc">Author (Z-A)</option>
                        <option value="year-desc">Year (Newest)</option>
                        <option value="year-asc">Year (Oldest)</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="error-alert">
                      {error}
                    </div>
                  )}

                  <div className="table-wrapper">
                    {loading && !currentBook ? (
                      <div className="loading-container" style={{ minHeight: '200px' }}>
                        <div className="loading-spinner"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Copies</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {books.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan="7" className="text-center">
                                {searchQuery ? 'No books found matching your search.' : 'No books found. Add your first book to get started.'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            books.map((book) => (
                              <TableRow key={book._id}>
                                <TableCell className="font-medium">
                                  <Link href={`/books/${book._id}`} className="book-title-link">
                                    {book.title}
                                  </Link>
                                </TableCell>
                                <TableCell>{book.author}</TableCell>
                                <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                                <TableCell>{book.category}</TableCell>
                                <TableCell>
                                  {book.availableCopies}/{book.totalCopies}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={getAvailabilityStatus(book)} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="action-buttons">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Edit"
                                      onClick={() => handleEditBook(book._id)}
                                    >
                                      <Pencil />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteBook(book._id, book.title)}
                                      title="Delete"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="pagination">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                      >
                        Previous
                      </Button>
                      <span className="pagination-info">
                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="borrows">
              <Card>
                <CardHeader className="card-header-with-action">
                  <div>
                    <CardTitle>Borrow Records</CardTitle>
                    <CardDescription>Manage active and overdue borrows</CardDescription>
                  </div>
                  {/* <Button onClick={handleCreateBorrow}>
                    <Plus /> Assign Book
                  </Button> */}
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="books-controls">
                    <div className="filters-row">
                      <select
                        value={borrowsFilters.status || ''}
                        onChange={(e) => handleBorrowFilterChange('status', e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Status</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    {borrowsLoading ? (
                      <div className="loading-container" style={{ minHeight: '200px' }}>
                        <div className="loading-spinner"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Book</TableHead>
                            <TableHead>Borrow Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fine</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allBorrows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan="8" className="text-center">
                                No borrow records found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            allBorrows.map((borrow) => (
                              <TableRow key={borrow._id}>
                                <TableCell>
                                  {borrow.user?.name || 'Unknown User'}
                                  <br />
                                  <small style={{ color: '#666' }}>{borrow.user?.email}</small>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/books/${borrow.book?._id}`} className="book-title-link">
                                    {borrow.book?.title || 'Unknown Book'}
                                  </Link>
                                  <br />
                                  <small style={{ color: '#666' }}>by {borrow.book?.author || 'Unknown Author'}</small>
                                </TableCell>
                                <TableCell>{new Date(borrow.borrowDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell>{borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                  <StatusBadge
                                    status={borrow.status}
                                    variant={
                                      borrow.status === 'returned'
                                        ? 'success'
                                        : borrow.status === 'overdue'
                                        ? 'danger'
                                        : 'default'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {borrow.fine > 0 ? (
                                    <span className="text-danger">${borrow.fine.toFixed(2)}</span>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="action-buttons">
                                    {borrow.status !== 'returned' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReturnBorrow(borrow._id)}
                                        title="Mark as Returned"
                                      >
                                        Return
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteBorrow(borrow._id)}
                                      title="Delete"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Pagination */}
                  {borrowsPagination.pages > 1 && (
                    <div className="pagination">
                      <Button
                        variant="outline"
                        onClick={() => handleBorrowPageChange(borrowsPagination.page - 1)}
                        disabled={borrowsPagination.page === 1 || borrowsLoading}
                      >
                        Previous
                      </Button>
                      <span className="pagination-info">
                        Page {borrowsPagination.page} of {borrowsPagination.pages} ({borrowsPagination.total} total)
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handleBorrowPageChange(borrowsPagination.page + 1)}
                        disabled={borrowsPagination.page >= borrowsPagination.pages || borrowsLoading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage library members</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="books-controls">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="form-input"
                      />
                      {userSearchQuery && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUserSearchQuery('');
                            dispatch(fetchAllUsers({ ...usersFilters, page: 1, limit: 10 }));
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="filters-row">
                      <select
                        value={usersFilters.role || ''}
                        onChange={(e) => handleUserFilterChange('role', e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        value={usersFilters.isActive || ''}
                        onChange={(e) => handleUserFilterChange('isActive', e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    {adminLoading ? (
                      <div className="loading-container" style={{ minHeight: '200px' }}>
                        <div className="loading-spinner"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Max Books</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Member Since</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan="7" className="text-center">
                                {userSearchQuery ? 'No users found matching your search.' : 'No users found.'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow key={user._id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <StatusBadge
                                    status={user.role}
                                    variant={user.role === 'admin' ? 'warning' : 'default'}
                                  />
                                </TableCell>
                                <TableCell>{user.maxBooksAllowed || 3}</TableCell>
                                <TableCell>
                                  <StatusBadge
                                    status={user.isActive ? 'active' : 'inactive'}
                                    variant={user.isActive ? 'success' : 'danger'}
                                  />
                                </TableCell>
                                <TableCell>{new Date(user.membershipDate || user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="action-buttons">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Edit"
                                      onClick={() => handleEditUser(user._id)}
                                    >
                                      <Pencil />
                                    </Button>
                                    {user.role !== 'admin' && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                        title="Delete"
                                      >
                                        <Trash2 />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Pagination */}
                  {usersPagination.pages > 1 && (
                    <div className="pagination">
                      <Button
                        variant="outline"
                        onClick={() => handleUserPageChange(usersPagination.page - 1)}
                        disabled={usersPagination.page === 1 || adminLoading}
                      >
                        Previous
                      </Button>
                      <span className="pagination-info">
                        Page {usersPagination.page} of {usersPagination.pages} ({usersPagination.total} total)
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handleUserPageChange(usersPagination.page + 1)}
                        disabled={usersPagination.page >= usersPagination.pages || adminLoading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add/Edit Book Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={isEditMode ? 'Edit Book' : 'Add New Book'}
          description={isEditMode ? 'Update the book details' : 'Enter the details of the new book'}
        >
          <form onSubmit={formik.handleSubmit} className="modal-form">
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            {isEditMode && loading && (
              <div className="loading-container" style={{ minHeight: '100px' }}>
                <div className="loading-spinner"></div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`form-input ${formik.touched.title && formik.errors.title ? 'input-error' : ''}`}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="error-text">{formik.errors.title}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  id="author"
                  type="text"
                  name="author"
                  value={formik.values.author}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`form-input ${formik.touched.author && formik.errors.author ? 'input-error' : ''}`}
                />
                {formik.touched.author && formik.errors.author && (
                  <div className="error-text">{formik.errors.author}</div>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="isbn">ISBN * (13 digits)</label>
                <input
                  id="isbn"
                  type="text"
                  name="isbn"
                  value={formik.values.isbn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={17}
                  placeholder="1234567890123"
                  disabled={isEditMode}
                  className={`form-input ${formik.touched.isbn && formik.errors.isbn ? 'input-error' : ''} ${isEditMode ? 'input-disabled' : ''}`}
                />
                {formik.touched.isbn && formik.errors.isbn && (
                  <div className="error-text">{formik.errors.isbn}</div>
                )}
                {isEditMode && (
                  <div className="form-hint">ISBN cannot be changed after creation</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`form-input ${formik.touched.category && formik.errors.category ? 'input-error' : ''}`}
                >
                  {BOOK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                  <div className="error-text">{formik.errors.category}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows="3"
                className="form-input"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="totalCopies">Total Copies *</label>
                <input
                  id="totalCopies"
                  type="number"
                  name="totalCopies"
                  value={formik.values.totalCopies}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1"
                  className={`form-input ${formik.touched.totalCopies && formik.errors.totalCopies ? 'input-error' : ''}`}
                />
                {formik.touched.totalCopies && formik.errors.totalCopies && (
                  <div className="error-text">{formik.errors.totalCopies}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="availableCopies">Available Copies</label>
                <input
                  id="availableCopies"
                  type="number"
                  name="availableCopies"
                  value={formik.values.availableCopies}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  max={formik.values.totalCopies}
                  className={`form-input ${formik.touched.availableCopies && formik.errors.availableCopies ? 'input-error' : ''}`}
                />
                {formik.touched.availableCopies && formik.errors.availableCopies && (
                  <div className="error-text">{formik.errors.availableCopies}</div>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="publisher">Publisher</label>
                <input
                  id="publisher"
                  type="text"
                  name="publisher"
                  value={formik.values.publisher}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <input
                  id="language"
                  type="text"
                  name="language"
                  value={formik.values.language}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="publishedYear">Published Year</label>
                <input
                  id="publishedYear"
                  type="number"
                  name="publishedYear"
                  value={formik.values.publishedYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pages">Pages</label>
                <input
                  id="pages"
                  type="number"
                  name="pages"
                  value={formik.values.pages}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image URL</label>
              <input
                id="coverImage"
                type="url"
                name="coverImage"
                value={formik.values.coverImage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="https://example.com/image.jpg"
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={formik.isSubmitting || loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting || loading}>
                {formik.isSubmitting || loading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Adding...'
                  : isEditMode
                  ? 'Update Book'
                  : 'Add Book'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Assign Book Modal */}
        <Modal
          isOpen={borrowModalOpen}
          onClose={() => {
            setBorrowModalOpen(false);
            setBorrowFormData({ bookId: '', userId: '' });
          }}
          title="Assign Book to User"
        >
          <form onSubmit={handleSubmitBorrow}>
            <div className="form-group">
              <label htmlFor="borrow-book">Select Book *</label>
              <select
                id="borrow-book"
                value={borrowFormData.bookId}
                onChange={(e) => setBorrowFormData({ ...borrowFormData, bookId: e.target.value })}
                className="form-input"
                required
              >
                <option value="">-- Select Book --</option>
                {books
                  .filter((book) => book.availableCopies > 0)
                  .map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} by {book.author} (Available: {book.availableCopies})
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="borrow-user">Select User *</label>
              <select
                id="borrow-user"
                value={borrowFormData.userId}
                onChange={(e) => setBorrowFormData({ ...borrowFormData, userId: e.target.value })}
                className="form-input"
                required
              >
                <option value="">-- Select User --</option>
                {users
                  .filter((user) => user.role === 'user' && user.isActive)
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>
            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBorrowModalOpen(false);
                  setBorrowFormData({ bookId: '', userId: '' });
                }}
                disabled={adminLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adminLoading}>
                {adminLoading ? 'Assigning...' : 'Assign Book'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={userModalOpen}
          onClose={() => {
            setUserModalOpen(false);
            setEditingUserId(null);
          }}
          title="Edit User"
        >
          {editingUserId && (() => {
            const user = users.find((u) => u._id === editingUserId);
            if (!user) return null;
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleUpdateUser({
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    maxBooksAllowed: parseInt(formData.get('maxBooksAllowed')) || 3,
                    isActive: formData.get('isActive') === 'true',
                    role: formData.get('role'),
                  });
                }}
              >
                <div className="form-group">
                  <label htmlFor="user-name">Name *</label>
                  <input
                    id="user-name"
                    type="text"
                    name="name"
                    defaultValue={user.name}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="user-email">Email</label>
                  <input
                    id="user-email"
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="user-phone">Phone</label>
                  <input
                    id="user-phone"
                    type="tel"
                    name="phone"
                    defaultValue={user.phone || ''}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="user-address">Address</label>
                  <textarea
                    id="user-address"
                    name="address"
                    defaultValue={user.address || ''}
                    className="form-input"
                    rows="3"
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="user-maxBooks">Max Books Allowed *</label>
                    <input
                      id="user-maxBooks"
                      type="number"
                      name="maxBooksAllowed"
                      defaultValue={user.maxBooksAllowed || 3}
                      min="1"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-role">Role *</label>
                    <select
                      id="user-role"
                      name="role"
                      defaultValue={user.role}
                      className="form-input"
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="user-isActive">Status *</label>
                  <select
                    id="user-isActive"
                    name="isActive"
                    defaultValue={user.isActive ? 'true' : 'false'}
                    className="form-input"
                    required
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUserModalOpen(false);
                      setEditingUserId(null);
                    }}
                    disabled={adminLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adminLoading}>
                    {adminLoading ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </form>
            );
          })()}
        </Modal>
      </div>
    </AdminRoute>
  );
}
