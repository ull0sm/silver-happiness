"use client";

import { useEffect, useState, useRef } from "react";

interface Stats {
  weightLifted: number;
  registeredUsers: number;
  repsCompleted: number;
  caloriesBurned: number;
}

function AnimatedNumber({ value, suffix = "", duration = 2500, decimals = 0 }: { value: number, suffix?: string, duration?: number, decimals?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || value === 0) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo for cinematic slowing down effect
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeOut * value);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, isVisible, duration]);

  // Format large numbers cleanly with or without decimals
  const formattedCount = decimals > 0 
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(count)
    : new Intl.NumberFormat('en-US').format(Math.floor(count));

  return (
    <div ref={ref} className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black italic text-on-surface tracking-tight drop-shadow-[0_0_15px_rgba(230,0,0,0.1)]">
      {formattedCount}
      <span className="text-primary-container text-base md:text-xl lg:text-2xl ml-1 drop-shadow-none">{suffix}</span>
    </div>
  );
}

export default function HeroStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-12 md:mt-24 pt-12 border-t border-surface-variant/30 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 animate-pulse opacity-30">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="h-3 bg-surface-variant w-1/2 rounded" />
            <div className="h-12 bg-surface-variant w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Tons Lifted", value: stats.weightLifted, suffix: "K", decimals: 1 },
    { label: "Active Warriors", value: stats.registeredUsers, suffix: "+", decimals: 0 },
    { label: "Reps Destroyed", value: stats.repsCompleted, suffix: "M", decimals: 1 },
    { label: "Calories Burned", value: stats.caloriesBurned, suffix: "M", decimals: 1 },
  ];

  return (
    <div className="w-full pt-12 md:pt-16 border-t border-surface-variant/30 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-12 bg-primary-container shadow-[0_0_10px_rgba(230,0,0,0.5)]"></div>
          <h3 className="text-sm font-black italic uppercase text-on-surface-variant tracking-[0.2em]">
            Global Platform Impact
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {statItems.map((item, i) => (
            <div key={item.label} className="flex flex-col gap-2 relative group">
              <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest group-hover:text-primary-container transition-colors duration-500">
                {item.label}
              </div>
              {/* We increment the duration for each subsequent stat so they finish counting one after another, creating a ripple effect */}
              <AnimatedNumber value={item.value} suffix={item.suffix} duration={2000 + (i * 400)} decimals={item.decimals} />
              
              {/* Cinematic ambient glow effect behind numbers on hover */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-primary-container/0 group-hover:bg-primary-container/10 blur-[40px] transition-all duration-700 -z-10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
