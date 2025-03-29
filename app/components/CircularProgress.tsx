'use client';

import React from 'react';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  showValue?: boolean;
  valueSize?: number;
  valueColor?: string;
  isIndeterminate?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  backgroundColor = '#E0E0E0',
  progressColor = '#0070F3',
  showValue = true,
  valueSize = 16,
  valueColor = '#333333',
  isIndeterminate = false,
}) => {
  // 确保进度在0-100之间
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // 计算圆环属性
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
  
  // 圆心坐标
  const center = size / 2;
  
  // 动画效果
  const rotateAnimation = isIndeterminate 
    ? `spin 1.5s linear infinite` 
    : 'none';
  
  const progressAnimation = isIndeterminate
    ? 'none'
    : `progress 0.5s ease-out forwards`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        style={{ animation: rotateAnimation }}
      >
        {/* 背景圆 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* 进度圆 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? circumference * 0.75 : strokeDashoffset}
          strokeLinecap="round"
          style={{
            animation: progressAnimation,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      
      {/* 中心显示进度值 */}
      {showValue && !isIndeterminate && (
        <div
          className="absolute inset-0 flex items-center justify-center font-medium"
          style={{
            fontSize: valueSize,
            color: valueColor,
          }}
        >
          {Math.round(normalizedProgress)}%
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(-90deg); }
          100% { transform: rotate(270deg); }
        }
        @keyframes progress {
          0% { stroke-dashoffset: ${circumference}; }
        }
      `}</style>
    </div>
  );
};

export default CircularProgress; 