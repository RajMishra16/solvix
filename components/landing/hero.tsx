"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Leaf, ArrowRight, ChevronDown } from "lucide-react"

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const GRID_POINTS = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  x: `${Math.round(seededRandom(i * 1.1) * 10000) / 100}%`,
  y: `${Math.round(seededRandom(i * 2.2) * 10000) / 100}%`,
  size: `${Math.round((seededRandom(i * 3.3) * 3 + 1) * 100) / 100}px`,
  duration: Math.round(seededRandom(i * 4.4) * 2000 + 1000) / 100,
  delay: Math.round(seededRandom(i * 5.5) * 500) / 100,
}))

export function Hero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh Base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)]" />
        
        {/* Animated Grid/Particles */}
        {GRID_POINTS.map((point) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full bg-primary/10"
            style={{
              left: point.x,
              top: point.y,
              width: point.size,
              height: point.size,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: point.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: point.delay,
            }}
          />
        ))}

        {/* Abstract Energy Flow Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating gradient orbs for depth */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px]"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[10%] right-[10%] w-[25vw] h-[25vw] bg-chart-1/5 rounded-full blur-[80px]"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center">
        
        {/* Logo/Brand Mark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
        >
          <Leaf className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-wide text-foreground">Solvix</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          See What Your <br />
          <span className="text-primary relative inline-block">
            Land Can Power
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Unlock the renewable potential of your property with our AI-powered planning platform. 
          Designed for rural landowners building a sustainable future.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <Button 
            size="lg" 
            className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
            nativeButton={false}
            render={(props) => <Link {...props} href="/register" />}
          >
            Start Planning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 px-8 text-base backdrop-blur-sm transition-all hover:bg-primary/5"
            nativeButton={false}
            render={(props) => <Link {...props} href="#learn-more" />}
          >
            Learn More
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <Link href="#learn-more" aria-label="Scroll down">
          <ChevronDown className="h-8 w-8 text-muted-foreground/50 transition-colors hover:text-primary" />
        </Link>
      </motion.div>
    </section>
  )
}
