'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchUserStats } from '@/store/slices/usersSlice';
import { selectUserStats, selectUsersLoading, selectUsersError } from '@/store/slices/usersSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/utils/constants';
import Skeleton from '@/components/ui/Skeleton';

export default function UserStatsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const stats = useSelector(selectUserStats);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?._id) {
      dispatch(fetchUserStats(user._id));
    }
  }, [dispatch, isAuthenticated, router, user?._id]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
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
      ) : error ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
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
      ) : null}
    </div>
  );
}

