import {useCallback, useEffect, useState} from 'react'

const useIsMobileViewport = (breakpoint = 992) => {
  const getMatches = useCallback(
    () => (typeof window !== 'undefined' ? window.innerWidth < breakpoint : false),
    [breakpoint]
  )

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(getMatches)

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(getMatches())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getMatches])

  return isMobileViewport
}

export default useIsMobileViewport
