import React from 'react';
import { Link } from 'react-router-dom';

export default () => (
  <div style={{ textAlign: 'center' }}>
    <bigger style={{ fontSize: 80, marginTop: 44, color: '#f55' }}>404</bigger>
    <p>
      <Link to={'/'}>回首页</Link>
    </p>
  </div>
);
