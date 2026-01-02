import React, { useState } from 'react';
import './Input.css';

const Input = ({ 
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  error,
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className={`input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        <input
          type={type}
          className="input-floating"
          value={value}
          onChange={onChange}
          placeholder={placeholder || ' '}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
      </div>
      {error && (
        <span className="input-error-message fade-in">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
