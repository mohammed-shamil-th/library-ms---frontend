'use client';

import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { loginUser, selectAuthError, selectAuthLoading, selectIsAuthenticated, clearError } from '@/store/slices/authSlice';
import FormInput from './FormInput';
import Link from 'next/link';

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors = {};

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!values.password) {
        errors.password = 'Password is required';
      }

      return errors;
    },
    onSubmit: async (values) => {
      dispatch(clearError());
      const result = await dispatch(loginUser(values));
      
      if (loginUser.fulfilled.match(result)) {
        router.push('/');
      } else {
        // Set form-level error
        if (result.payload) {
          formik.setFieldError('email', '');
          formik.setFieldError('password', '');
        }
      }
    },
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .login-container input:focus {
          border-color: #4a90e2 !important;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
        }
        .login-container button:not(:disabled):hover {
          background-color: #357abd !important;
        }
      `}} />
      <div style={styles.container} className="login-container">
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Library Management System</h1>
            <h2 style={styles.subtitle}>Login</h2>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} style={styles.form}>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              formik={formik}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              formik={formik}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link href="/register" style={styles.link}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#666',
  },
  errorAlert: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #fcc',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  submitButton: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4a90e2',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
    marginTop: '10px',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#4a90e2',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

