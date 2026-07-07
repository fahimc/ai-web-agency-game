import React from 'react';

export function Toast({ message }) {
  return <div className={`toast ${message ? 'show' : ''}`}>{message}</div>;
}
