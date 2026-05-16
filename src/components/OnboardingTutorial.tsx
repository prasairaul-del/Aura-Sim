import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Car, DollarSign, Brain, TrendingUp } from 'lucide-react'

interface OnboardingTutorialProps {
  onComplete: () => void
}

const steps = [
  {
    title: 'Welcome to Aura-Sim',
    description: 'Your luxury fleet management simulator. Track, manage, and optimize your high-end vehicle portfolio.',
    icon: TrendingUp,
  },
  {
    title: 'Manage Your Fleet',
    description: 'View all your vehicles, monitor their health, schedule maintenance, and track revenue generation in real-time.',
    icon: Car,
  },
  {
    title: 'Financial Ledger',
    description: 'Track income and expenses, scan receipts with OCR, and manage your transactions with full editing capabilities.',
    icon: DollarSign,
  },
  {
    title: 'Virtual COO',
    description: 'Get AI-powered strategic insights about your fleet performance and receive personalized recommendations.',
    icon: Brain,
  },
]

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem('aura-sim-onboarding')
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem('aura-sim-onboarding', 'true')
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  const handleSkip = () => {
    localStorage.setItem('aura-sim-onboarding', 'true')
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  const currentIcon = steps[currentStep].icon
  const IconComponent = currentIcon

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                aria-label="Close tutorial"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress indicator */}
              <div className="flex gap-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      index <= currentStep ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <IconComponent className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold mb-3">{steps[currentStep].title}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                {steps[currentStep].description}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white/60 hover:text-white/80 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-onyx-950 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
