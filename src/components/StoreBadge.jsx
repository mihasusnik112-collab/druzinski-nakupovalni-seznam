import React, { useState } from 'react';
import { getStoreMeta } from '../data/stores';

export default function StoreBadge({
  storeName,
  size = 'sm', // 'xs' | 'sm' | 'md' | 'lg'
  showName = false,
  className = ''
}) {
  const [imageError, setImageError] = useState(false);
  const store = getStoreMeta(storeName);

  // Dimenzije glede na size prop
  const sizeMap = {
    xs: {
      box: 'w-4 h-4',
      img: 'w-3.5 h-3.5',
      text: 'text-[9px]'
    },
    sm: {
      box: 'w-5 h-5 min-w-5',
      img: 'w-4 h-4',
      text: 'text-[10px]'
    },
    md: {
      box: 'w-6 h-6 min-w-6',
      img: 'w-5 h-5',
      text: 'text-xs'
    },
    lg: {
      box: 'w-8 h-8 min-w-8',
      img: 'w-6 h-6',
      text: 'text-sm'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title={store.name || storeName}
    >
      <div 
        className={`${currentSize.box} rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden shrink-0 transition-transform`}
      >
        {store.logo && !imageError ? (
          <img
            src={store.logo}
            alt={store.shortName || storeName}
            onError={() => setImageError(true)}
            className={`${currentSize.img} object-contain max-h-full`}
            loading="lazy"
          />
        ) : (
          <span 
            className="font-bold flex items-center justify-center text-center uppercase"
            style={{ 
              color: store.color || '#475569',
              fontSize: size === 'lg' ? '12px' : size === 'md' ? '10px' : '8px'
            }}
          >
            {store.shortName ? store.shortName.slice(0, 2) : store.fallbackEmoji || '🏪'}
          </span>
        )}
      </div>

      {showName && (
        <span 
          className={`font-bold ${currentSize.text} text-slate-800 truncate`}
        >
          {store.shortName || storeName}
        </span>
      )}
    </div>
  );
}
