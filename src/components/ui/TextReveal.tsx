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
        // Start state (Hidden + blurred)
        initial={{ y: "110%", opacity: 0, filter: "blur(10px)" }}
        // Animate when in view
        whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        // Reset when out of view (This makes it work forward & backward)
        viewport={{ once: false, margin: "-10%" }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.22, 1, 0.36, 1], // Cinematic Easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};