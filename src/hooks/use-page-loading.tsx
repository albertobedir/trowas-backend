"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function usePageLoading(delay: number = 1000) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname, delay])

  return isLoading
}