'use client';

import BookCard from './BookCard';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function BookGrid({ books, loading, onBookClick }) {
  if (loading) {
    return (
      <div className="books-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3>No Books Found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard key={book._id} book={book} onClick={onBookClick} />
      ))}
    </div>
  );
}

