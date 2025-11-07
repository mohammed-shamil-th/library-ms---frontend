'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBorrows, returnBook, setFilters } from '@/store/slices/borrowsSlice';
import { selectAllBorrows, selectBorrowsLoading, selectBorrowsError, selectBorrowsPagination, selectBorrowsFilters } from '@/store/slices/borrowsSlice';
import AdminRoute from '@/components/layout/AdminRoute';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';
import { formatDate } from '@/utils/constants';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function AdminBorrowsPage() {
  const dispatch = useDispatch();
  const allBorrows = useSelector(selectAllBorrows);
  const loading = useSelector(selectBorrowsLoading);
  const error = useSelector(selectBorrowsError);
  const pagination = useSelector(selectBorrowsPagination);
  const filters = useSelector(selectBorrowsFilters);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBorrows(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (status) => {
    dispatch(setFilters({ status: status || '' }));
  };

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
      dispatch(fetchAllBorrows(filters));
    } else {
      showToast(result.payload || 'Failed to return book', 'error');
    }
  };

  const handlePageChange = (page) => {
    dispatch(fetchAllBorrows({ ...filters, page }));
  };

  return (
    <AdminRoute>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <ToastContainer />
        <h1 className="dashboard-title">Borrow Management</h1>

        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: 600 }}>Filter by Status:</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="form-input"
              style={{ minWidth: '200px' }}
            >
              <option value="">All</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading && allBorrows.length === 0 ? (
          <SkeletonTable rows={5} columns={7} />
        ) : error ? (
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <Button onClick={() => dispatch(fetchAllBorrows(filters))}>Retry</Button>
          </div>
        ) : allBorrows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No Borrow Records</h3>
            <p>No borrow records found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrowed Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Returned Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBorrows.map((borrow) => (
                    <TableRow key={borrow._id}>
                      <TableCell>
                        {borrow.user?.name || 'Unknown User'}
                        <br />
                        <small style={{ color: '#666' }}>{borrow.user?.email}</small>
                      </TableCell>
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
                      <TableCell>
                        {borrow.status !== 'returned' && (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleReturnClick(borrow._id)}
                          >
                            Return
                          </Button>
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

        <Modal
          isOpen={returnModalOpen}
          onClose={() => {
            setReturnModalOpen(false);
            setSelectedBorrowId(null);
          }}
          title="Return Book"
        >
          <p>Are you sure you want to mark this book as returned?</p>
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
    </AdminRoute>
  );
}

