import React from 'react';

const SvgIcon = ({ src, className, style }) => (
  <div 
    className={`bg-current inline-block ${className}`} 
    style={{ 
      WebkitMask: `url(${src}) no-repeat center / contain`, 
      mask: `url(${src}) no-repeat center / contain`,
      ...style
    }} 
  />
);

export default SvgIcon;
