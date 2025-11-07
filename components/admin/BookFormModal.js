'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/ToastContainer';
import {
  fetchBookById,
  addBook,
  updateBook,
  selectCurrentBook,
  selectBooksLoading,
  selectBooksError,
  selectBooksPagination,
  selectBooksFilters,
  selectSearchQuery,
  clearError,
  clearCurrentBook,
  fetchBooks,
  searchBooks,
} from '@/store/slices/booksSlice';

const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Philosophy',
  'Religion',
  'Art',
  'Literature',
  'Education',
  'Business',
  'Health',
  'Travel',
  'Cooking',
  'Sports',
  'Other',
];

export default function BookFormModal({ isOpen, onClose, editingBookId, setEditingBookId }) {
  const dispatch = useDispatch();
  const currentBook = useSelector(selectCurrentBook);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const pagination = useSelector(selectBooksPagination);
  const filters = useSelector(selectBooksFilters);
  const searchQuery = useSelector(selectSearchQuery);

  // Load book data when editing
  useEffect(() => {
    if (editingBookId && isOpen) {
      dispatch(fetchBookById(editingBookId));
    }
  }, [dispatch, editingBookId, isOpen]);

  // Populate form when currentBook is loaded
  useEffect(() => {
    if (currentBook && editingBookId && isOpen) {
      formik.setValues({
        title: currentBook.title || '',
        author: currentBook.author || '',
        isbn: currentBook.isbn || '',
        category: currentBook.category || 'Fiction',
        description: currentBook.description || '',
        totalCopies: currentBook.totalCopies || 1,
        availableCopies: currentBook.availableCopies || 1,
        publisher: currentBook.publisher || '',
        language: currentBook.language || 'English',
        publishedYear: currentBook.publishedYear || '',
        pages: currentBook.pages || '',
        coverImage: currentBook.coverImage || '',
      });
    }
  }, [currentBook, editingBookId, isOpen]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: '',
      author: '',
      isbn: '',
      category: 'Fiction',
      description: '',
      totalCopies: 1,
      availableCopies: 1,
      publisher: '',
      language: 'English',
      publishedYear: '',
      pages: '',
      coverImage: '',
    },
    validate: (values) => {
      const errors = {};

      if (!values.title) {
        errors.title = 'Title is required';
      } else if (values.title.length < 1) {
        errors.title = 'Title must be at least 1 character long';
      } else if (values.title.length > 200) {
        errors.title = 'Title must not exceed 200 characters';
      }

      if (!values.author) {
        errors.author = 'Author is required';
      } else if (values.author.length < 1) {
        errors.author = 'Author name must be at least 1 character long';
      } else if (values.author.length > 100) {
        errors.author = 'Author name must not exceed 100 characters';
      }

      if (!values.isbn) {
        errors.isbn = 'ISBN is required';
      } else if (!/^\d{13}$/.test(values.isbn.replace(/-/g, ''))) {
        errors.isbn = 'ISBN must be exactly 13 digits';
      }

      if (!values.category) {
        errors.category = 'Category is required';
      }

      if (values.description && values.description.length > 2000) {
        errors.description = 'Description must not exceed 2000 characters';
      }

      if (values.publisher && values.publisher.length > 100) {
        errors.publisher = 'Publisher name must not exceed 100 characters';
      }

      if (values.language && values.language.length > 50) {
        errors.language = 'Language must not exceed 50 characters';
      }

      if (values.coverImage && values.coverImage.length > 500) {
        errors.coverImage = 'Cover image URL must not exceed 500 characters';
      }

      if (values.totalCopies < 1) {
        errors.totalCopies = 'Total copies must be at least 1';
      } else if (values.totalCopies > 10000) {
        errors.totalCopies = 'Total copies must not exceed 10000';
      }

      if (values.availableCopies < 0) {
        errors.availableCopies = 'Available copies cannot be negative';
      } else if (values.availableCopies > values.totalCopies) {
        errors.availableCopies = 'Available copies cannot exceed total copies';
      }

      if (values.publishedYear && (values.publishedYear < 1000 || values.publishedYear > new Date().getFullYear() + 1)) {
        errors.publishedYear = `Published year must be between 1000 and ${new Date().getFullYear() + 1}`;
      }

      if (values.pages && (values.pages < 1 || values.pages > 50000)) {
        errors.pages = 'Pages must be between 1 and 50000';
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      dispatch(clearError());
      const bookData = {
        ...values,
        isbn: values.isbn.replace(/-/g, ''),
        totalCopies: parseInt(values.totalCopies) || 1,
        availableCopies: parseInt(values.availableCopies) || values.totalCopies,
        publishedYear: values.publishedYear ? parseInt(values.publishedYear) : undefined,
        pages: values.pages ? parseInt(values.pages) : undefined,
      };

      let result;
      if (editingBookId) {
        result = await dispatch(updateBook({ id: editingBookId, data: bookData }));
        if (updateBook.fulfilled.match(result)) {
          showToast('Book updated successfully!', 'success');
          onClose();
          setEditingBookId(null);
          resetForm();
          dispatch(clearCurrentBook());
          if (searchQuery) {
            dispatch(searchBooks({ query: searchQuery, ...filters, page: pagination.page, limit: pagination.limit }));
          } else {
            dispatch(fetchBooks({ ...filters, page: pagination.page, limit: pagination.limit }));
          }
        } else {
          showToast(result.payload || 'Failed to update book', 'error');
        }
      } else {
        result = await dispatch(addBook(bookData));
        if (addBook.fulfilled.match(result)) {
          showToast('Book added successfully!', 'success');
          onClose();
          resetForm();
          if (searchQuery) {
            dispatch(searchBooks({ query: searchQuery, ...filters, page: 1, limit: pagination.limit }));
          } else {
            dispatch(fetchBooks({ ...filters, page: 1, limit: pagination.limit }));
          }
        } else {
          showToast(result.payload || 'Failed to add book', 'error');
        }
      }
      setSubmitting(false);
    },
  });

  const handleClose = () => {
    onClose();
    setEditingBookId(null);
    formik.resetForm();
    dispatch(clearError());
    dispatch(clearCurrentBook());
  };

  const isEditMode = !!editingBookId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Book' : 'Add New Book'}
      description={isEditMode ? 'Update the book details' : 'Enter the details of the new book'}
    >
      <form onSubmit={formik.handleSubmit} className="modal-form">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {isEditMode && loading && (
          <div className="loading-container" style={{ minHeight: '100px' }}>
            <div className="loading-spinner"></div>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input ${formik.touched.title && formik.errors.title ? 'input-error' : ''}`}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="error-text">{formik.errors.title}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              id="author"
              type="text"
              name="author"
              value={formik.values.author}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input ${formik.touched.author && formik.errors.author ? 'input-error' : ''}`}
            />
            {formik.touched.author && formik.errors.author && (
              <div className="error-text">{formik.errors.author}</div>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="isbn">ISBN * (13 digits)</label>
            <input
              id="isbn"
              type="text"
              name="isbn"
              value={formik.values.isbn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={17}
              placeholder="1234567890123"
              disabled={isEditMode}
              className={`form-input ${formik.touched.isbn && formik.errors.isbn ? 'input-error' : ''} ${isEditMode ? 'input-disabled' : ''}`}
            />
            {formik.touched.isbn && formik.errors.isbn && (
              <div className="error-text">{formik.errors.isbn}</div>
            )}
            {isEditMode && (
              <div className="form-hint">ISBN cannot be changed after creation</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input ${formik.touched.category && formik.errors.category ? 'input-error' : ''}`}
            >
              {BOOK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {formik.touched.category && formik.errors.category && (
              <div className="error-text">{formik.errors.category}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows="3"
            className="form-input"
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="totalCopies">Total Copies *</label>
            <input
              id="totalCopies"
              type="number"
              name="totalCopies"
              value={formik.values.totalCopies}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
              className={`form-input ${formik.touched.totalCopies && formik.errors.totalCopies ? 'input-error' : ''}`}
            />
            {formik.touched.totalCopies && formik.errors.totalCopies && (
              <div className="error-text">{formik.errors.totalCopies}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="availableCopies">Available Copies</label>
            <input
              id="availableCopies"
              type="number"
              name="availableCopies"
              value={formik.values.availableCopies}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="0"
              max={formik.values.totalCopies}
              className={`form-input ${formik.touched.availableCopies && formik.errors.availableCopies ? 'input-error' : ''}`}
            />
            {formik.touched.availableCopies && formik.errors.availableCopies && (
              <div className="error-text">{formik.errors.availableCopies}</div>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="publisher">Publisher</label>
            <input
              id="publisher"
              type="text"
              name="publisher"
              value={formik.values.publisher}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input
              id="language"
              type="text"
              name="language"
              value={formik.values.language}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="publishedYear">Published Year</label>
            <input
              id="publishedYear"
              type="number"
              name="publishedYear"
              value={formik.values.publishedYear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1000"
              max={new Date().getFullYear() + 1}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="pages">Pages</label>
            <input
              id="pages"
              type="number"
              name="pages"
              value={formik.values.pages}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="coverImage">Cover Image URL</label>
          <input
            id="coverImage"
            type="url"
            name="coverImage"
            value={formik.values.coverImage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="https://example.com/image.jpg"
            className="form-input"
          />
        </div>

        <div className="modal-actions">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={formik.isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formik.isSubmitting || loading}>
            {formik.isSubmitting || loading
              ? isEditMode
                ? 'Updating...'
                : 'Adding...'
              : isEditMode
              ? 'Update Book'
              : 'Add Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

