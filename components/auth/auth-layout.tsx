"use client"

import React from "react"
import { motion } from "framer-motion"
import { Leaf, Wind, Zap } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  quote?: string
  author?: string
}

export function AuthLayout({ children, quote = "Empowering rural communities with sustainable energy solutions.", author = "Solvix Mission" }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-background">
      <div className="relative flex w-full flex-col bg-primary p-8 text-primary-foreground lg:w-[50%] lg:p-12 xl:p-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div 
                animate={{ 
                    y: [0, -20, 0], 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[20%] text-primary-foreground/20"
            >
                <Wind size={120} strokeWidth={1} />
            </motion.div>
            <motion.div 
                animate={{ 
                    y: [0, 30, 0],
                    rotate: [0, 10, 0],
                    opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] right-[10%] text-primary-foreground/20"
            >
                <Zap size={180} strokeWidth={0.5} />
            </motion.div>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-2 font-semibold text-2xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Solvix</span>
          </div>

          <div className="mt-12 space-y-4 lg:mt-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                <blockquote className="space-y-2">
                <p className="text-lg font-medium leading-relaxed tracking-wide lg:text-2xl">
                    &ldquo;{quote}&rdquo;
                </p>
                <footer className="text-sm text-primary-foreground/80 font-medium">
                    {author}
                </footer>
                </blockquote>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-4 py-12 sm:px-8 lg:w-[50%] lg:px-12 xl:px-16">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
