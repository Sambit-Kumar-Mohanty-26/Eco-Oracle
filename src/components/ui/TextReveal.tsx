"use client";
import { motion } from "framer-motion";

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  width?: "fit-content" | "100%";
}

export const TextReveal = ({ children, className = "", delay = 0, width = "fit-content" }: TextRevealProps) => {
  return (
    <div style={{ width, overflow: "hidden", paddingBottom: "0.2em" }} className={className}>
      <motion.div
        initial={{ y: "110%", opacity: 0, filter: "blur(10px)" }}
        whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: false, margin: "-10%" }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};