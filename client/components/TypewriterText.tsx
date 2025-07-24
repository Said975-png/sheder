import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Обновляем ref при изменении onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setIsTyping(true);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setIsTyping(true);
    }
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [currentIndex, text, speed, isTyping]);

  return (
    <span className={cn(className)}>
      {displayText}
      {isTyping && currentIndex < text.length && (
        <span className="animate-pulse text-cyan-400">|</span>
      )}
    </span>
  );
}
