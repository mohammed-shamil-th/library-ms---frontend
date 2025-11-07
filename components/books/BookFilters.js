'use client';

import { BOOK_CATEGORIES } from '@/utils/constants';

export default function BookFilters({ filters, onFilterChange, onSortChange }) {
  return (
    <div className="book-filters">
      <div className="filter-group">
        <label htmlFor="category-filter">Category:</label>
        <select
          id="category-filter"
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="form-input"
        >
          <option value="">All Categories</option>
          {BOOK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="language-filter">Language:</label>
        <select
          id="language-filter"
          value={filters.language || ''}
          onChange={(e) => onFilterChange('language', e.target.value)}
          className="form-input"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="availability-filter">Availability:</label>
        <select
          id="availability-filter"
          value={filters.availability || ''}
          onChange={(e) => onFilterChange('availability', e.target.value)}
          className="form-input"
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-filter">Sort By:</label>
        <select
          id="sort-filter"
          value={filters.sortBy || 'title'}
          onChange={(e) => onSortChange(e.target.value)}
          className="form-input"
        >
          <option value="title">Title (A-Z)</option>
          <option value="-title">Title (Z-A)</option>
          <option value="author">Author (A-Z)</option>
          <option value="-author">Author (Z-A)</option>
          <option value="-publishedYear">Year (Newest)</option>
          <option value="publishedYear">Year (Oldest)</option>
        </select>
      </div>

      {(filters.category || filters.language || filters.availability) && (
        <button
          onClick={() => {
            onFilterChange('category', '');
            onFilterChange('language', '');
            onFilterChange('availability', '');
          }}
          className="btn btn-outline"
          style={{ marginTop: '1rem' }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

