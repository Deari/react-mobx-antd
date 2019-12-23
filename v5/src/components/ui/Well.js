import React from 'react';

export default ({ children, style = {}, ...props }) => {
  return (
    <div
      style={{
        padding: 14,
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        borderBottom: '1px solid rgba(0,0,0,.2)',
        ...style
      }}
      {...props}>
      {children}
    </div>
  );
};
