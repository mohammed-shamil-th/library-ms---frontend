'use client';

import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { registerUser, selectAuthError, selectAuthLoading, selectIsAuthenticated, clearError } from '@/store/slices/authSlice';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import Link from 'next/link';

export default function RegisterForm() {
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = 'Name is required';
      }

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      return errors;
    },
    onSubmit: async (values) => {
      dispatch(clearError());
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = values;
      
      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        router.push('/');
      } else {
        // Handle specific field errors if needed
        if (result.payload) {
          // Clear field errors to show general error
          Object.keys(formik.values).forEach(key => {
            formik.setFieldError(key, '');
          });
        }
      }
    },
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .register-container input:focus,
        .register-container textarea:focus {
          border-color: #4a90e2 !important;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
        }
        .register-container button:not(:disabled):hover {
          background-color: #357abd !important;
        }
      `}} />
      <div style={styles.container} className="register-container">
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Library Management System</h1>
            <h2 style={styles.subtitle}>Create Account</h2>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} style={styles.form}>
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              formik={formik}
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              formik={formik}
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="Enter your phone number (optional)"
              formik={formik}
            />

            <FormTextarea
              label="Address"
              name="address"
              placeholder="Enter your address (optional)"
              formik={formik}
              rows={3}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password (min 6 characters)"
              required
              formik={formik}
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
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
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" style={styles.link}>
                Login here
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
    maxWidth: '500px',
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

