import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google"; // Changed Font
import "./globals.css";
import { cn } from "@/lib/utils";

const fontHeading = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const fontBody = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Eco-Oracle",
  description: "The Decentralized Satellite Audit & Disaster Prediction Network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "bg-black text-white antialiased", 
        fontHeading.variable, 
        fontBody.variable
      )}>
        {children}
      </body>
    </html>
  );
}