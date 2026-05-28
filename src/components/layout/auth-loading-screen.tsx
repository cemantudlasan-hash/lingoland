"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

type AuthLoadingScreenProps = {
    action: 'login' | 'logout';
};

export function AuthLoadingScreen({ action }: AuthLoadingScreenProps) {
    const isLogin = action === 'login';
    const text = isLogin ? "Connecting to LingoLandVerse" : "Disconnecting from LingoLandVerse";
    
    // Split text into words for staggered fade in/up animation
    const words = text.split(" ");

    return (
        <div className="fixed inset-0 z-[200] flex h-screen w-screen flex-col items-center justify-center bg-[#090514] overflow-hidden">
            {/* Mesmerizing Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full filter blur-[80px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full filter blur-[100px] animate-pulse duration-[4000ms]" />
            
            <div className="relative z-10 flex flex-col items-center justify-center p-6">
                {/* Outer Ring Glow */}
                <div className="absolute w-[220px] h-[220px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-2xl animate-pulse" />

                {/* Animated Logo Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        rotate: 0 
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 15,
                        duration: 0.8 
                    }}
                    className="relative w-48 h-48 mb-8 select-none"
                >
                    {/* Glowing Accent Shadow behind the Logo */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 opacity-20 blur-xl scale-95" />

                    {/* Infinite Rotating & Pulsing Logo */}
                    <motion.img
                        src="/logo.png"
                        alt="LingoLandVerse Logo"
                        className="w-full h-full object-contain relative z-10"
                        animate={{
                            scale: [1, 1.04, 1],
                            rotate: [0, 360],
                            filter: [
                                "drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))",
                                "drop-shadow(0 0 25px rgba(99, 102, 241, 0.6))",
                                "drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))"
                            ]
                        }}
                        transition={{
                            scale: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            rotate: {
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            },
                            filter: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                    />
                </motion.div>

                {/* Animated Loading Text with Staggered Fade */}
                <div className="flex flex-wrap justify-center gap-x-2 text-center max-w-md">
                    {words.map((word, wordIndex) => (
                        <motion.span
                            key={wordIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: wordIndex * 0.15,
                                duration: 0.5,
                                ease: "easeOut"
                            }}
                            className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-100 to-white font-sans"
                        >
                            {word}
                        </motion.span>
                    ))}
                </div>

                {/* Pulsing Dots Indicator */}
                <div className="flex items-center gap-1.5 mt-4">
                    {[0, 1, 2].map((idx) => (
                        <motion.div
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
                            animate={{
                                scale: [0.6, 1.2, 0.6],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: idx * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
