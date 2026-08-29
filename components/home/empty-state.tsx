'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sun, Wind, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="relative w-64 h-48 mb-8">
          <svg viewBox="0 0 256 192" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="land-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d6d3d1" />
                <stop offset="100%" stopColor="#a8a29e" />
              </linearGradient>
              <linearGradient id="hill-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            
            <ellipse cx="128" cy="170" rx="110" ry="20" fill="#e7e5e4" />
            
            <path 
              d="M20 140 Q60 100 100 120 Q140 140 180 110 Q220 80 240 100 L240 170 L20 170 Z" 
              fill="url(#hill-gradient)" 
              opacity="0.3"
            />
            <path 
              d="M0 150 Q40 120 80 135 Q120 150 160 125 Q200 100 256 120 L256 170 L0 170 Z" 
              fill="url(#hill-gradient)" 
              opacity="0.5"
            />
            <path 
              d="M0 160 Q50 140 100 150 Q150 160 200 145 Q230 135 256 145 L256 170 L0 170 Z" 
              fill="url(#hill-gradient)"
            />
            
            <motion.g
              initial={{ y: 5 }}
              animate={{ y: -5 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
              <circle cx="200" cy="45" r="28" fill="#fef3c7" />
              <circle cx="200" cy="45" r="22" fill="#fcd34d" />
              <circle cx="200" cy="45" r="16" fill="#fbbf24" />
            </motion.g>
            
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.line
                key={i}
                x1={200 + Math.cos((i * 60 * Math.PI) / 180) * 35}
                y1={45 + Math.sin((i * 60 * Math.PI) / 180) * 35}
                x2={200 + Math.cos((i * 60 * Math.PI) / 180) * 45}
                y2={45 + Math.sin((i * 60 * Math.PI) / 180) * 45}
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
              />
            ))}
            
            <rect x="70" y="125" width="4" height="30" fill="#78716c" rx="1" />
            <motion.path
              d="M74 125 L74 108 L90 116 L74 125"
              fill="#dc2626"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '74px 116px' }}
            />
            
            <g transform="translate(115, 100)">
              <rect x="0" y="20" width="30" height="35" fill="#1c1917" rx="2" />
              <rect x="2" y="22" width="26" height="20" fill="#1e3a5f" />
              <line x1="15" y1="22" x2="15" y2="42" stroke="#374151" strokeWidth="0.5" />
              <line x1="2" y1="32" x2="28" y2="32" stroke="#374151" strokeWidth="0.5" />
              <rect x="8" y="44" width="14" height="11" fill="#78716c" />
            </g>
            
            <motion.circle 
              cx="50" 
              cy="60" 
              r="4" 
              fill="#22c55e"
              initial={{ opacity: 0.4, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.circle 
              cx="180" 
              cy="80" 
              r="3" 
              fill="#22c55e"
              initial={{ opacity: 0.4, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
            No plans yet
          </h3>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-balance leading-relaxed">
            Start by selecting an area on the map to discover your land&apos;s renewable energy potential.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          <Link href="/area-select">
            <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-primary/20 transition-all duration-300 gap-2 h-12">
              <MapPin className="h-4 w-4" />
              Create Your First Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              Solar
            </span>
            <span className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-sky-500" />
              Wind
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              Storage
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
