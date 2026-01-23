"use client"

import { useState, useEffect } from "react"

export function usePageLoading(delay: number = 1000) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [delay])

  return isLoading
}