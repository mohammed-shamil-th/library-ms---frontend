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
  const limit = 12; // Books per page

  // Reset and fetch initial books when filters change
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    if (!searchQuery && !debouncedSearchQuery.trim()) {
      const params = {
        page: pagination?.page || 1,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  }, [dispatch, isAuthenticated, isAdmin, router, filters.category, filters.language, filters.availability, filters.sort, filters.order]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      dispatch(setSearchQuery(debouncedSearchQuery.trim()));
      const params = {
        query: debouncedSearchQuery.trim(),
        page: 1,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(searchBooks(params));
    } else if (debouncedSearchQuery === '' && searchQuery) {
      dispatch(setSearchQuery(''));
      const params = {
        page: 1,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  }, [dispatch, debouncedSearchQuery, filters, searchQuery, limit]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    const updatedFilters = { ...filters, [key]: value };
    const params = {
      page: 1,
      limit,
      ...(updatedFilters.category && { category: updatedFilters.category }),
      ...(updatedFilters.language && { language: updatedFilters.language }),
      ...(updatedFilters.availability && { availability: updatedFilters.availability }),
      ...(updatedFilters.sort && { sort: updatedFilters.sort }),
      ...(updatedFilters.order && { order: updatedFilters.order }),
    };
    dispatch(fetchBooks(params));
  };

  const handleSortChange = (sortBy) => {
    dispatch(setFilters({ sortBy }));
    const updatedFilters = { ...filters, sortBy };
    const params = {
      page: 1,
      limit,
      ...(updatedFilters.category && { category: updatedFilters.category }),
      ...(updatedFilters.language && { language: updatedFilters.language }),
      ...(updatedFilters.availability && { availability: updatedFilters.availability }),
      sort: updatedFilters.sort,
      order: updatedFilters.order || 'asc',
    };
    dispatch(fetchBooks(params));
  };

  const handlePageChange = (newPage) => {
    if (searchQuery) {
      const params = {
        query: searchQuery,
        page: newPage,
        limit,
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
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    }
  };

  const handleBookClick = (bookId) => {
    router.push(`/books/${bookId}`);
  };

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
                  const params = {
                    page: 1,
                    limit,
                    ...(filters.category && { category: filters.category }),
                    ...(filters.language && { language: filters.language }),
                    ...(filters.availability && { availability: filters.availability }),
                    ...(filters.sort && { sort: filters.sort }),
                    ...(filters.order && { order: filters.order }),
                  };
                  dispatch(fetchBooks(params));
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
                {pagination.total 
                  ? `${pagination.total} ${pagination.total === 1 ? 'book' : 'books'} found`
                  : `${books.length} ${books.length === 1 ? 'book' : 'books'} found`}
              </p>
            </div>

            <BookGrid books={books} loading={loading} onBookClick={handleBookClick} />

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexDirection:'column' }}>
                <Pagination
                  currentPage={pagination.page || 1}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
                <span className="pagination-info" style={{ color: '#666', fontSize: '0.875rem' }}>
                  ({pagination.total || books.length} total)
                </span>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
