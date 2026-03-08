/**
 * Versatile card component for grouping content and providing visual structure.
 * It supports optional titles, descriptions, and custom styling for consistent UI layouts.
 */
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, description, className = '' }) => {
  return (
    <div className={`rounded-lg border border-navy/10 bg-white shadow-sm transition-all hover:shadow-md ${className}`}>
      {title || description ? (
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          {title ? (
            <h3 className="font-serif text-2xl font-semibold leading-none tracking-tight text-navy">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm text-charcoal-light">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="p-6 pt-2">
        {children}
      </div>
    </div>
  );
};
