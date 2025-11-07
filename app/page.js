'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';
import { fetchBooks, searchBooks, setFilters, setSearchQuery } from '@/store/slices/booksSlice';
import { selectBooks, selectBooksLoading, selectBooksPagination, selectBooksFilters, selectSearchQuery } from '@/store/slices/booksSlice';
import { useDebounce } from '@/hooks/useDebounce';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const books = useSelector(selectBooks);
  const loading = useSelector(selectBooksLoading);
  const pagination = useSelector(selectBooksPagination);
  const filters = useSelector(selectBooksFilters);
  const searchQuery = useSelector(selectSearchQuery);
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    // Fetch books on mount
    dispatch(fetchBooks({ ...filters, page: 1, limit: 12 }));
  }, [dispatch, isAuthenticated, isAdmin, router]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      dispatch(setSearchQuery(debouncedSearchQuery.trim()));
      dispatch(searchBooks({ 
        query: debouncedSearchQuery.trim(),
        ...filters, 
        page: 1, 
        limit: 12 
      }));
    } else if (debouncedSearchQuery === '' && searchQuery) {
      dispatch(setSearchQuery(''));
      dispatch(fetchBooks({ ...filters, page: 1, limit: 12 }));
    }
  }, [dispatch, debouncedSearchQuery, filters, searchQuery]);

  // Fetch books when filters change
  useEffect(() => {
    if (!debouncedSearchQuery.trim() && !searchQuery) {
      dispatch(fetchBooks({ ...filters, page: pagination.page, limit: 12 }));
    }
  }, [dispatch, filters, pagination.page]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchBooks({ ...filters, [key]: value, page: 1, limit: 12 }));
  };

  const handleSortChange = (sortBy) => {
    dispatch(setFilters({ sortBy }));
    dispatch(fetchBooks({ ...filters, sortBy, page: 1, limit: 12 }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchBooks({ ...filters, page, limit: 12 }));
  };

  const handleBookClick = (bookId) => {
    router.push(`/books/${bookId}`);
  };

  // Don't render if admin (will be redirected)
  if (isAuthenticated && isAdmin) {
    return null;
  }

  return (
    <div className="home-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Hero Section */}
        <div className="home-hero-section">
          <h1 className="home-hero-title">Discover Your Next Great Read</h1>
          <p className="home-hero-text">
            Browse our extensive collection of books and find your perfect match
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="form-input search-input"
            />
            {localSearchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setLocalSearchQuery('');
                  dispatch(setSearchQuery(''));
                  dispatch(fetchBooks({ ...filters, page: 1, limit: 12 }));
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="books-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <h3 className="filters-title">Filters</h3>
            <BookFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
            />
          </aside>

          {/* Books Grid */}
          <main className="books-main">
            <div className="books-header">
              <h2>
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Books'}
              </h2>
              <p className="books-count">
                {pagination.total} {pagination.total === 1 ? 'book' : 'books'} found
              </p>
            </div>

            <BookGrid books={books} loading={loading} onBookClick={handleBookClick} />

            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
