'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, daysUntilDue, isOverdue } from '@/utils/constants';

export default function BorrowCard({ borrow, onReturn, showReturnButton = true }) {
  const days = daysUntilDue(borrow.dueDate);
  const overdue = isOverdue(borrow.dueDate);

  const getStatusVariant = () => {
    if (borrow.status === 'returned') return 'success';
    if (borrow.status === 'overdue' || overdue) return 'danger';
    if (days <= 3) return 'warning';
    return 'default';
  };

  return (
    <div className="borrow-card">
      <div className="borrow-card-content">
        {borrow.book?.coverImage && (
          <div className="borrow-card-image">
            <img src={borrow.book.coverImage} alt={borrow.book.title} />
          </div>
        )}
        <div className="borrow-card-details">
          <h3>
            <Link href={`/books/${borrow.book?._id}`}>{borrow.book?.title || 'Unknown Book'}</Link>
          </h3>
          <p className="borrow-card-author">by {borrow.book?.author || 'Unknown Author'}</p>
          
          <div className="borrow-card-info">
            <div className="info-row">
              <span className="info-label">Borrowed:</span>
              <span>{formatDate(borrow.borrowDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Due Date:</span>
              <span className={overdue ? 'text-danger' : ''}>{formatDate(borrow.dueDate)}</span>
            </div>
            {borrow.returnDate && (
              <div className="info-row">
                <span className="info-label">Returned:</span>
                <span>{formatDate(borrow.returnDate)}</span>
              </div>
            )}
            {borrow.fine > 0 && (
              <div className="info-row">
                <span className="info-label">Fine:</span>
                <span className="text-danger">${borrow.fine.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="borrow-card-footer">
            <StatusBadge status={borrow.status} variant={getStatusVariant()} />
            {!overdue && days !== null && days > 0 && (
              <span className="days-remaining">Due in {days} {days === 1 ? 'day' : 'days'}</span>
            )}
            {overdue && (
              <span className="overdue-text">Overdue by {Math.abs(days)} {Math.abs(days) === 1 ? 'day' : 'days'}</span>
            )}
          </div>
        </div>
      </div>
      
      {showReturnButton && borrow.status !== 'returned' && (
        <div className="borrow-card-actions">
          <Button
            variant="primary"
            onClick={() => onReturn(borrow._id)}
            disabled={borrow.status === 'returned'}
          >
            Return Book
          </Button>
        </div>
      )}
    </div>
  );
}

