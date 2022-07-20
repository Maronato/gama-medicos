import { useEffect, useState } from "react"

type ColorScheme = "light" | "dark"

/**
 * Hook to get the current user color scheme.
 * @returns the current color scheme
 */
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light")
  useEffect(() => {
    const handleSchemeChange = () => {
      const scheme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      setColorScheme(scheme)
    }
    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      handleSchemeChange
    )
    handleSchemeChange()
    return () => {
      matchMedia("(prefers-color-scheme: dark)").removeEventListener(
        "change",
        handleSchemeChange
      )
    }
  }, [])
  return colorScheme
}

/**
 * Regular intersection observer hook
 * @param options IntersectObserver options
 * @returns Ref to set on observed object and a boolean indicating if the element is visible
 */
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (ref) {
      const observer = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      }, options)
      observer.observe(ref)
      return () => {
        observer.disconnect()
      }
    }
  }, [ref, options])
  return [setRef, isIntersecting] as const
}

/**
 * Hook that picks a subset of keys and only causes
 * a re-render when those keys change.
 * @param obj object to be picked
 * @param keys keys to select from the object
 * @returns subset of the object with only the selected keys
 */
export const usePick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const [picked, setPicked] = useState<Pick<T, K>>(obj)
  useEffect(
    () => {
      const p = {} as Pick<T, K>
      for (const key of keys) {
        p[key] = obj[key]
      }
      setPicked(p)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    keys.map((key) => obj[key])
  )
  return picked
}
