"use client";

import { animate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

function useIntersectionInView(
  ref: React.RefObject<Element | null>,
  { once = true, margin = "0px" }: { once?: boolean; margin?: string } = {}
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin: margin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, margin]);

  return isInView;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 1.8,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);
  const startVal = direction === "down" ? to : from;
  const targetVal = direction === "down" ? from : to;

  const isInView = useIntersectionInView(ref, { once: true, margin: "0px" });

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes(".")) {
      const decimals = str.split(".")[1];
      if (parseInt(decimals, 10) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;

      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };

      const formattedNumber = Intl.NumberFormat("en-US", options).format(latest);

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
    },
    [maxDecimals, separator]
  );

  // Synchronize initial rendered text
  useEffect(() => {
    if (ref.current) {
      if (hasAnimatedRef.current) {
        ref.current.textContent = formatValue(targetVal);
      } else {
        ref.current.textContent = formatValue(startVal);
      }
    }
  }, [startVal, targetVal, formatValue]);

  // Single-fire animation when element enters the viewport
  useEffect(() => {
    if (isInView && startWhen && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;

      if (typeof onStart === "function") {
        onStart();
      }

      let animationControls: { stop: () => void } | null = null;

      const timeoutId = setTimeout(() => {
        animationControls = animate(startVal, targetVal, {
          duration,
          ease: "easeOut",
          onUpdate: (latest) => {
            if (ref.current) {
              ref.current.textContent = formatValue(Math.round(latest));
            }
          },
          onComplete: () => {
            if (ref.current) {
              ref.current.textContent = formatValue(targetVal);
            }
            if (typeof onEnd === "function") {
              onEnd();
            }
          },
        });
      }, delay * 1000);

      return () => {
        clearTimeout(timeoutId);
        if (animationControls) {
          animationControls.stop();
        }
      };
    }
  }, [isInView, startWhen, startVal, targetVal, delay, duration, onStart, onEnd, formatValue]);

  return <span className={className} ref={ref} />;
}
