import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            transition: { 
              repeat: Infinity, 
              duration: 2,
              ease: "linear" 
            }
          }}
          className="w-16 h-16"
        >
          <img 
            src="https://raw.githubusercontent.com/Nounspace/nounspace.ts/canary/public/images/tom_alerts.png" 
            alt="Tom's Summary"
            className="w-full h-full"
          />
        </motion.div>
        <motion.p
          animate={{ 
            opacity: [0.5, 1, 0.5],
            transition: { 
              repeat: Infinity, 
              duration: 1.5,
              times: [0, 0.5, 1]
            }
          }}
          className="text-lg font-medium text-gray-700"
        >
          Loading proposal...
        </motion.p>
      </motion.div>
    </div>
  );
};