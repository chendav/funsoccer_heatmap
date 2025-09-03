interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* 外圆 */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        {/* 旋转的蓝色圆弧 */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-600 animate-spin`}></div>
      </div>
      
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}