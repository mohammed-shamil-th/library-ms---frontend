'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import Link from 'next/link';
import { fetchProfile, updateProfile } from '@/store/slices/usersSlice';
import { selectProfile, selectUsersLoading, selectUsersError } from '@/store/slices/usersSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { fetchFavorites } from '@/store/slices/favoritesSlice';
import { selectFavorites } from '@/store/slices/favoritesSlice';
import FormInput from '@/components/forms/FormInput';
import Button from '@/components/ui/Button';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';
import Skeleton from '@/components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const favorites = useSelector(selectFavorites);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
    onSubmit: async (values, { setSubmitting }) => {
      const result = await dispatch(updateProfile(values));
      if (updateProfile.fulfilled.match(result)) {
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(result.payload || 'Failed to update profile', 'error');
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchProfile());
    dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <ToastContainer />
      <h1 className="dashboard-title">My Profile</h1>

      {loading && !profile ? (
        <div className="card" style={{ padding: '2rem' }}>
          <Skeleton height="20px" width="60%" style={{ marginBottom: '1rem' }} />
          <Skeleton height="16px" width="100%" style={{ marginBottom: '0.5rem' }} />
          <Skeleton height="16px" width="80%" />
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={formik.handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FormInput
                label="Name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name}
                required
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                disabled
                error={formik.touched.email && formik.errors.email}
              />

              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && formik.errors.phone}
              />

              <FormInput
                label="Address"
                name="address"
                type="text"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && formik.errors.address}
              />

              {error && (
                <div style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => formik.resetForm()}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Favorites Summary */}
      <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Favorites</h2>
          <Link href="/dashboard/favorites">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {favorites.length === 0 ? (
          <p style={{ color: '#666' }}>You haven't added any books to your favorites yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: '#666' }}>
              You have {favorites.length} {favorites.length === 1 ? 'book' : 'books'} in your favorites.
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              {favorites.filter((f) => f.isRead).length} marked as read
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

