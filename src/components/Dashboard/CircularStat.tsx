"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { animate } from "motion";
import "react-circular-progressbar/dist/styles.css";

type CircularStatProps = {
  title: string;
  value: number; // 0–100
};

export default function CircularStat({ title, value }: CircularStatProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setProgress(Math.round(latest)),
    });

    return () => controls.stop();
  }, [value]);

  return (
    <div className="bg-[#eef1f5] rounded-xl p-4 flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>

      <div className="w-28 h-28">
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          strokeWidth={10}
          styles={buildStyles({
            textColor: "#111",
            textSize: "22px",
            pathColor: "#1d4ed8",
            trailColor: "#d6d6d6",
            strokeLinecap: "round",
          })}
        />
      </div>
    </div>
  );
}
