"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { MapPin, Brain, ClipboardList } from "lucide-react"

const steps = [
  {
    id: 1,
    icon: MapPin,
    title: "Select Your Land",
    description: "Draw your property boundaries directly on our interactive satellite map to define the planning area.",
  },
  {
    id: 2,
    icon: Brain,
    title: "AI Analyzes",
    description: "Our algorithms evaluate solar potential, terrain, and grid proximity to optimize placement.",
  },
  {
    id: 3,
    icon: ClipboardList,
    title: "Get Your Plan",
    description: "Receive a comprehensive renewable energy blueprint with ROI estimates and next steps.",
  },
]

export function HowItWorks() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      <div className="container relative px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From raw land to renewable revenue in three simple steps.
          </p>
        </motion.div>

        <div className="relative grid gap-12 md:grid-cols-3">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/20 to-muted z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
              className="relative flex flex-col items-center text-center z-10"
            >
              <div className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-background border border-border shadow-sm group hover:border-primary/50 transition-colors duration-300">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  0{step.id}
                </div>
                <step.icon className="w-10 h-10 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
