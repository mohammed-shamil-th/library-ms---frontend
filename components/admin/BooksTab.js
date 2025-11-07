'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { showToast } from '@/components/ui/ToastContainer';
import {
  fetchBooks,
  fetchBookById,
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

const Plus = () => <span className="icon">+</span>;
const Search = () => <span className="icon">🔍</span>;
const Pencil = () => <span className="icon">✏️</span>;
const Trash2 = () => <span className="icon">🗑️</span>;

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

export default function BooksTab({ onAddBook, onEditBook }) {
  const dispatch = useDispatch();
  const books = useSelector(selectBooks);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const pagination = useSelector(selectBooksPagination);
  const filters = useSelector(selectBooksFilters);
  const searchQuery = useSelector(selectSearchQuery);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      if (debouncedSearchQuery.trim() !== searchQuery) {
        dispatch(setSearchQuery(debouncedSearchQuery.trim()));
        dispatch(searchBooks({ query: debouncedSearchQuery.trim(), ...filters, page: 1, limit: pagination.limit }));
      }
    } else if (debouncedSearchQuery === '' && searchQuery) {
      dispatch(setSearchQuery(''));
      dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
    }
  }, [dispatch, debouncedSearchQuery, filters, pagination.limit, searchQuery]);

  // Fetch books on mount and when filters/pagination change
  useEffect(() => {
    if (!searchQuery && !debouncedSearchQuery.trim()) {
      dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
    }
  }, [dispatch, filters, pagination.page, pagination.limit, searchQuery, debouncedSearchQuery]);

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

  const handleDeleteBook = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      dispatch(clearError());
      const result = await dispatch(deleteBook(id));
      
      if (deleteBook.fulfilled.match(result)) {
        showToast('Book deleted successfully!', 'success');
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

  const getAvailabilityStatus = (book) => {
    if (book.availableCopies === 0) return 'out_of_stock';
    if (book.availableCopies <= 2) return 'low_stock';
    return 'available';
  };

  return (
    <Card>
      <CardHeader className="card-header-with-action">
        <div>
          <CardTitle>Books</CardTitle>
          <CardDescription>Manage your library's book collection</CardDescription>
        </div>
        <Button onClick={onAddBook}>
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
          {loading ? (
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
                            onClick={() => onEditBook(book._id)}
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
  );
}

