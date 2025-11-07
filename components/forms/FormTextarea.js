'use client';

export default function FormTextarea({
  label,
  name,
  placeholder,
  required = false,
  formik,
  rows = 3,
  ...props
}) {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div style={styles.formGroup}>
      <label htmlFor={name} style={styles.label}>
        {label} {required && <span style={styles.required}>*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={placeholder}
        rows={rows}
        style={{
          ...styles.textarea,
          ...(hasError ? styles.textareaError : {}),
        }}
        {...props}
      />
      {hasError && (
        <div style={styles.errorText}>{formik.errors[name]}</div>
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
  textarea: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  textareaError: {
    borderColor: '#c33',
  },
  errorText: {
    fontSize: '12px',
    color: '#c33',
    marginTop: '-4px',
  },
};

