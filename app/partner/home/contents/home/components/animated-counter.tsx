"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  format = (v) => v.toLocaleString("vi-VN"),
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => format(Math.round(current)));

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

interface AnimatedPercentageProps {
  value: number;
  showSign?: boolean;
  className?: string;
}

export function AnimatedPercentage({
  value,
  showSign = true,
  className,
}: AnimatedPercentageProps) {
  const prefix = showSign && value > 0 ? "+" : "";
  return (
    <AnimatedCounter
      value={value}
      format={(v) => `${prefix}${v.toFixed(1)}%`}
      className={className}
    />
  );
}
