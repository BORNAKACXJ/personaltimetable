import { useState, useEffect } from 'react'
import { Music, Heart, Calendar, Star } from 'lucide-react'
import './PersonalTimetableLoadingDialog.css'

export function PersonalTimetableLoadingDialog({ isVisible, userName }) {
  const [animationStep, setAnimationStep] = useState(0)



  useEffect(() => {
    if (isVisible) {
      // Start staggered animation sequence
      setAnimationStep(0)
      const steps = [1, 2, 3, 4, 5, 6, 7, 8]
      steps.forEach((step, index) => {
        setTimeout(() => setAnimationStep(step), index * 100)
      })
    } else {
      setAnimationStep(0)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="personal-timetable-loading-dialog">
      <div className="personal-timetable-loading-dialog__overlay"></div>
      
      <div className="personal-timetable-loading-dialog__content">
        <div className="personal-timetable-loading-dialog__header">
          <div className="personal-timetable-loading-dialog__title-section">
            <div className="personal-timetable-loading-dialog__title-actions">
              <h2>Loading Personal Timetable</h2>  
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
