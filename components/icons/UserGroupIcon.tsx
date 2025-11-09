
import React from 'react';

export const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={1.5}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A9.094 9.094 0 016 18.72m12 0A9.094 9.094 0 006 18.72m6 0a3.094 3.094 0 00-3-3.094 3.094 3.094 0 00-3 3.094m6 0a3.094 3.094 0 013 3.094 3.094 3.094 0 013-3.094m-6 0a3.094 3.094 0 01-3 3.094m0 0a3.094 3.094 0 01-3-3.094m0 0A9.094 9.094 0 016 9.628a9.094 9.094 0 016-3.094m0 0a9.094 9.094 0 016 3.094m-6 3.094A3.094 3.094 0 019 15.72m0 0a3.094 3.094 0 01-3-3.094" 
    />
</svg>
);