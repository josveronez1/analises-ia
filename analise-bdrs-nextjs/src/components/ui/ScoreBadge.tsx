interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export default function ScoreBadge({ 
  score, 
  maxScore = 10, 
  size = 'md',
  showLabel = false,
  label 
}: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-lg';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center font-semibold rounded-full border ${getScoreColor(score)} ${getSizeClasses(size)}`}>
        {score.toFixed(1)}/{maxScore}
      </span>
      {showLabel && label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
}


