'use client';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  formik,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  ...props
}) {
  // Support both formik prop and individual props
  const inputValue = formik ? formik.values[name] : value;
  const handleChange = formik ? formik.handleChange : onChange;
  const handleBlur = formik ? formik.handleBlur : onBlur;
  const hasError = formik 
    ? formik.touched[name] && formik.errors[name]
    : error;

  return (
    <div style={styles.formGroup}>
      <label htmlFor={name} style={styles.label}>
        {label} {required && <span style={styles.required}>*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={inputValue || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(hasError ? styles.inputError : {}),
          ...(disabled ? styles.inputDisabled : {}),
        }}
        {...props}
      />
      {hasError && (
        <div style={styles.errorText}>
          {formik ? formik.errors[name] : error}
        </div>
      )}
    </div>
  );
}

const styles = {
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#c33',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  inputError: {
    borderColor: '#c33',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  errorText: {
    fontSize: '12px',
    color: '#c33',
    marginTop: '-4px',
  },
};

