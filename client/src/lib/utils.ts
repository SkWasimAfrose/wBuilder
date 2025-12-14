import { clsx, type ClassValue } from "clsx"; // [2]
import { twMerge } from "tailwind-merge"; // [2]

/**
 * A utility function that merges Tailwind CSS classes using clsx and tailwind-merge.
 * This ensures that conflicting classes (like 'px-2' and 'px-4') are handled correctly,
 * with the last class taking precedence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // [2]
}
