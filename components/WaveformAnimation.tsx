/**
 * Visual animation component representing an audio waveform.
 * It uses Framer Motion to create dynamic, pulsing bars that respond to an active state, providing visual feedback during recording.
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const WaveformAnimation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  const bars = Array.from({ length: 12 });

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isActive ? 'bg-copper' : 'bg-navy/30'}`}
          animate={isActive ? {
            height: [10, 40, 20, 35, 15, 40],
          } : {
            height: 10,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};
