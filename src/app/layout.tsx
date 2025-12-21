import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs"; 
import { dark } from "@clerk/themes"; 
import { Toaster } from "react-hot-toast";
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#10b981" },
      }}
    >
      <html lang="en" className="dark">
        <body className={cn(
          "bg-black text-white antialiased", 
          fontHeading.variable, 
          fontBody.variable
        )}>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#09090b',
                    border: '1px solid #27272a',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                },
                success: {
                    iconTheme: { primary: '#10b981', secondary: 'black' }
                }
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}