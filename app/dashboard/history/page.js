'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchBorrowHistory } from '@/store/slices/borrowsSlice';
import { selectBorrowHistory, selectBorrowsLoading, selectBorrowsError, selectBorrowsPagination } from '@/store/slices/borrowsSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/constants';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function BorrowHistoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const borrowHistory = useSelector(selectBorrowHistory);
  const loading = useSelector(selectBorrowsLoading);
  const error = useSelector(selectBorrowsError);
  const pagination = useSelector(selectBorrowsPagination);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?._id) {
      dispatch(fetchBorrowHistory({ userId: user._id }));
    }
  }, [dispatch, isAuthenticated, router, user?._id]);

  const handlePageChange = (page) => {
    if (user?._id) {
      dispatch(fetchBorrowHistory({ userId: user._id, params: { page } }));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 className="dashboard-title">Borrow History</h1>

      {loading && borrowHistory.length === 0 ? (
        <SkeletonTable rows={5} columns={5} />
      ) : error ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => user?._id && dispatch(fetchBorrowHistory({ userId: user._id }))}>
            Retry
          </Button>
        </div>
      ) : borrowHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No Borrow History</h3>
          <p>You haven't borrowed any books yet.</p>
          <Button onClick={() => router.push('/')}>Browse Books</Button>
        </div>
      ) : (
        <>
          <div className="card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrowed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Returned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowHistory.map((borrow) => (
                  <TableRow key={borrow._id}>
                    <TableCell>
                      <Link href={`/books/${borrow.book?._id}`} className="book-title-link">
                        {borrow.book?.title || 'Unknown Book'}
                      </Link>
                      <br />
                      <small style={{ color: '#666' }}>by {borrow.book?.author || 'Unknown Author'}</small>
                    </TableCell>
                    <TableCell>{formatDate(borrow.borrowDate)}</TableCell>
                    <TableCell>{formatDate(borrow.dueDate)}</TableCell>
                    <TableCell>{borrow.returnDate ? formatDate(borrow.returnDate) : '-'}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={borrow.status}
                        variant={
                          borrow.status === 'returned'
                            ? 'success'
                            : borrow.status === 'overdue'
                            ? 'danger'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {borrow.fine > 0 ? (
                        <span className="text-danger">${borrow.fine.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

