'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchBookById, fetchRelatedBooks, selectCurrentBook, selectRelatedBooks, selectBooksLoading, selectBooksError, clearCurrentBook } from '@/store/slices/booksSlice';
import { borrowBook } from '@/store/slices/borrowsSlice';
import { addFavorite, removeFavorite, checkFavorite, selectIsFavorited, selectFavoriteStatus } from '@/store/slices/favoritesSlice';
import { selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';
import BookCard from '@/components/books/BookCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';

const ArrowLeft = () => <span className="icon">←</span>;
const BookIcon = () => <span className="icon">📖</span>;
const CalendarIcon = () => <span className="icon">📅</span>;
const BuildingIcon = () => <span className="icon">🏢</span>;
const GlobeIcon = () => <span className="icon">🌐</span>;

export default function BookDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  const book = useSelector(selectCurrentBook);
  const relatedBooks = useSelector(selectRelatedBooks);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const favoriteStatus = useSelector((state) => selectFavoriteStatus(state));
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookById(id));
      dispatch(fetchRelatedBooks(id));
      if (isAuthenticated && !isAdmin) {
        dispatch(checkFavorite(id));
      }
    }

    return () => {
      dispatch(clearCurrentBook());
    };
  }, [dispatch, id, isAuthenticated, isAdmin]);

  // Update favorite status when it changes
  useEffect(() => {
    if (id && favoriteStatus[id]) {
      setIsFavorited(favoriteStatus[id].isFavorited);
      setFavoriteId(favoriteStatus[id].favoriteId);
    } else {
      setIsFavorited(false);
      setFavoriteId(null);
    }
  }, [id, favoriteStatus]);

  const getAvailabilityStatus = () => {
    if (!book) return 'out_of_stock';
    if (book.availableCopies === 0) return 'out_of_stock';
    if (book.availableCopies <= 2) return 'low_stock';
    return 'available';
  };

  const handleBorrow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBorrowModalOpen(true);
  };

  const handleBorrowConfirm = async () => {
    if (!id) return;
    const result = await dispatch(borrowBook(id));
    if (borrowBook.fulfilled.match(result)) {
      showToast('Book borrowed successfully!', 'success');
      setBorrowModalOpen(false);
      // Refresh book data to update available copies
      dispatch(fetchBookById(id));
    } else {
      showToast(result.payload || 'Failed to borrow book', 'error');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || isAdmin) {
      router.push('/login');
      return;
    }

    if (!id) return;

    if (isFavorited && favoriteId) {
      const result = await dispatch(removeFavorite(favoriteId));
      if (removeFavorite.fulfilled.match(result)) {
        showToast('Removed from favorites', 'success');
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        showToast(result.payload || 'Failed to remove favorite', 'error');
      }
    } else {
      const result = await dispatch(addFavorite(id));
      if (addFavorite.fulfilled.match(result)) {
        showToast('Added to favorites!', 'success');
        setIsFavorited(true);
        setFavoriteId(result.payload.data._id);
      } else {
        showToast(result.payload || 'Failed to add favorite', 'error');
      }
    }
  };

  if (loading && !book) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="loading-container" style={{ minHeight: '400px' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>Book Not Found</h2>
            <p>{error || 'The book you are looking for does not exist.'}</p>
            <Link href="/admin/dashboard" className="btn btn-default">
              <ArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <ToastContainer />
      <div className="container">
        <Link href={isAdmin ? "/admin/dashboard" : "/"} className="back-link">
          <ArrowLeft /> Back to {isAdmin ? 'Dashboard' : 'Catalog'}
        </Link>

        <div className="book-detail-layout">
          {/* Left Section - Book Cover */}
          <div className="book-cover-section">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="book-detail-cover" />
            ) : (
              <div className="book-detail-cover-placeholder">
                <span className="book-cover-icon-large">📚</span>
                <p className="book-cover-text">No Cover Image</p>
              </div>
            )}
          </div>

          {/* Right Section - Book Information */}
          <div className="book-info-section">
            <div className="book-header">
              <h1 className="book-detail-title">{book.title}</h1>
              <p className="book-detail-author">{book.author}</p>
              <div className="book-availability-badge">
                <StatusBadge status={getAvailabilityStatus()} />
              </div>
            </div>

            {book.description && (
              <div className="book-synopsis">
                <p>{book.description}</p>
              </div>
            )}

            <div className="book-details-card">
              <h3 className="book-details-title">Book Details</h3>
              <div className="book-details-list">
                <div className="book-detail-item">
                  <BookIcon />
                  <span className="book-detail-label">ISBN:</span>
                  <span className="book-detail-value font-mono">{book.isbn}</span>
                </div>
                {book.publishedYear && (
                  <div className="book-detail-item">
                    <CalendarIcon />
                    <span className="book-detail-label">Published:</span>
                    <span className="book-detail-value">{book.publishedYear}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="book-detail-item">
                    <BuildingIcon />
                    <span className="book-detail-label">Publisher:</span>
                    <span className="book-detail-value">{book.publisher}</span>
                  </div>
                )}
                <div className="book-detail-item">
                  <GlobeIcon />
                  <span className="book-detail-label">Language:</span>
                  <span className="book-detail-value">{book.language || 'English'}</span>
                </div>
                <div className="book-detail-item">
                  <BookIcon />
                  <span className="book-detail-label">Available Copies:</span>
                  <span className="book-detail-value">
                    {book.availableCopies} of {book.totalCopies}
                  </span>
                </div>
              </div>
            </div>

            <div className="book-actions">
              {isAuthenticated && !isAdmin && (
                <Button
                  onClick={handleFavoriteToggle}
                  variant={isFavorited ? 'primary' : 'outline'}
                  className="favorite-button"
                >
                  {isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </Button>
              )}
              {isAuthenticated && book.availableCopies > 0 && (
                <Button onClick={handleBorrow} className="borrow-button">
                  Borrow This Book
                </Button>
              )}
            </div>

            {!isAuthenticated && (
              <div className="login-prompt">
                <p>Please login to borrow this book</p>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              </div>
            )}

            {book.availableCopies === 0 && (
              <div className="unavailable-notice">
                <p>This book is currently unavailable. All copies are borrowed.</p>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={borrowModalOpen}
          onClose={() => setBorrowModalOpen(false)}
          title="Borrow Book"
        >
          <p>Are you sure you want to borrow "{book.title}"?</p>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            The book will be due in 14 days from today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button variant="primary" onClick={handleBorrowConfirm}>
              Confirm Borrow
            </Button>
            <Button variant="outline" onClick={() => setBorrowModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>

        {/* Related Books Section */}
        {relatedBooks && relatedBooks.length > 0 && (
          <div className="related-books-section">
            <h2 className="related-books-title">Related Books</h2>
            <div className="related-books-grid">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook._id} book={relatedBook} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

