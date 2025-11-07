'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchActiveBorrows, returnBook } from '@/store/slices/borrowsSlice';
import { selectActiveBorrows, selectBorrowsLoading, selectBorrowsError } from '@/store/slices/borrowsSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import BorrowCard from '@/components/borrows/BorrowCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function MyBooksPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const activeBorrows = useSelector(selectActiveBorrows);
  const loading = useSelector(selectBorrowsLoading);
  const error = useSelector(selectBorrowsError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchActiveBorrows());
  }, [dispatch, isAuthenticated, router]);

  const handleReturnClick = (borrowId) => {
    setSelectedBorrowId(borrowId);
    setReturnModalOpen(true);
  };

  const handleReturnConfirm = async () => {
    if (!selectedBorrowId) return;

    const result = await dispatch(returnBook(selectedBorrowId));
    if (returnBook.fulfilled.match(result)) {
      showToast('Book returned successfully!', 'success');
      setReturnModalOpen(false);
      setSelectedBorrowId(null);
      dispatch(fetchActiveBorrows());
    } else {
      showToast(result.payload || 'Failed to return book', 'error');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <ToastContainer />
      <h1 className="dashboard-title">My Books</h1>

      {loading && activeBorrows.length === 0 ? (
        <div>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => dispatch(fetchActiveBorrows())}>Retry</Button>
        </div>
      ) : activeBorrows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No Active Borrows</h3>
          <p>You don't have any books borrowed at the moment.</p>
          <Button onClick={() => router.push('/')}>Browse Books</Button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>You have {activeBorrows.length} active {activeBorrows.length === 1 ? 'borrow' : 'borrows'}</p>
          </div>
          {activeBorrows.map((borrow) => (
            <BorrowCard
              key={borrow._id}
              borrow={borrow}
              onReturn={handleReturnClick}
              showReturnButton={true}
            />
          ))}
        </>
      )}

      <Modal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedBorrowId(null);
        }}
        title="Return Book"
      >
        <p>Are you sure you want to return this book?</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Button variant="primary" onClick={handleReturnConfirm}>
            Confirm Return
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReturnModalOpen(false);
              setSelectedBorrowId(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

