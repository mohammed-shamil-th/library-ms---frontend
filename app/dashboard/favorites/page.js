'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchFavorites, removeFavorite, toggleReadStatus } from '@/store/slices/favoritesSlice';
import { selectFavorites, selectFavoritesLoading, selectFavoritesError } from '@/store/slices/favoritesSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import BookCard from '@/components/books/BookCard';
import Button from '@/components/ui/Button';
import ToastContainer, { showToast } from '@/components/ui/ToastContainer';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, router]);

  const handleRemoveFavorite = async (favoriteId, bookTitle) => {
    const result = await dispatch(removeFavorite(favoriteId));
    if (removeFavorite.fulfilled.match(result)) {
      showToast(`"${bookTitle}" removed from favorites`, 'success');
    } else {
      showToast(result.payload || 'Failed to remove favorite', 'error');
    }
  };

  const handleToggleRead = async (favoriteId, isRead, bookTitle) => {
    const result = await dispatch(toggleReadStatus({ favoriteId, isRead: !isRead }));
    if (toggleReadStatus.fulfilled.match(result)) {
      showToast(
        `"${bookTitle}" marked as ${!isRead ? 'read' : 'unread'}`,
        'success'
      );
    } else {
      showToast(result.payload || 'Failed to update read status', 'error');
    }
  };

  const filteredFavorites =
    activeTab === 'all'
      ? favorites
      : activeTab === 'read'
      ? favorites.filter((fav) => fav.isRead)
      : favorites.filter((fav) => !fav.isRead);

  const readCount = favorites.filter((f) => f.isRead).length;
  const unreadCount = favorites.filter((f) => !f.isRead).length;
  const totalCount = favorites.length;

  // Bulk actions
  const handleMarkAllAsRead = async () => {
    const unreadFavorites = favorites.filter((f) => !f.isRead);
    if (unreadFavorites.length === 0) {
      showToast('All books are already marked as read', 'info');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const favorite of unreadFavorites) {
      const result = await dispatch(toggleReadStatus({ favoriteId: favorite._id, isRead: true }));
      if (toggleReadStatus.fulfilled.match(result)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast(`Marked ${successCount} book(s) as read`, 'success');
    }
    if (failCount > 0) {
      showToast(`Failed to mark ${failCount} book(s) as read`, 'error');
    }
  };

  const handleMarkAllAsUnread = async () => {
    const readFavorites = favorites.filter((f) => f.isRead);
    if (readFavorites.length === 0) {
      showToast('All books are already marked as unread', 'info');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const favorite of readFavorites) {
      const result = await dispatch(toggleReadStatus({ favoriteId: favorite._id, isRead: false }));
      if (toggleReadStatus.fulfilled.match(result)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast(`Marked ${successCount} book(s) as unread`, 'success');
    }
    if (failCount > 0) {
      showToast(`Failed to mark ${failCount} book(s) as unread`, 'error');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <ToastContainer />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dashboard-title">My Favorites</h1>
        {favorites.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Mark All as Read
              </Button>
            )}
            {readCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsUnread}>
                Mark All as Unread
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {favorites.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '0.875rem', fontWeight: 500 }}>Total Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '0.875rem', fontWeight: 500 }}>Read</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{readCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0}% completed
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '0.875rem', fontWeight: 500 }}>Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{unreadCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {totalCount > 0 ? Math.round((unreadCount / totalCount) * 100) : 0}% remaining
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
          <TabsTrigger value="read">Read ({favorites.filter((f) => f.isRead).length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({favorites.filter((f) => !f.isRead).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading && favorites.length === 0 ? (
            <div className="books-grid">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="error-container">
              <h2>Error</h2>
              <p>{error}</p>
              <Button onClick={() => dispatch(fetchFavorites())}>Retry</Button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">❤️</div>
              <h3>No Favorites Yet</h3>
              <p>
                {activeTab === 'all'
                  ? "You haven't added any books to your favorites yet."
                  : activeTab === 'read'
                  ? "You haven't marked any books as read yet."
                  : "All your favorite books have been marked as read."}
              </p>
              <Button onClick={() => router.push('/')}>Browse Books</Button>
            </div>
          ) : (
            <div className="books-grid">
              {filteredFavorites.map((favorite) => (
                <div key={favorite._id} className="favorite-book-card" style={{ position: 'relative' }}>
                  {/* Read Status Badge */}
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
                    {favorite.isRead ? (
                      <span
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        ✓ Read
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#f59e0b',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        📖 Unread
                      </span>
                    )}
                  </div>

                  {/* Book Card with read overlay */}
                  <div style={{ position: 'relative', opacity: favorite.isRead ? 0.85 : 1 }}>
                    <BookCard book={favorite.book} />
                    {favorite.isRead && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.1), transparent)',
                          pointerEvents: 'none',
                          borderRadius: '8px',
                        }}
                      />
                    )}
                  </div>

                  {/* Book Info with Read Date */}
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '0 0 8px 8px' }}>
                    {favorite.isRead && favorite.readAt && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                        ✓ Read on {new Date(favorite.readAt).toLocaleDateString()}
                      </div>
                    )}
                    {!favorite.isRead && (
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
                        📖 Not read yet
                      </div>
                    )}

                    <div className="favorite-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <Button
                        variant={favorite.isRead ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          handleToggleRead(favorite._id, favorite.isRead, favorite.book?.title)
                        }
                        style={{ flex: 1 }}
                      >
                        {favorite.isRead ? '✓ Mark as Unread' : '✓ Mark as Read'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRemoveFavorite(favorite._id, favorite.book?.title)
                        }
                        style={{ minWidth: '80px' }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

