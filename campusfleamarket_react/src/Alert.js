import React from 'react';

const Alert = ({ message, onClose }) => {
  return (
    <div className="alert alert-danger" role="alert">
      {message}
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert;
