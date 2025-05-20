import { useRef } from 'react';

/**
 * A compatibility hook for useRef that works with React 19
 * React 19 requires an argument for useRef
 * 
 * @param {any} initialValue - The initial value for the ref
 * @returns {React.RefObject} - The ref object
 */
export function useCompatRef(initialValue = null) {
  return useRef(initialValue);
}