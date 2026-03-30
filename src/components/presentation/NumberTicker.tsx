"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type {
  AnimationPlaybackControls,
  ValueAnimationTransition,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface NumberTickerProps {
  from: number;
  target: number;
  transition?: ValueAnimationTransition;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface NumberTickerRef {
  startAnimation: () => void;
}

const NumberTicker = forwardRef<NumberTickerRef, NumberTickerProps>(
  (
    {
      from = 0,
      target = 100,
      transition = {
        duration: 3,
        type: "tween",
        ease: "easeInOut",
      },
      className,
      onStart,
      onComplete,
      autoStart = true,
      ...props
    },
    ref
  ) => {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [controls, setControls] = useState<AnimationPlaybackControls | null>(
      null
    );

    const startAnimation = useCallback(() => {
      if (controls) controls.stop();
      onStart?.();
      count.set(from);
      const newControls = animate(count, target, {
        ...transition,
        onComplete: () => {
          onComplete?.();
        },
      });
      setControls(newControls);
    }, []);

    useImperativeHandle(ref, () => ({
      startAnimation,
    }));

    useEffect(() => {
      if (autoStart) {
        startAnimation();
      }
      return () => controls?.stop();
    }, [autoStart]);

    return (
      <motion.span className={cn(className)} {...props}>
        {rounded}
      </motion.span>
    );
  }
);

NumberTicker.displayName = "NumberTicker";

export default NumberTicker;
