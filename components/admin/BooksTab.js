'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
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

import { Plus, Pencil, Trash2 } from 'lucide-react';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  // Handle debounced search
  useEffect(() => {
    const currentLimit = pagination?.limit || 10;
    if (debouncedSearchQuery.trim()) {
      if (debouncedSearchQuery.trim() !== searchQuery) {
        dispatch(setSearchQuery(debouncedSearchQuery.trim()));
        const params = {
          query: debouncedSearchQuery.trim(),
          page: 1,
          limit: currentLimit,
          ...(filters.category && { category: filters.category }),
          ...(filters.language && { language: filters.language }),
          ...(filters.availability && { availability: filters.availability }),
          ...(filters.sort && { sort: filters.sort }),
          ...(filters.order && { order: filters.order }),
        };
        dispatch(searchBooks(params));
      }
    } else if (debouncedSearchQuery === '' && searchQuery) {
      dispatch(setSearchQuery(''));
      const params = {
        page: 1,
        limit: currentLimit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  }, [dispatch, debouncedSearchQuery, filters, pagination?.limit, searchQuery]);

  // Fetch books on mount
  useEffect(() => {
    if (!searchQuery && !debouncedSearchQuery.trim()) {
      const currentPage = pagination?.page || 1;
      const currentLimit = pagination?.limit || 10;
      // Build params object with filters
      const params = {
        page: currentPage,
        limit: currentLimit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  }, [dispatch, filters.category, filters.language, filters.availability, filters.sort, filters.order, pagination?.page, pagination?.limit, searchQuery, debouncedSearchQuery]);


  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    const currentLimit = pagination?.limit || 10;
    const updatedFilters = { ...filters, [key]: value };
    const params = {
      page: 1,
      limit: currentLimit,
      ...(updatedFilters.category && { category: updatedFilters.category }),
      ...(updatedFilters.language && { language: updatedFilters.language }),
      ...(updatedFilters.availability && { availability: updatedFilters.availability }),
      ...(updatedFilters.sort && { sort: updatedFilters.sort }),
      ...(updatedFilters.order && { order: updatedFilters.order }),
    };
    dispatch(fetchBooks(params));
  };

  const handlePageChange = (newPage) => {
    const currentLimit = pagination?.limit || 10;
    if (searchQuery) {
      const params = {
        query: searchQuery,
        page: newPage,
        limit: currentLimit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(searchBooks(params));
    } else {
      const params = {
        page: newPage,
        limit: currentLimit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  };

  const handleSortChange = (sort, order) => {
    dispatch(setFilters({ sort, order }));
    const currentLimit = pagination?.limit || 10;
    const updatedFilters = { ...filters, sort, order };
    if (searchQuery) {
      const params = {
        query: searchQuery,
        page: 1,
        limit: currentLimit,
        ...(updatedFilters.category && { category: updatedFilters.category }),
        ...(updatedFilters.language && { language: updatedFilters.language }),
        ...(updatedFilters.availability && { availability: updatedFilters.availability }),
        sort: updatedFilters.sort,
        order: updatedFilters.order,
      };
      dispatch(searchBooks(params));
    } else {
      const params = {
        page: 1,
        limit: currentLimit,
        ...(updatedFilters.category && { category: updatedFilters.category }),
        ...(updatedFilters.language && { language: updatedFilters.language }),
        ...(updatedFilters.availability && { availability: updatedFilters.availability }),
        sort: updatedFilters.sort,
        order: updatedFilters.order,
      };
      dispatch(fetchBooks(params));
    }
  };

  const handleDeleteClick = (id, title) => {
    setBookToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    
    setIsDeleting(true);
    dispatch(clearError());
    const result = await dispatch(deleteBook(bookToDelete.id));
    
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setBookToDelete(null);
    
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
          <Plus size={18} strokeWidth={2} /> Add Book
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="books-controls">
          <div className="search-bar" style={{ position: 'relative', flex: 1, maxWidth: '100%' }}>
            <span style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999',
              fontSize: '1rem',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="form-input search-input"
              style={{ 
                paddingLeft: '40px', 
                paddingRight: localSearchQuery ? '40px' : '12px',
                width: '100%'
              }}
            />
            {localSearchQuery && (
              <button
                onClick={() => {
                  setLocalSearchQuery('');
                  dispatch(setSearchQuery(''));
                  const params = {
                    page: 1,
                    limit: pagination.limit,
                    ...(filters.category && { category: filters.category }),
                    ...(filters.language && { language: filters.language }),
                    ...(filters.availability && { availability: filters.availability }),
                    ...(filters.sort && { sort: filters.sort }),
                    ...(filters.order && { order: filters.order }),
                  };
                  dispatch(fetchBooks(params));
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </button>
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
                            <Pencil size={18} strokeWidth={2} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(book._id, book.title)}
                            title="Delete"
                          >
                            <Trash2 size={18} strokeWidth={2} />
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
        {pagination && pagination.pages > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexDirection:'column' }}>
            {pagination.pages > 1 ? (
              <Pagination
                currentPage={pagination.page || 1}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            ) : (
              <div style={{ padding: '0.5rem 1rem', color: '#666', fontSize: '0.875rem' }}>
                Page 1 of 1
              </div>
            )}
            <span className="pagination-info" style={{ color: '#666', fontSize: '0.875rem' }}>
              ({pagination.total || books.length} total)
            </span>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        message={bookToDelete ? `Are you sure you want to delete "${bookToDelete.title}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </Card>
  );
}

