import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const shapes = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200 dark:bg-neutral-800/60 ${shapes[variant]} ${className}`}
    />
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-10 w-1/4" />
      </div>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex p-4 space-x-4">
            <Skeleton className="h-6 w-1/6" variant="text" />
            <Skeleton className="h-6 w-1/3" variant="text" />
            <Skeleton className="h-6 w-1/12" variant="text" />
            <Skeleton className="h-6 w-1/12" variant="text" />
            <Skeleton className="h-6 w-1/6" variant="text" />
            <Skeleton className="h-6 w-1/12" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton className="h-32" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton variant="text" className="w-1/4 h-5" />
      </div>
    </div>
  );
};

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gold-400/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-gold-400 animate-spin" />
      </div>
      <p className="font-poppins text-xs font-medium text-gold-500 animate-pulse">
        Auric Jewels loading...
      </p>
    </div>
  );
};
