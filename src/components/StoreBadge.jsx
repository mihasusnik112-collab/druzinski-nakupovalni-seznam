import React, { useState } from 'react';
import { getStoreMeta } from '../data/stores';

export default function StoreBadge({
  storeName,
  size = 'sm', // 'xs' | 'sm' | 'md' | 'lg'
  showName = false,
  variant = 'icon', // 'icon' | 'pill'
  className = ''
}) {
  const [imageError, setImageError] = useState(false);
  const store = getStoreMeta(storeName);
  const displayName = store?.shortName || storeName || 'Trgovina';

  // Dimenzije glede na size prop
  const sizeMap = {
    xs: {
      box: 'w-4 h-4 min-w-4',
      img: 'w-3.5 h-3.5',
      text: 'text-[10px]',
      fallbackText: 'text-[7.5px]'
    },
    sm: {
      box: 'w-5 h-5 min-w-5',
      img: 'w-4 h-4',
      text: 'text-xs',
      fallbackText: 'text-[8.5px]'
    },
    md: {
      box: 'w-6 h-6 min-w-6',
      img: 'w-5 h-5',
      text: 'text-xs',
      fallbackText: 'text-[10px]'
    },
    lg: {
      box: 'w-9 h-9 min-w-9',
      img: 'w-7 h-7',
      text: 'text-sm',
      fallbackText: 'text-xs'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  // Če je izbran "pill" način (čista barvna značka z imenom trgovine)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-bold text-white shadow-2xs select-none ${currentSize.text} ${className}`}
        style={{ backgroundColor: store?.color || '#475569' }}
        title={store?.name || displayName}
      >
        {store?.logo && !imageError && (
          <img
            src={store.logo}
            alt={displayName}
            onError={() => setImageError(true)}
            className={`${currentSize.img} object-contain max-h-full`}
            loading="lazy"
          />
        )}
        <span>{displayName}</span>
      </span>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title={store?.name || displayName}
    >
      <div 
        className={`${currentSize.box} rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden shrink-0 transition-transform`}
      >
        {store?.logo && !imageError ? (
          <img
            src={store.logo}
            alt={displayName}
            onError={() => setImageError(true)}
            className={`${currentSize.img} object-contain max-h-full`}
            loading="lazy"
          />
        ) : (
          <span 
            className={`w-full h-full font-bold flex items-center justify-center text-center uppercase text-white rounded-[5px] ${currentSize.fallbackText}`}
            style={{ 
              backgroundColor: store?.color || '#475569',
              lineHeight: 1
            }}
          >
            {displayName.length <= 4 ? displayName : displayName.slice(0, 2)}
          </span>
        )}
      </div>

      {showName && (
        <span 
          className={`font-bold ${currentSize.text} text-slate-800 truncate`}
        >
          {displayName}
        </span>
      )}
    </div>
  );
}
