'use client';

import { useEffect, useState, useRef } from 'react';
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
import { booksAPI } from '@/lib/api';
import { BOOK_CATEGORIES } from '@/utils/constants';
import { Search } from 'lucide-react';

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
  
  const [heroSearchQuery, setHeroSearchQuery] = useState(''); // Hero banner quick search
  const [listingSearchQuery, setListingSearchQuery] = useState(searchQuery || ''); // Book listing search (filtering)
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [availableBooksCount, setAvailableBooksCount] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [quickSearchResults, setQuickSearchResults] = useState([]);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);
  const [showQuickSearchDropdown, setShowQuickSearchDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const heroSearchRef = useRef(null);
  const heroSearchInputRef = useRef(null);
  const debouncedHeroSearch = useDebounce(heroSearchQuery, 400); // Faster debounce for quick search
  const debouncedListingSearch = useDebounce(listingSearchQuery, 500);
  const limit = 12; // Books per page

  // Active search query (only from listing search, not hero search)
  const activeSearchQuery = listingSearchQuery.trim();

  // Fetch featured books and available books count
  useEffect(() => {
    const fetchFeaturedAndStats = async () => {
      try {
        // Fetch featured books (most popular or recent)
        const featuredResponse = await booksAPI.getBooks({ limit: 5, sort: 'createdAt', order: 'desc' });
        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedBooks(featuredResponse.data.slice(0, 5));
        }

        // Fetch available books count (books with availableCopies > 0)
        const availableBooksResponse = await booksAPI.getBooks({ 
          availability: 'available',
          limit: 1 
        });
        
        if (availableBooksResponse.success) {
          setAvailableBooksCount(availableBooksResponse.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Error fetching featured books or stats:', error);
      }
    };

    fetchFeaturedAndStats();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredBooks.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % featuredBooks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredBooks.length]);

  // Reset and fetch initial books when filters change (only if no active listing search)
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    // Only auto-fetch if no listing search is active
    if (!activeSearchQuery) {
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
  }, [dispatch, isAuthenticated, isAdmin, router, filters.category, filters.language, filters.availability, filters.sort, filters.order, activeSearchQuery]);

  // Handle quick search (hero banner dropdown)
  useEffect(() => {
    const fetchQuickSearchResults = async () => {
      const searchTerm = debouncedHeroSearch.trim();
      
      // Only search if at least 1 character
      if (searchTerm.length < 1) {
        setQuickSearchResults([]);
        setShowQuickSearchDropdown(false);
        return;
      }

      setQuickSearchLoading(true);
      try {
        const response = await booksAPI.getBooks({ 
          search: searchTerm, 
          limit: 12 
        });
        
        if (response.success && response.data) {
          setQuickSearchResults(response.data);
          setShowQuickSearchDropdown(true);
        } else {
          setQuickSearchResults([]);
          setShowQuickSearchDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching quick search results:', error);
        setQuickSearchResults([]);
        setShowQuickSearchDropdown(false);
      } finally {
        setQuickSearchLoading(false);
      }
    };

    fetchQuickSearchResults();
  }, [debouncedHeroSearch]);

  // Update dropdown position when it should be shown
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (heroSearchInputRef.current) {
        const rect = heroSearchInputRef.current.getBoundingClientRect();
        // For fixed positioning, use getBoundingClientRect() directly (no scroll offset needed)
        setDropdownPosition({
          top: rect.bottom + 8, // 8px gap below input
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (showQuickSearchDropdown && heroSearchInputRef.current) {
      updateDropdownPosition();
      // Update on scroll and resize to keep dropdown aligned with input
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showQuickSearchDropdown, quickSearchResults, heroSearchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isClickInsideSearch = heroSearchRef.current?.contains(target);
      const isClickInsideDropdown = target.closest('.quick-search-dropdown');
      
      if (!isClickInsideSearch && !isClickInsideDropdown) {
        setShowQuickSearchDropdown(false);
      }
    };

    if (showQuickSearchDropdown) {
      // Use a small delay to avoid closing immediately when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickSearchDropdown]);

  // Handle listing search (filtering search in book listing section)
  useEffect(() => {
    if (debouncedListingSearch.trim()) {
      dispatch(setSearchQuery(debouncedListingSearch.trim()));
      const params = {
        search: debouncedListingSearch.trim(),
        page: 1,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.language && { language: filters.language }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.order && { order: filters.order }),
      };
      dispatch(fetchBooks(params));
    } else if (debouncedListingSearch === '' && listingSearchQuery === '') {
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
  }, [dispatch, debouncedListingSearch, listingSearchQuery, filters, limit]);

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
    // Include listing search if it exists
    if (activeSearchQuery) {
      params.search = activeSearchQuery;
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
    // Include listing search if it exists
    if (activeSearchQuery) {
      params.search = activeSearchQuery;
    }
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
    // Include listing search if it exists
    if (activeSearchQuery) {
      params.search = activeSearchQuery;
    }
    dispatch(fetchBooks(params));
  };

  const handleQuickSearchResultClick = (bookId) => {
    setShowQuickSearchDropdown(false);
    setHeroSearchQuery('');
    router.push(`/books/${bookId}`);
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
      {/* Hero Section with Full-Width Banner */}
      <div className="hero-banner">
        <div className="hero-banner-background"></div>
        <div className="hero-banner-overlay"></div>
        <div className="hero-banner-content">
          <h1 className="hero-title">Discover Your Next Great Read</h1>
          
          {/* Books Available Badge */}
          <div className="hero-badge">
            <span className="hero-badge-icon">📚</span>
            <span className="hero-badge-text">
              {availableBooksCount > 0 ? `${availableBooksCount}+` : '0'} Books Available
            </span>
          </div>
          
          {/* Hero Search Bar - Quick Search */}
          <div className="hero-search-container" ref={heroSearchRef}>
            <div className="hero-search-wrapper">
              <Search className="hero-search-icon" size={20} strokeWidth={2} />
              <input
                ref={heroSearchInputRef}
                type="text"
                placeholder="Quick search books..."
                value={heroSearchQuery}
                onChange={(e) => {
                  setHeroSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 1) {
                    setShowQuickSearchDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (quickSearchResults.length > 0 && heroSearchQuery.trim().length >= 1) {
                    setShowQuickSearchDropdown(true);
                  }
                }}
                className="hero-search-input"
              />
              {heroSearchQuery && (
                <button
                  onClick={() => {
                    setHeroSearchQuery('');
                    setQuickSearchResults([]);
                    setShowQuickSearchDropdown(false);
                  }}
                  className="hero-search-clear"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Quick Search Dropdown - Rendered outside banner to avoid overflow clipping */}
            {showQuickSearchDropdown && (
              <div 
                className="quick-search-dropdown"
                style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  zIndex: 10000
                }}
              >
                {quickSearchLoading ? (
                  <div className="quick-search-skeleton">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="quick-search-skeleton-item">
                        <div className="quick-search-skeleton-image"></div>
                        <div className="quick-search-skeleton-content">
                          <div className="quick-search-skeleton-line skeleton-title"></div>
                          <div className="quick-search-skeleton-line skeleton-author"></div>
                          <div className="quick-search-skeleton-line skeleton-description"></div>
                          <div className="quick-search-skeleton-line skeleton-description-short"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : quickSearchResults.length > 0 ? (
                  <div className="quick-search-results">
                    {quickSearchResults.map((book) => (
                      <div
                        key={book._id}
                        className="quick-search-result-item"
                        onClick={() => handleQuickSearchResultClick(book._id)}
                      >
                        <div className="quick-search-result-image">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '4px',
                              fontSize: '2rem'
                            }}>
                              📚
                            </div>
                          )}
                        </div>
                        <div className="quick-search-result-content">
                          <div className="quick-search-result-title">{book.title}</div>
                          <div className="quick-search-result-author">by {book.author}</div>
                          {book.description && (
                            <div className="quick-search-result-description">
                              {book.description.length > 100 
                                ? `${book.description.substring(0, 100)}...` 
                                : book.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : heroSearchQuery.trim().length >= 1 ? (
                  <div className="quick-search-empty">
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No results found
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        {/* Featured Books Carousel */}
        {featuredBooks.length > 0 && (
          <div className="featured-carousel" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">Featured Books</h2>
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
        <div className="categories-section" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Browse by Category</h2>
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

        {/* Books Layout */}
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
            {/* Book Listing Search Bar - Separate from hero search */}
            <div className="listing-search-container" style={{ marginBottom: '1.5rem' }}>
              <div className="listing-search-wrapper" style={{ position: 'relative', maxWidth: '100%' }}>
                <Search 
                  size={18} 
                  strokeWidth={2}
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter books by title, author, or ISBN..."
                  value={listingSearchQuery}
                  onChange={(e) => setListingSearchQuery(e.target.value)}
                  className="listing-search-input"
                  style={{
                    paddingRight: listingSearchQuery ? '2.5rem' : '0.75rem'
                  }}
                />
                {listingSearchQuery && (
                  <button
                    onClick={() => {
                      setListingSearchQuery('');
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
                    className="listing-search-clear"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="books-header">
              <h2>
                {activeSearchQuery ? `Search Results for "${activeSearchQuery}"` : 'All Books'}
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
