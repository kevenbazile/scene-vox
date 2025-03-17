// src/components/ui/progress.tsx
import React from "react";

type ProgressProps = {
  value: number;
  max: number;
};

export const Progress = ({ value, max }: ProgressProps) => {
  const progressPercentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className="bg-blue-500 h-2 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};
export default Progress;