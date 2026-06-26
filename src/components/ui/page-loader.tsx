"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function PageLoader({
  text = "Loading",
  fullScreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen ? "min-h-[60vh] w-full" : "py-10",
        className,
      )}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-neutral-200/70"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 shadow-sm"
          animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <motion.p
          className="text-sm font-medium tracking-wide text-neutral-600"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
              animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: index * 0.14,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
