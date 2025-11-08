'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';
import { fetchBooks, setFilters, setSearchQuery } from '@/store/slices/booksSlice';
import { selectBooks, selectBooksLoading, selectBooksPagination, selectBooksFilters, selectSearchQuery } from '@/store/slices/booksSlice';
import { useDebounce } from '@/hooks/useDebounce';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { booksAPI, dashboardAPI } from '@/lib/api';
import { BOOK_CATEGORIES } from '@/utils/constants';

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
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [quickStats, setQuickStats] = useState({ totalBooks: 0, activeMembers: 0 });
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);
  const limit = 12; // Books per page

  // Fetch featured books and quick stats
  useEffect(() => {
    const fetchFeaturedAndStats = async () => {
      try {
        // Fetch featured books (most popular or recent)
        const featuredResponse = await booksAPI.getBooks({ limit: 5, sort: 'createdAt', order: 'desc' });
        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedBooks(featuredResponse.data.slice(0, 5));
        }

        // Fetch quick stats
        const statsResponse = await booksAPI.getBooks({ limit: 1 });
        const membersResponse = await dashboardAPI.getActiveMembersCount();
        
        if (statsResponse.success) {
          setQuickStats({
            totalBooks: statsResponse.pagination?.total || statsResponse.data?.length || 0,
            activeMembers: membersResponse.data?.activeMembers || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching featured books or stats:', error);
      }
    };

    fetchFeaturedAndStats();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredBooks.length > 0) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % featuredBooks.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredBooks.length]);

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
        search: debouncedSearchQuery.trim(), // Use 'search' parameter
        page: 1,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params)); // Use fetchBooks instead of searchBooks
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
    // Include search if it exists
    if (searchQuery) {
      params.search = searchQuery;
    }
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
    const params = {
      page: newPage,
      limit,
      ...(filters.category && { category: filters.category }),
      ...(filters.language && { language: filters.language }),
      ...(filters.availability && { availability: filters.availability }),
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.order && { order: filters.order }),
    };
    // Include search if it exists
    if (searchQuery) {
      params.search = searchQuery;
    }
    dispatch(fetchBooks(params)); // Always use fetchBooks
  };

  const handleBookClick = (bookId) => {
    router.push(`/books/${bookId}`);
  };

  const handleCategoryClick = (category) => {
    handleFilterChange('category', category);
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

        {/* Quick Statistics */}
        <div className="quick-stats" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '0.5rem' }}>
              {quickStats.totalBooks}
            </div>
            <div style={{ color: '#666' }}>Total Books</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              {quickStats.activeMembers}
            </div>
            <div style={{ color: '#666' }}>Active Members</div>
          </div>
        </div>

        {/* Featured Books Carousel */}
        {featuredBooks.length > 0 && (
          <div className="featured-carousel" style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Featured Books</h2>
            <div className="carousel-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
              <div 
                className="carousel-track" 
                style={{ 
                  display: 'flex', 
                  transform: `translateX(-${currentCarouselIndex * 100}%)`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {featuredBooks.map((book) => (
                  <div 
                    key={book._id} 
                    className="carousel-slide" 
                    style={{ 
                      minWidth: '100%', 
                      display: 'flex', 
                      gap: '2rem', 
                      padding: '2rem',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleBookClick(book._id)}
                  >
                    <img 
                      src={book.coverImage || 'https://via.placeholder.com/200x300'} 
                      alt={book.title}
                      style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{book.title}</h3>
                      <p style={{ color: '#666', marginBottom: '1rem' }}>by {book.author}</p>
                      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{book.description?.substring(0, 200)}...</p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="badge" style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '4px',
                          backgroundColor: book.availableCopies > 0 ? '#28a745' : '#dc3545',
                          color: '#fff'
                        }}>
                          {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                        </span>
                        <span style={{ color: '#666' }}>{book.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {featuredBooks.length > 1 && (
                <>
                  <button
                    className="carousel-btn carousel-btn-prev"
                    onClick={() => setCurrentCarouselIndex((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length)}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-btn carousel-btn-next"
                    onClick={() => setCurrentCarouselIndex((prev) => (prev + 1) % featuredBooks.length)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ›
                  </button>
                  <div className="carousel-indicators" style={{ 
                    position: 'absolute', 
                    bottom: '1rem', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    {featuredBooks.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarouselIndex(index)}
                        style={{
                          width: currentCarouselIndex === index ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: currentCarouselIndex === index ? '#4a90e2' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Book Categories Navigation */}
        <div className="categories-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Browse by Category</h2>
          <div className="categories-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            {BOOK_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="category-card"
                style={{
                  padding: '1rem',
                  backgroundColor: filters.category === category ? '#4a90e2' : '#fff',
                  color: filters.category === category ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (filters.category !== category) {
                    e.target.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.category !== category) {
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
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
