"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "Solvix made it incredibly easy to understand the solar potential of my 40-acre lot. The AI analysis was spot on compared to the manual survey I got later.",
    author: "Robert H.",
    location: "Montana",
    initials: "RH",
  },
  {
    quote: "I was skeptical about automated planning, but the detailed report I received helped me secure financing for my renewable energy project. Truly a game changer.",
    author: "Sarah Jenkins",
    location: "Texas",
    initials: "SJ",
  },
  {
    quote: "The interface is beautiful and intuitive. It turned a complex engineering headache into a simple, step-by-step process. Highly recommend for any landowner.",
    author: "Michael Chen",
    location: "California",
    initials: "MC",
  },
]

export function Testimonials() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Trusted by Rural Landowners
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join hundreds of property owners unlocking the value of their land.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
              className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <Quote className="absolute top-8 right-8 text-primary/10 h-10 w-10" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-lg text-foreground mb-8 leading-relaxed">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {item.initials}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{item.author}</div>
                  <div className="text-sm text-muted-foreground">{item.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
