import React from 'react';

const SkeletonCard = () => (
  <div className="route-card skeleton-card" aria-hidden="true">
    <div className="skeleton-line skeleton-line-lg" />
    <div className="skeleton-line skeleton-line-md" />
    <div className="skeleton-line skeleton-line-sm" />
  </div>
);

export default SkeletonCard;
