import { motion, useScroll, useTransform } from 'framer-motion'

export default function AnimatedBackground({ isDarkMode }) {
  const MotionDiv = motion.div
  const { scrollY } = useScroll()

  // Scroll parallax effects remain the same
  const y1 = useTransform(scrollY, [0, 1200], [0, 280])
  const y2 = useTransform(scrollY, [0, 1200], [0, -220])
  const y3 = useTransform(scrollY, [0, 1200], [0, 160])

  // Optimization: Replacing expensive CSS blur filters with cheap CSS Radial Gradients
  const blob1 = isDarkMode 
    ? 'radial-gradient(circle, rgba(204, 66, 7, 0.12) 0%, rgba(209, 123, 87, 0) 70%)' 
    : 'radial-gradient(circle, rgba(209, 123, 87, 0.24) 0%, rgba(209, 123, 87, 0) 70%)'

  const blob2 = isDarkMode 
    ? 'radial-gradient(circle, rgba(74, 50, 36, 0.24) 0%, rgba(74, 50, 36, 0) 70%)' 
    : 'radial-gradient(circle, rgba(234, 214, 202, 0.40) 0%, rgba(234, 214, 202, 0) 70%)'

  const blob3 = isDarkMode 
    ? 'radial-gradient(circle, rgba(26, 26, 26, 0.50) 0%, rgba(26, 26, 26, 0) 70%)' 
    : 'radial-gradient(circle, rgba(242, 220, 202, 0.50) 0%, rgba(242, 220, 202, 0) 70%)'

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <MotionDiv
        style={{ y: y1, backgroundImage: blob1 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'linear',
        }}
        // Removed blur-[] classes and added will-change-transform for GPU acceleration
        className="absolute top-[-12%] left-[-14%] w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full transition-colors duration-700 will-change-transform"
      />

      <MotionDiv
        style={{ y: y2, backgroundImage: blob2 }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -70, 0],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-[36%] right-[-16%] w-[440px] sm:w-[620px] h-[440px] sm:h-[620px] rounded-full transition-colors duration-700 will-change-transform"
      />

      <MotionDiv
        style={{ y: y3, backgroundImage: blob3 }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-[-10%] left-[10%] w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full transition-colors duration-700 will-change-transform"
      />
    </div>
  )
}