import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 bg-white border-b border-gray-100 py-4 px-6 shadow-sm"
    >
      <div className="container mx-auto">
        <a 
          href="https://www.nounspace.com/s/nounspacetom" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3"
        >
          <img 
            src="https://raw.githubusercontent.com/Nounspace/nounspace.ts/canary/public/images/tom_alerts.png" 
            alt="Tom's Summary" 
            className="w-8 h-8"
          />
          <span className="font-bold text-xl text-gray-900">Tom's Summary</span>
        </a>
      </div>
    </motion.header>
  );
};