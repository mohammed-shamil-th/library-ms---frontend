'use client';

import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';

export default function BookCard({ book, onClick }) {
  const getAvailabilityStatus = () => {
    if (book.availableCopies === 0) return 'out_of_stock';
    if (book.availableCopies <= 2) return 'low_stock';
    return 'available';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(book._id);
    }
  };

  return (
    <div className="book-card" onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="book-card-cover">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="book-cover-image" />
        ) : (
          <div className="book-cover-placeholder">
            <span className="book-cover-icon">📚</span>
          </div>
        )}
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-meta">
          <StatusBadge status={getAvailabilityStatus()} />
        </div>
        {book.description && (
          <p className="book-card-description">
            {book.description.length > 100
              ? `${book.description.substring(0, 100)}...`
              : book.description}
          </p>
        )}
        <Link href={`/books/${book._id}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="book-card-button">
            <span className="icon">📖</span> View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

