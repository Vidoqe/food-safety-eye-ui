// scr/utils/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility: Merge Tailwind + conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
