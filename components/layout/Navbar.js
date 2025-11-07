'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout, selectUser, selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load dark mode preference and mark as mounted
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const isDark = saved === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Don't show navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-icon">📚</span>
          <span className="navbar-logo-text">
            <span className="navbar-logo-library">Library</span>
            <span className="navbar-logo-ms">MS</span>
          </span>
        </Link>

        {/* Right side navigation */}
        <div className="navbar-right">
          {isMounted && isAuthenticated && (
            <Link href="/" className="navbar-link">
              Browse Books
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="navbar-icon-button"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          {isMounted && isAuthenticated ? (
            <div className="user-dropdown-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="navbar-user-button"
              >
                <span className="navbar-user-icon">👤</span>
                <span className="navbar-user-name">
                  {isAdmin ? 'Admin User' : user?.name || 'User'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin/overview"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">⊞</span>
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">👤</span>
                        Profile
                      </Link>
                      <Link
                        href="/admin/dashboard"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">⊞</span>
                        Admin Panel
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard/my-books"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">📚</span>
                        My Books
                      </Link>
                      <Link
                        href="/dashboard/favorites"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">❤️</span>
                        Favorites
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">👤</span>
                        Profile
                      </Link>
                      <Link
                        href="/dashboard/stats"
                        className="user-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">📊</span>
                        Statistics
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="user-dropdown-item user-dropdown-logout"
                  >
                    <span className="dropdown-icon">→</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : isMounted ? (
            <div className="navbar-auth-links">
              <Link href="/login" className="navbar-link">
                Login
              </Link>
              <Link href="/register" className="navbar-link navbar-link-primary">
                Register
              </Link>
            </div>
          ) : (
            // Placeholder during SSR to prevent hydration mismatch
            <div className="navbar-auth-links" style={{ visibility: 'hidden', width: '120px' }}>
              <span className="navbar-link">Login</span>
              <span className="navbar-link navbar-link-primary">Register</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

