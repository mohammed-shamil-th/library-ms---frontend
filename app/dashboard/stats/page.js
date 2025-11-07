'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchUserStats } from '@/store/slices/usersSlice';
import { selectUserStats, selectUsersLoading, selectUsersError } from '@/store/slices/usersSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/utils/constants';
import Skeleton from '@/components/ui/Skeleton';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';

export default function UserStatsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const stats = useSelector(selectUserStats);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Get user ID - handle both _id and id properties
    const userId = user?._id || user?.id;
    if (userId) {
      dispatch(fetchUserStats(userId));
    }
  }, [dispatch, isAuthenticated, router, user, isMounted]);

  useEffect(() => {
    if (error) {
      showToast(error || 'Failed to load statistics', 'error');
    }
  }, [error]);

  if (!isMounted) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <ToastContainer />
      <h1 className="dashboard-title">My Statistics</h1>

      {loading && !stats ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent style={{ padding: '1.5rem' }}>
                <Skeleton height="20px" width="60%" style={{ marginBottom: '0.5rem' }} />
                <Skeleton height="32px" width="40%" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error && !stats ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error Loading Statistics</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              const userId = user?._id || user?.id;
              if (userId) {
                dispatch(fetchUserStats(userId));
              }
            }}
          >
            Retry
          </button>
        </div>
      ) : stats ? (
        <>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <Card>
              <CardHeader>
                <CardTitle>Total Borrowed</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a90e2' }}>
                  {stats.stats?.totalBorrowed || 0}
                </div>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Books borrowed all time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Borrows</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                  {stats.stats?.activeBorrows || 0}
                </div>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Currently borrowed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                  {stats.stats?.overdueBorrows || 0}
                </div>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Books past due date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Fine</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                  ${stats.stats?.totalFine || '0.00'}
                </div>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Outstanding fines</p>
              </CardContent>
            </Card>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Additional Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong>Name:</strong> {stats.user?.name}
              </div>
              <div>
                <strong>Email:</strong> {stats.user?.email}
              </div>
              <div>
                <strong>Membership Date:</strong> {formatDate(stats.user?.membershipDate)}
              </div>
              <div>
                <strong>Max Books Allowed:</strong> {stats.user?.maxBooksAllowed || 3}
              </div>
              <div>
                <strong>Favorite Category:</strong> {stats.stats?.favoriteCategory || 'N/A'}
              </div>
              <div>
                <strong>Returned Books:</strong> {stats.stats?.returnedBorrows || 0}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>No Statistics Available</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Statistics will appear here once you start borrowing books.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              const userId = user?._id || user?.id;
              if (userId) {
                dispatch(fetchUserStats(userId));
              }
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

