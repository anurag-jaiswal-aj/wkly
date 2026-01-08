export default function TaskSkeleton() {
  return (
    <div className="p-4 mb-2 card animate-pulse">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <div className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700" />
        
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          </div>
          
          {/* Progress bar skeleton */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
