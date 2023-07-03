import React from 'react';
import './boxes.css';
import { motion } from 'framer-motion';

const childVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 }
};

const GridBox = ({ children }) => {
  return (
    <div className="gridbox">
      {children.map((child, i) => (
        <motion.div
          key={i}
          className="box"
          variants={childVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            delay: 0.15 * i,
            ease: [0, 0.71, 0.2, 1.01]
          }}
        >
          <div className={`div${i + 1}`}>{child}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default GridBox;
