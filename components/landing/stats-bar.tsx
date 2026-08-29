"use client"

import * as React from "react"
import { motion, useSpring, useTransform, useInView } from "framer-motion"

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString() + suffix
  )

  React.useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return <motion.span ref={ref}>{display}</motion.span>
}

const stats = [
  { label: "Acres Analyzed", value: 125000, suffix: "+" },
  { label: "Plans Created", value: 3200, suffix: "+" },
  { label: "MW Capacity Planned", value: 850, suffix: "+" },
]

export function StatsBar() {
  return (
    <section className="w-full bg-primary py-16 text-primary-foreground overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center text-center p-4"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-lg md:text-xl font-medium opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
