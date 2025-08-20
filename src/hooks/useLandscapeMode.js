import { useEffect } from 'react'

export function useLandscapeMode() {
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      const isMobile = window.innerWidth <= 768
      
      // Only add the class on mobile devices in landscape mode
      if (isMobile && isLandscape) {
        document.body.classList.add('mobile__landscape')
      } else {
        document.body.classList.remove('mobile__landscape')
      }
    }

    // Listen for orientation changes and window resize
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    // Initial check
    handleOrientationChange()

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
      // Clean up the class when component unmounts
      document.body.classList.remove('mobile__landscape')
    }
  }, [])
}
