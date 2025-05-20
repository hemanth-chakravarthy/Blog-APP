import React, { useRef } from 'react';

const TestComponent = () => {
  // In React 19, useRef requires an argument
  const myRef = useRef(null);
  
  return (
    <div ref={myRef}>
      Test Component
    </div>
  );
};

export default TestComponent;