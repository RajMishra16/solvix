import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/* Tailwind utility merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ----------- INR Currency Formatter ----------- */
/* Converts numbers to ₹ with Lakhs and Crores */

export function formatINR(value: number): string {

  if (!value && value !== 0) return "₹0"

  const abs = Math.abs(value)

  // Crores
  if (abs >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`
  }

  // Lakhs
  if (abs >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }

  // Thousands
  if (abs >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`
  }

  return `₹${value.toLocaleString("en-IN")}`
} 