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

    // Signal all background systems to instantly pause RAF/canvas and heavy timers for buttery-smooth mobile transition
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lingoland_auth_loading_start'));
            document.body.classList.add('auth-transitioning');
        }
        return () => {
            if (typeof window !== 'undefined') {
                document.body.classList.remove('auth-transitioning');
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex h-screen w-screen flex-col items-center justify-center bg-[#090514] overflow-hidden select-none">
            {/* Mesmerizing Background Glows (Optimized for Mobile GPU Performance) */}
            <div className="absolute top-1/4 left-1/4 w-[260px] md:w-[350px] h-[260px] md:h-[350px] bg-purple-600/15 rounded-full filter blur-[40px] md:blur-[80px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[280px] md:w-[400px] h-[280px] md:h-[400px] bg-indigo-600/15 rounded-full filter blur-[50px] md:blur-[100px] animate-pulse duration-[4000ms] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center p-6">
                {/* Outer Ring Glow */}
                <div className="absolute md:w-[320px] md:h-[320px] w-[240px] h-[240px] rounded-full bg-indigo-500/10 blur-2xl md:blur-3xl animate-pulse pointer-events-none" />

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
                        stiffness: 120, 
                        damping: 16,
                        duration: 0.6 
                    }}
                    className="relative md:w-72 md:h-72 w-48 h-48 sm:w-56 sm:h-56 mb-8 select-none"
                >
                    {/* Glowing Accent Shadow behind the Logo (Hardware-accelerated CSS) */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/25 to-indigo-500/25 blur-xl scale-95 pointer-events-none" />

                    {/* Infinite Rotating & Pulsing Logo (Hardware Accelerated without CPU drop-shadow animation) */}
                    <motion.img
                        src="/logo.png"
                        alt="LingoLandVerse Logo"
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(139,92,246,0.55)]"
                        style={{ willChange: 'transform' }}
                        animate={{
                            scale: [1, 1.04, 1],
                            rotate: [0, 360],
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
                                delay: wordIndex * 0.1,
                                duration: 0.4,
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
